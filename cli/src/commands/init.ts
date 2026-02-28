import { Command } from "commander";
import chalk from "chalk";
import { ethers } from "ethers";
import { writeFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const CONFIG_FILE = ".djzs.json";

interface DjzsConfig {
  agent_id: string;
  api_url: string;
  default_tier: string;
  default_channel: string;
  created_at: string;
}

export const initCommand = new Command("init")
  .description("Initialize DJZS agent identity and local config")
  .option(
    "-u, --url <url>",
    "API base URL",
    process.env.DJZS_API_URL ?? "http://localhost:5000"
  )
  .option("-f, --force", "Overwrite existing config", false)
  .action(async (opts) => {
    const configPath = resolve(process.cwd(), CONFIG_FILE);

    if (existsSync(configPath) && !opts.force) {
      console.log("");
      console.log(
        chalk.yellow(
          `  ⚠ Config already exists at ${configPath}`
        )
      );
      console.log(
        chalk.gray("  Run with --force to overwrite.")
      );
      console.log("");
      process.exit(0);
    }

    console.log("");
    console.log(chalk.bold("  ╔══════════════════════════════════════╗"));
    console.log(chalk.bold("  ║  DJZS CLI v0.1.0                    ║"));
    console.log(chalk.bold("  ║  Adversarial Logic Auditor           ║"));
    console.log(chalk.bold("  ╚══════════════════════════════════════╝"));
    console.log("");

    const wallet = ethers.Wallet.createRandom();

    const config: DjzsConfig = {
      agent_id: wallet.address,
      api_url: opts.url.replace(/\/+$/, ""),
      default_tier: "micro",
      default_channel: "rest",
      created_at: new Date().toISOString(),
    };

    writeFileSync(configPath, JSON.stringify(config, null, 2) + "\n", "utf-8");

    console.log(`  ${chalk.green("→")} Agent wallet generated`);
    console.log(
      `  ${chalk.green("→")} Address: ${chalk.cyan(wallet.address)}`
    );
    console.log(
      `  ${chalk.green("→")} Config saved to ${chalk.gray(configPath)}`
    );
    console.log("");
    console.log(chalk.gray("  ─────────────────────────────────"));
    console.log(
      chalk.yellow.bold("  ⚠ PRIVATE KEY — SAVE THIS NOW. IT WILL NOT BE SHOWN AGAIN.")
    );
    console.log("");
    console.log(`  ${chalk.red(wallet.privateKey)}`);
    console.log("");
    console.log(chalk.gray("  ─────────────────────────────────"));
    console.log("");
    console.log(
      chalk.gray(
        "  Fund this wallet with USDC on Base to use paid audit tiers."
      )
    );
    console.log(
      chalk.gray("  Or use the free tier for basic schema validation.")
    );
    console.log("");
  });
