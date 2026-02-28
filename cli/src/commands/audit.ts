import { Command } from "commander";
import chalk from "chalk";
import ora from "ora";
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const CONFIG_FILE = ".djzs.json";

interface DjzsConfig {
  agent_id: string;
  api_url: string;
  default_tier: string;
  default_channel: string;
}

interface AuditFlag {
  code: string;
  severity: string;
  description: string;
}

interface AuditResponse {
  verdict: string;
  risk_score: number;
  flags?: AuditFlag[];
  proof?: {
    logic_hash?: string;
    timestamp?: string;
    payment_verified?: boolean;
    payment_proof?: string;
  };
  irys_tx_id?: string;
  irys_url?: string;
  error?: string;
}

function loadConfig(): DjzsConfig | null {
  const configPath = resolve(process.cwd(), CONFIG_FILE);
  if (!existsSync(configPath)) return null;

  try {
    const raw = readFileSync(configPath, "utf-8");
    return JSON.parse(raw) as DjzsConfig;
  } catch {
    return null;
  }
}

function severityColor(severity: string): (text: string) => string {
  switch (severity.toUpperCase()) {
    case "HIGH":
    case "CRITICAL":
      return chalk.red;
    case "MEDIUM":
      return chalk.yellow;
    case "LOW":
      return chalk.cyan;
    default:
      return chalk.gray;
  }
}

function verdictDisplay(verdict: string): string {
  const v = verdict.toUpperCase();
  if (v === "PASS") return chalk.green.bold("PASS ✓");
  if (v === "FAIL") return chalk.red.bold("FAIL ✗");
  return chalk.yellow.bold(v);
}

function riskColor(score: number): string {
  if (score <= 30) return chalk.green(`${score}/100`);
  if (score <= 60) return chalk.yellow(`${score}/100`);
  return chalk.red(`${score}/100`);
}

export const auditCommand = new Command("audit")
  .description("Submit a strategy memo for adversarial audit")
  .argument("<memo>", "Strategy memo or trade description to audit")
  .option("-t, --tier <tier>", "Audit tier (micro | treasury)", "micro")
  .option("-u, --url <url>", "API base URL override")
  .option("--json", "Output raw JSON for piping", false)
  .action(async (memo: string, opts) => {
    const config = loadConfig();

    const apiUrl = (
      opts.url ??
      config?.api_url ??
      process.env.DJZS_API_URL ??
      "http://localhost:5000"
    ).replace(/\/+$/, "");

    const agentId = config?.agent_id ?? "anonymous";
    const tier = opts.tier ?? config?.default_tier ?? "micro";

    if (!config && !opts.json) {
      console.log("");
      console.log(
        chalk.yellow(
          "  ⚠ No .djzs.json found. Run `djzs init` first for full features."
        )
      );
      console.log(
        chalk.gray("  Proceeding as anonymous agent...")
      );
    }

    const spinner = opts.json ? null : ora("Submitting audit to DJZS Oracle...").start();

    try {
      const body = {
        strategy_memo: memo,
        audit_type: tier,
        agent_id: agentId,
        target_system: "cli",
      };

      const res = await fetch(`${apiUrl}/api/audit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(30_000),
      });

      if (!res.ok) {
        const errText = await res.text().catch(() => "No response body");
        spinner?.fail(
          chalk.red(`API returned HTTP ${res.status}: ${errText}`)
        );
        process.exit(1);
      }

      const data = (await res.json()) as AuditResponse;
      spinner?.stop();

      if (opts.json) {
        console.log(JSON.stringify(data, null, 2));
        process.exit(data.verdict?.toUpperCase() === "FAIL" ? 1 : 0);
      }

      console.log("");
      console.log(chalk.bold("  DJZS AUDIT RESULT"));
      console.log(chalk.gray("  ─────────────────────────────────"));
      console.log(`  Verdict:      ${verdictDisplay(data.verdict)}`);
      console.log(`  Risk Score:   ${riskColor(data.risk_score)}`);
      console.log(`  Tier:         ${chalk.white(tier)}`);
      console.log(`  Agent:        ${chalk.gray(agentId)}`);

      if (data.flags && data.flags.length > 0) {
        console.log("");
        console.log(chalk.bold("  Flags:"));
        for (const flag of data.flags) {
          const sev = severityColor(flag.severity);
          console.log(
            `   ${sev("⚠")} ${chalk.white(flag.code.padEnd(12))} ${sev(flag.severity.padEnd(8))} `
          );
          console.log(
            `     ${chalk.gray(flag.description)}`
          );
        }
      }

      if (data.proof) {
        console.log("");
        if (data.proof.logic_hash) {
          console.log(
            `  Logic Hash:   ${chalk.gray(data.proof.logic_hash)}`
          );
        }
        if (data.proof.payment_verified !== undefined) {
          console.log(
            `  Payment:      ${data.proof.payment_verified ? chalk.green("verified") : chalk.yellow("not verified")}`
          );
        }
      }

      if (data.irys_tx_id) {
        console.log(
          `  Irys TX:      ${chalk.gray(data.irys_tx_id)}`
        );
      }
      if (data.irys_url) {
        console.log(
          `  ProofOfLogic: ${chalk.cyan(data.irys_url)}`
        );
      }

      console.log(chalk.gray("  ─────────────────────────────────"));
      console.log("");

      process.exit(data.verdict?.toUpperCase() === "FAIL" ? 1 : 0);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Unknown error";

      if (message.includes("ECONNREFUSED")) {
        spinner?.fail(
          chalk.red(
            `Cannot reach ${apiUrl} — is the server running?`
          )
        );
      } else if (message.includes("TimeoutError") || message.includes("abort")) {
        spinner?.fail(chalk.red("Audit request timed out (30s)"));
      } else {
        spinner?.fail(chalk.red(`Audit failed: ${message}`));
      }
      process.exit(1);
    }
  });
