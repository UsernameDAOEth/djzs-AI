#!/usr/bin/env node

import { Command } from "commander";
import { healthCommand } from "../src/commands/health.js";
import { initCommand } from "../src/commands/init.js";
import { auditCommand } from "../src/commands/audit.js";

const program = new Command();

program
  .name("djzs")
  .version("0.1.0")
  .description("DJZS — Adversarial Logic Auditor for Trading Bots");

program.addCommand(healthCommand);
program.addCommand(initCommand);
program.addCommand(auditCommand);

program.parseAsync();
