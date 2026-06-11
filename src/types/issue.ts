export type IssueType =
  | "input_file_not_found"
  | "schema_file_not_found"
  | "no_json_found"
  | "invalid_json"
  | "truncated_output"
  | "unescaped_quote"
  | "schema_deviation"
  | "unexpected_field"
  | "validation_error"
  | "write_error"
  | "unknown_error";

export type Severity = "info" | "warning" | "critical";

export interface ContractIssue {
  type: IssueType;
  severity: Severity;
  message: string;
  path?: string;
}
