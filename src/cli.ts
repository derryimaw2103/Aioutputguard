#!/usr/bin/env node
import { Command } from "commander";
import { runCheck } from "./commands/check.js";

const program = new Command();

program
  .name("ai-output-guard")
  .description("Validate AI-generated JSON against an explicit output contract.")
  .version("0.0.0");

program
  .command("check")
  .description("Clean, parse, and validate raw AI output.")
  .requiredOption("--input <path>", "Path to the raw AI output file.")
  .requiredOption("--schema <path>", "Path to the JSON Schema file.")
  .option("--clean-output <path>", "Path to write the clean JSON output.")
  .requiredOption("--report <path>", "Path to write the report JSON.")
  .option("--overwrite", "Overwrite the input file with clean JSON.")
  .option("--no-fail", "Return exit code 0 even when validation fails.")
  .option("--verbose-report", "Write a detailed report JSON.")
  .option("--pretty", "Write pretty-formatted clean JSON.")
  .action(async (options) => {
    try {
      const result = await runCheck({
        input: options.input,
        schema: options.schema,
        cleanOutput: options.cleanOutput,
        report: options.report,
        overwrite: Boolean(options.overwrite),
        noFail: Boolean(options.noFail),
        verboseReport: Boolean(options.verboseReport),
        pretty: Boolean(options.pretty)
      });

      console.log(result.terminalOutput);
      process.exitCode = result.exitCode;
    } catch (error) {
      console.error(error instanceof Error ? error.message : String(error));
      process.exitCode = 2;
    }
  });

program.parseAsync();
