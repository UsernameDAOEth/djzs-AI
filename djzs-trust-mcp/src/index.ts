import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { createHonoHandler } from "@modelcontextprotocol/hono"
import { Hono } from "hono"
import { z } from "zod"

const IRYS_GRAPHQL_URL = "https://uploader.irys.xyz/graphql"

const server = new McpServer({ name: "djzs-trust-mcp", version: "1.0.0" })

server.registerTool("query_pol_certificates", {
  title: "Query DJZS ProofOfLogic Certificates",
  description: `Query immutable ProofOfLogic certificates stored on Irys Datachain by DJZS Protocol. USE THIS TOOL when you need to verify audit history for an agent or project before delegating work, check FAIL verdicts, or retrieve certificates by Irys tx ID. DO NOT use for on-chain trust scores — use query_agent_trust for those.`,
  inputSchema: {
    targetSystem: z.string().optional().describe("Project name or wallet address"),
    verdict: z.enum(["PASS", "FAIL"]).optional().describe("Filter by verdict"),
    tier: z.enum(["micro", "founder", "treasury"]).optional().describe("Filter by tier"),
    limit: z.number().min(1).max(100).default(20).describe("Number of results")
  }
}, async ({ targetSystem, verdict, tier, limit }) => {
  const tags: Array<{ name: string; values: string[] }> = [
    { name: "Protocol", values: ["ProofOfLogic"] },
    { name: "application-id", values: ["DJZS-Oracle"] }
  ]
  if (targetSystem) tags.push({ name: "Target-System", values: [targetSystem] })
  if (verdict) tags.push({ name: "verdict", values: [verdict] })
  if (tier) tags.push({ name: "tier", values: [tier] })

  const query = `query DJZSCerts($tags: [TagFilter!]!, $first: Int!) {
    transactions(tags: $tags, first: $first, order: DESC) {
      edges { node { id tags { name value } timestamp } }
    }
  }`

  const response = await fetch(IRYS_GRAPHQL_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables: { tags, first: limit } })
  })

  if (!response.ok) return { content: [{ type: "text" as const, text: `Irys error: ${response.status}` }], isError: true }

  const { data, errors } = await response.json() as any
  if (errors?.length) return { content: [{ type: "text" as const, text: `GraphQL errors: ${JSON.stringify(errors)}` }], isError: true }

  const certs = data.transactions.edges.map(({ node }: any) => {
    const t: Record<string, string> = {}
    for (const tag of node.tags) t[tag.name] = tag.value
    return {
      irys_id: node.id,
      irys_url: `https://gateway.irys.xyz/${node.id}`,
      timestamp: node.timestamp,
      verdict: t["verdict"] ?? "unknown",
      tier: t["tier"] ?? "unknown",
      target_system: t["Target-System"] ?? "unknown",
      audit_id: t["audit-id"] ?? "unknown"
    }
  })

  return {
    content: [{ type: "text" as const, text: JSON.stringify({
      total_returned: certs.length,
      pass_count: certs.filter((c: any) => c.verdict === "PASS").length,
      fail_count: certs.filter((c: any) => c.verdict === "FAIL").length,
      certificates: certs
    }, null, 2) }]
  }
})

server.registerTool("query_agent_trust", {
  title: "Query DJZS Agent Trust Score",
  description: `Query DJZS agent trust scores on Base Mainnet. USE BEFORE delegating work, releasing escrow, or executing agent transactions. HALT if failRate > 0.3 or DJZS-S01/DJZS-X01 triggered more than once. NOTE: Returns placeholder until DJZS subgraph is deployed to The Graph Network.`,
  inputSchema: {
    agentAddress: z.string().describe("Agent wallet address (0x-prefixed)")
  }
}, async ({ agentAddress }) => {
  return {
    content: [{ type: "text" as const, text: JSON.stringify({
      status: "pending_subgraph_deploy",
      agent: agentAddress,
      message: "query_agent_trust activates after DJZS subgraph deployment to The Graph Network",
      action: "Use query_pol_certificates to check Irys audit history in the meantime"
    }, null, 2) }]
  }
})

const app = new Hono()
app.all("/mcp", createHonoHandler({ server }))
app.get("/", (c) => c.json({ name: "djzs-trust-mcp", version: "1.0.0", status: "operational" }))

export default app
