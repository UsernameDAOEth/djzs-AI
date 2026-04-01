import { Hono } from "hono";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { createMcpHonoApp } from "@modelcontextprotocol/hono";
import { z } from "zod";

const IRYS_GRAPHQL = "https://uploader.irys.xyz/graphql";
const IRYS_GATEWAY = "https://gateway.irys.xyz";

const TRUST_SCORE_CONTRACT = "0xB3324D07A8713b354435FF0e2A982A504e81b137";
const ESCROW_CONTRACT = "0xB041760147a60F63Ca701da9e431412bCc25Cfb7";
const AGENT_REGISTRY_CONTRACT = "0xe40d5669Ce8e06A91188B82Ce7292175E2013E41";
const STAKING_CONTRACT = "0xA362947D23D52C05a431E378F30C8A962De91e8A";

const FAILURE_CODES = [
  { code: "DJZS-S01", name: "CIRCULAR_LOGIC", category: "Structural", description: "Strategy conclusion is derived from its own premises without independent validation" },
  { code: "DJZS-S02", name: "MISSING_FALSIFIABILITY", category: "Structural", description: "Strategy cannot be disproven by any observable outcome — unfalsifiable thesis" },
  { code: "DJZS-E01", name: "CONFIRMATION_TUNNEL", category: "Epistemic", description: "Evidence selection is biased toward confirming a predetermined conclusion" },
  { code: "DJZS-E02", name: "AUTHORITY_SUBSTITUTION", category: "Epistemic", description: "Argument relies on authority claims rather than verifiable evidence" },
  { code: "DJZS-I01", name: "MISALIGNED_INCENTIVE", category: "Incentive", description: "Agent incentives conflict with stated strategy objectives" },
  { code: "DJZS-I02", name: "NARRATIVE_DEPENDENCY", category: "Incentive", description: "Strategy viability depends on a specific narrative remaining dominant" },
  { code: "DJZS-X01", name: "UNHEDGED_EXECUTION", category: "Execution", description: "No downside protection or exit strategy defined" },
  { code: "DJZS-X02", name: "LIQUIDITY_RISK", category: "Execution", description: "Strategy assumes liquidity conditions that may not hold" },
  { code: "DJZS-X03", name: "SLIPPAGE_EXPOSURE", category: "Execution", description: "Expected execution price may deviate significantly from actual fill" },
  { code: "DJZS-T01", name: "STALE_DATA_DEPENDENCY", category: "Temporal", description: "Strategy relies on data that may be outdated by execution time" },
  { code: "DJZS-T02", name: "RACE_CONDITION_RISK", category: "Temporal", description: "Strategy outcome depends on timing that cannot be guaranteed" },
];

const TOOLS_LIST = ["query_pol_certificates", "query_agent_trust"];

interface IrysTag {
  name: string;
  value: string;
}

interface IrysTransactionNode {
  id: string;
  address: string;
  tags: IrysTag[];
}

interface IrysTransactionEdge {
  node: IrysTransactionNode;
}

interface IrysGraphQLResponse {
  data?: {
    transactions?: {
      edges?: IrysTransactionEdge[];
    };
  };
  errors?: Array<{ message: string }>;
}

interface CertificateRecord {
  irys_id: string;
  irys_url: string;
  verdict: string;
  tier: string;
  target_system: string;
  audit_id: string | null;
  risk_score: string | null;
  flag_codes: string | null;
  timestamp: string | null;
  agent_id: string | null;
}

function createServer(): McpServer {
  const server = new McpServer({
    name: "djzs-trust-mcp",
    version: "1.0.0",
  });

  server.registerTool(
    "query_pol_certificates",
    {
      description:
        "Query ProofOfLogic audit certificates from Irys Datachain. " +
        "Certificates are immutable records of DJZS adversarial audits stored permanently on Irys. " +
        "Filter by target system, verdict (PASS/FAIL), audit tier (micro/founder/treasury), or specific Irys transaction ID.",
      inputSchema: {
        target_system: z.string().optional().describe("Filter by target system or audit type (e.g. 'general', 'defi', 'trading')"),
        verdict: z.enum(["PASS", "FAIL"]).optional().describe("Filter by audit verdict"),
        tier: z.enum(["micro", "founder", "treasury"]).optional().describe("Filter by audit tier"),
        irys_tx_id: z.string().optional().describe("Fetch a specific certificate by Irys transaction ID"),
        limit: z.number().min(1).max(100).default(20).describe("Maximum number of certificates to return"),
      },
    },
    async ({ target_system, verdict, tier, irys_tx_id, limit }) => {
      if (irys_tx_id) {
        try {
          const resp = await fetch(`${IRYS_GATEWAY}/${irys_tx_id}`);
          if (!resp.ok) {
            return {
              content: [{ type: "text" as const, text: JSON.stringify({ error: `Certificate ${irys_tx_id} not found (HTTP ${resp.status})` }) }],
            };
          }
          const cert: unknown = await resp.json();
          return {
            content: [{
              type: "text" as const,
              text: JSON.stringify({
                irys_id: irys_tx_id,
                irys_url: `${IRYS_GATEWAY}/${irys_tx_id}`,
                certificate: cert,
              }, null, 2),
            }],
          };
        } catch (err) {
          return {
            content: [{ type: "text" as const, text: JSON.stringify({ error: `Failed to fetch certificate: ${String(err)}` }) }],
          };
        }
      }

      const tags: Array<{ name: string; values: string[] }> = [
        { name: "application-id", values: ["DJZS-Oracle"] },
        { name: "protocol", values: ["ProofOfLogic"] },
      ];

      if (verdict) tags.push({ name: "verdict", values: [verdict] });
      if (tier) tags.push({ name: "tier", values: [tier] });
      if (target_system) tags.push({ name: "Audit-Type", values: [target_system] });

      const query = `
        query GetCertificates($tags: [TagFilter!], $first: Int) {
          transactions(tags: $tags, first: $first, order: DESC) {
            edges {
              node {
                id
                address
                tags { name value }
              }
            }
          }
        }
      `;

      try {
        const resp = await fetch(IRYS_GRAPHQL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            query,
            variables: { tags, first: limit },
          }),
        });

        if (!resp.ok) {
          return {
            content: [{ type: "text" as const, text: JSON.stringify({ error: `Irys GraphQL returned HTTP ${resp.status}` }) }],
          };
        }

        const data = (await resp.json()) as IrysGraphQLResponse;

        if (data.errors) {
          return {
            content: [{ type: "text" as const, text: JSON.stringify({ error: "Irys GraphQL error", details: data.errors }) }],
          };
        }

        const edges = data.data?.transactions?.edges ?? [];

        const certificates: CertificateRecord[] = edges.map((edge) => {
          const node = edge.node;
          const tagMap: Record<string, string> = {};
          for (const t of node.tags) tagMap[t.name] = t.value;

          return {
            irys_id: node.id,
            irys_url: `${IRYS_GATEWAY}/${node.id}`,
            verdict: tagMap["verdict"] || "unknown",
            tier: tagMap["tier"] || "unknown",
            target_system: tagMap["Audit-Type"] || "general",
            audit_id: tagMap["audit-id"] || null,
            risk_score: tagMap["Risk-Score"] || null,
            flag_codes: tagMap["Flag-Codes"] || null,
            timestamp: tagMap["Timestamp"] || null,
            agent_id: tagMap["Agent-Id"] || null,
          };
        });

        const passCount = certificates.filter((c) => c.verdict === "PASS").length;
        const failCount = certificates.filter((c) => c.verdict === "FAIL").length;

        return {
          content: [{
            type: "text" as const,
            text: JSON.stringify({
              total: certificates.length,
              pass_count: passCount,
              fail_count: failCount,
              certificates,
            }, null, 2),
          }],
        };
      } catch (err) {
        return {
          content: [{ type: "text" as const, text: JSON.stringify({ error: `Irys GraphQL query failed: ${String(err)}` }) }],
        };
      }
    }
  );

  server.registerTool(
    "query_agent_trust",
    {
      description:
        "Query on-chain trust score for an AI agent from the DJZSLogicTrustScore contract on Base Mainnet. " +
        "Currently returns a pending status — this tool will activate after the DJZS subgraph is deployed to The Graph Network.",
      inputSchema: {
        agent_address: z.string().describe("Ethereum wallet address of the agent to query (e.g. 0x...)"),
      },
    },
    async ({ agent_address }) => {
      return {
        content: [{
          type: "text" as const,
          text: JSON.stringify({
            status: "pending_subgraph_deploy",
            agent_address,
            message: "On-chain trust score queries will activate after the DJZS subgraph is deployed to The Graph Network. " +
              "The DJZSLogicTrustScore contract is live at " + TRUST_SCORE_CONTRACT + " on Base Mainnet (chain ID 8453). " +
              "Trust scores are recorded via the updateScore function and can be read via getLatestScore(agent). " +
              "The subgraph will index all ScoreUpdated events for historical querying.",
            contract: TRUST_SCORE_CONTRACT,
            chain: "base",
            chain_id: 8453,
            abi_functions: ["getLatestScore(address) → (uint256 riskScore, string verdict, uint256 timestamp, uint256 totalAudits)"],
            related_contracts: {
              escrow_lock: ESCROW_CONTRACT,
              agent_registry: AGENT_REGISTRY_CONTRACT,
              staking: STAKING_CONTRACT,
            },
            failure_taxonomy: {
              name: "DJZS-LF",
              version: "1.0",
              total_codes: FAILURE_CODES.length,
              codes: FAILURE_CODES,
            },
          }, null, 2),
        }],
      };
    }
  );

  return server;
}

const mcpServer = createServer();

const mcpApp = createMcpHonoApp({ server: mcpServer });

const app = new Hono();

app.get("/", (c) => {
  return c.json({
    name: "djzs-trust-mcp",
    version: "1.0.0",
    description: "DJZS Protocol MCP Server — ProofOfLogic certificate queries and agent trust scores",
    tools: TOOLS_LIST,
    mcp_endpoint: "/mcp",
    status: "operational",
    protocol: {
      name: "DJZS Protocol",
      agent_id: 29515,
      chain: "base",
      chain_id: 8453,
    },
  });
});

app.route("/mcp", mcpApp);

export default app;
