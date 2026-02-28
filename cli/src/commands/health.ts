import { Command } from "commander";
import chalk from "chalk";
import ora from "ora";

const STATUS_ICON: Record<string, string> = {
  healthy: chalk.green("✓ healthy"),
  connected: chalk.green("✓ connected"),
  reachable: chalk.green("✓ reachable"),
  configured: chalk.green("✓ configured"),
  active: chalk.green("✓ active"),
  not_configured: chalk.yellow("⚠ not configured"),
  disconnected: chalk.red("✗ disconnected"),
  unreachable: chalk.red("✗ unreachable"),
  error: chalk.red("✗ error"),
};

function formatStatus(status: string): string {
  return STATUS_ICON[status] ?? chalk.gray(`? ${status}`);
}

export const healthCommand = new Command("health")
  .description("Check DJZS Oracle service status")
  .option(
    "-u, --url <url>",
    "API base URL",
    process.env.DJZS_API_URL ?? "http://localhost:5000"
  )
  .action(async (opts) => {
    const spinner = ora("Checking DJZS Oracle health...").start();
    const baseUrl = opts.url.replace(/\/+$/, "");

    try {
      const res = await fetch(`${baseUrl}/api/health`, {
        signal: AbortSignal.timeout(10_000),
      });

      if (!res.ok) {
        spinner.fail(
          chalk.red(`Health endpoint returned HTTP ${res.status}`)
        );
        process.exit(1);
      }

      const data = (await res.json()) as Record<string, unknown>;
      spinner.stop();

      console.log("");
      console.log(
        chalk.bold("  DJZS Oracle Status")
      );
      console.log(chalk.gray("  ─────────────────────────────────"));

      const components: Record<string, string> =
        typeof data.components === "object" && data.components !== null
          ? (data.components as Record<string, string>)
          : (Object.fromEntries(
              Object.entries(data).map(([k, v]) => [k, String(v)])
            ) as Record<string, string>);

      const labelWidth = Math.max(
        ...Object.keys(components).map((k) => k.length)
      );

      for (const [component, status] of Object.entries(components)) {
        const label = component
          .replace(/_/g, " ")
          .replace(/\b\w/g, (c) => c.toUpperCase())
          .padEnd(labelWidth + 2);
        console.log(`  ${chalk.white(label)} ${formatStatus(status)}`);
      }

      console.log(chalk.gray("  ─────────────────────────────────"));
      console.log(chalk.gray(`  Endpoint: ${baseUrl}/api/health`));
      console.log("");
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Unknown error";

      if (message.includes("ECONNREFUSED")) {
        spinner.fail(
          chalk.red(`Cannot reach ${baseUrl} — is the server running?`)
        );
      } else if (message.includes("TimeoutError") || message.includes("abort")) {
        spinner.fail(chalk.red(`Request to ${baseUrl} timed out (10s)`));
      } else {
        spinner.fail(chalk.red(`Health check failed: ${message}`));
      }
      process.exit(1);
    }
  });
