import type { ContractIssue } from "../types/issue.js";
import type { GuardReport, ParserMetadata, SchemaMetadata } from "../types/report.js";
import type { CleaningAction } from "./clean-output.js";
import { suggestedRetryPromptForIssues } from "./classify-error.js";

export interface BuildReportInput {
  status: "passed" | "failed";
  cleaned: boolean;
  cleanOutputPath: string | null;
  issues: ContractIssue[];
  verbose: boolean;
  cleaningActions: CleaningAction[];
  parser: ParserMetadata;
  schema: SchemaMetadata;
  checkedAt?: Date;
}

export function buildReport(input: BuildReportInput): GuardReport {
  const base = {
    status: input.status,
    cleaned: input.cleaned,
    cleanOutputPath: input.cleanOutputPath,
    issues: input.issues,
    suggestedRetryPrompt: suggestedRetryPromptForIssues(input.issues)
  };

  if (!input.verbose) {
    return base;
  }

  return {
    ...base,
    cleaningActions: input.cleaningActions,
    parser: input.parser,
    schema: input.schema,
    timestamps: {
      checkedAt: (input.checkedAt ?? new Date()).toISOString()
    }
  };
}
