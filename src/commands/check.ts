import { resolve } from "node:path";
import { buildReport } from "../core/build-report.js";
import { cleanOutput } from "../core/clean-output.js";
import { classifyParseError } from "../core/classify-error.js";
import { parseJson } from "../core/parse-json.js";
import { validateAgainstSchema } from "../core/validate-schema.js";
import type { ContractIssue } from "../types/issue.js";
import type { GuardReport, ParserMetadata, SchemaMetadata } from "../types/report.js";
import { EXIT_CODE, type ExitCode } from "../utils/exit-code.js";
import { fileExists, readUtf8File, writeUtf8File } from "../utils/fs.js";

export interface CheckOptions {
  input: string;
  schema: string;
  cleanOutput?: string;
  report: string;
  overwrite?: boolean;
  noFail?: boolean;
  verboseReport?: boolean;
  pretty?: boolean;
}

export interface CheckResult {
  exitCode: ExitCode;
  report: GuardReport;
  terminalOutput: string;
}

export async function runCheck(options: CheckOptions, cwd = process.cwd()): Promise<CheckResult> {
  const inputPath = resolve(cwd, options.input);
  const schemaPath = resolve(cwd, options.schema);
  const reportPath = resolve(cwd, options.report);
  const cleanOutputPath = options.overwrite
    ? inputPath
    : options.cleanOutput
      ? resolve(cwd, options.cleanOutput)
      : null;

  const baseParser: ParserMetadata = {
    jsonFound: false,
    jsonType: null,
    parseError: null
  };
  const baseSchema: SchemaMetadata = {
    valid: false,
    schemaPath: options.schema
  };

  if (!cleanOutputPath) {
    return writeFailureReport({
      issue: {
        type: "write_error",
        severity: "critical",
        message: "--clean-output is required unless --overwrite is enabled."
      },
      options,
      reportPath,
      cleanOutputPath: null,
      parser: baseParser,
      schema: baseSchema,
      systemError: true
    });
  }

  if (!(await fileExists(inputPath))) {
    return writeFailureReport({
      issue: {
        type: "input_file_not_found",
        severity: "critical",
        message: `Input file not found: ${options.input}`
      },
      options,
      reportPath,
      cleanOutputPath: null,
      parser: baseParser,
      schema: baseSchema,
      systemError: true
    });
  }

  if (!(await fileExists(schemaPath))) {
    return writeFailureReport({
      issue: {
        type: "schema_file_not_found",
        severity: "critical",
        message: `Schema file not found: ${options.schema}`
      },
      options,
      reportPath,
      cleanOutputPath: null,
      parser: baseParser,
      schema: baseSchema,
      systemError: true
    });
  }

  const rawOutput = await readUtf8File(inputPath);
  const schemaText = await readUtf8File(schemaPath);
  const cleaned = cleanOutput(rawOutput);
  const parser: ParserMetadata = {
    jsonFound: cleaned.candidate !== null,
    jsonType: cleaned.candidate?.jsonType ?? null,
    parseError: null
  };

  let schema: unknown;
  try {
    schema = JSON.parse(schemaText);
  } catch (error) {
    return writeFailureReport({
      issue: {
        type: "validation_error",
        severity: "critical",
        message: `Schema file is not valid JSON: ${error instanceof Error ? error.message : String(error)}`
      },
      options,
      reportPath,
      cleanOutputPath: null,
      parser,
      schema: baseSchema,
      cleaned: cleaned.cleaned,
      cleaningActions: cleaned.actions,
      systemError: true
    });
  }

  if (!cleaned.candidate) {
    return writeFailureReport({
      issue: {
        type: "no_json_found",
        severity: "critical",
        message: "No JSON object or array found in AI output."
      },
      options,
      reportPath,
      cleanOutputPath: null,
      parser,
      schema: baseSchema,
      cleaned: cleaned.cleaned,
      cleaningActions: cleaned.actions
    });
  }

  const parsed = parseJson(cleaned.cleanedText);
  if (!parsed.ok) {
    parser.parseError = parsed.error.message;
    return writeFailureReport({
      issue: classifyParseError(parsed.error, cleaned.candidate),
      options,
      reportPath,
      cleanOutputPath: null,
      parser,
      schema: baseSchema,
      cleaned: cleaned.cleaned,
      cleaningActions: cleaned.actions
    });
  }

  const validation = validateAgainstSchema(parsed.value, schema);
  const schemaMetadata: SchemaMetadata = {
    valid: validation.valid,
    schemaPath: options.schema
  };

  if (!validation.valid) {
    return writeFailureReport({
      issues: validation.issues,
      options,
      reportPath,
      cleanOutputPath: null,
      parser,
      schema: schemaMetadata,
      cleaned: cleaned.cleaned,
      cleaningActions: cleaned.actions
    });
  }

  const serialized = JSON.stringify(parsed.value, null, options.pretty ? 2 : 0);
  await writeUtf8File(cleanOutputPath, options.pretty ? `${serialized}\n` : serialized);

  const report = buildReport({
    status: "passed",
    cleaned: cleaned.cleaned,
    cleanOutputPath: options.overwrite ? options.input : (options.cleanOutput ?? null),
    issues: [],
    verbose: Boolean(options.verboseReport),
    cleaningActions: cleaned.actions,
    parser,
    schema: schemaMetadata
  });

  await writeUtf8File(reportPath, `${JSON.stringify(report, null, 2)}\n`);

  const terminalOutput = formatTerminalOutput(report, options);
  return {
    exitCode: EXIT_CODE.passed,
    report,
    terminalOutput
  };
}

interface WriteFailureReportInput {
  issue?: ContractIssue;
  issues?: ContractIssue[];
  options: CheckOptions;
  reportPath: string;
  cleanOutputPath: string | null;
  parser: ParserMetadata;
  schema: SchemaMetadata;
  cleaned?: boolean;
  cleaningActions?: Array<"removed_markdown_code_block" | "removed_text_outside_json">;
  systemError?: boolean;
}

async function writeFailureReport(input: WriteFailureReportInput): Promise<CheckResult> {
  const issues = input.issues ?? (input.issue ? [input.issue] : []);
  const report = buildReport({
    status: "failed",
    cleaned: input.cleaned ?? false,
    cleanOutputPath: input.cleanOutputPath,
    issues,
    verbose: Boolean(input.options.verboseReport),
    cleaningActions: input.cleaningActions ?? [],
    parser: input.parser,
    schema: input.schema
  });

  await writeUtf8File(input.reportPath, `${JSON.stringify(report, null, 2)}\n`);

  const exitCode = input.systemError
    ? EXIT_CODE.systemError
    : input.options.noFail
      ? EXIT_CODE.passed
      : EXIT_CODE.validationFailed;

  return {
    exitCode,
    report,
    terminalOutput: formatTerminalOutput(report, input.options)
  };
}

function formatTerminalOutput(report: GuardReport, options: CheckOptions): string {
  if (report.status === "passed") {
    return [
      "PASSED",
      "",
      "AI Output Guard cleaned and validated the output.",
      "",
      `Cleaned: ${String(report.cleaned)}`,
      `Clean output: ${report.cleanOutputPath ?? "-"}`,
      `Report: ${options.report}`
    ].join("\n");
  }

  const heading = options.noFail ? "WARNING" : "FAILED";
  const description = options.noFail
    ? "AI output contract violated, but --no-fail is enabled."
    : "AI output contract violated.";
  const issueLines = report.issues.map((issue) => `- ${issue.message}`);
  const suggestedAction = report.suggestedRetryPrompt
    ? ["", "Suggested action:", report.suggestedRetryPrompt]
    : [];

  return [
    heading,
    "",
    description,
    "",
    "Issues:",
    ...(issueLines.length > 0 ? issueLines : ["- Unknown error"]),
    ...suggestedAction
  ].join("\n");
}
