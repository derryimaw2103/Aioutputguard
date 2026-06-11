import type { ContractIssue } from "./issue.js";

export type ReportStatus = "passed" | "failed";

export interface ParserMetadata {
  jsonFound: boolean;
  jsonType: "object" | "array" | null;
  parseError: string | null;
}

export interface SchemaMetadata {
  valid: boolean;
  schemaPath: string;
}

export interface SimpleReport {
  status: ReportStatus;
  cleaned: boolean;
  cleanOutputPath: string | null;
  issues: ContractIssue[];
  suggestedRetryPrompt: string | null;
}

export interface VerboseReport extends SimpleReport {
  cleaningActions: string[];
  parser: ParserMetadata;
  schema: SchemaMetadata;
  timestamps: {
    checkedAt: string;
  };
}

export type GuardReport = SimpleReport | VerboseReport;
