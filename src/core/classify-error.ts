import type { ContractIssue } from "../types/issue.js";
import type { JsonCandidate } from "./extract-json.js";

export const UNESCAPED_QUOTE_RETRY_PROMPT =
  'Return ONLY valid JSON.\nEscape all double quotes inside string values using \\".\nDo not wrap the JSON in markdown.\nDo not add explanation before or after JSON.';

export const SCHEMA_RETRY_PROMPT =
  "Return ONLY valid JSON that exactly follows this schema. Do not rename fields. Do not add extra fields. Do not omit required fields.";

export function classifyParseError(error: SyntaxError, candidate: JsonCandidate): ContractIssue {
  const message = error.message;

  if (looksLikeUnescapedQuote(message, candidate)) {
    return {
      type: "unescaped_quote",
      severity: "critical",
      message: "JSON contains a likely unescaped quote inside a string value."
    };
  }

  if (!candidate.complete || /Unexpected end of JSON input/i.test(message)) {
    return {
      type: "truncated_output",
      severity: "critical",
      message:
        "JSON appears to be truncated. Increase max tokens, split generation into smaller chunks, or retry generation."
    };
  }

  return {
    type: "invalid_json",
    severity: "critical",
    message: `Invalid JSON: ${message}`
  };
}

export function suggestedRetryPromptForIssues(issues: ContractIssue[]): string | null {
  if (issues.some((issue) => issue.type === "unescaped_quote")) {
    return UNESCAPED_QUOTE_RETRY_PROMPT;
  }

  if (
    issues.some((issue) => issue.type === "schema_deviation" || issue.type === "unexpected_field")
  ) {
    return SCHEMA_RETRY_PROMPT;
  }

  return null;
}

function looksLikeUnescapedQuote(message: string, candidate: JsonCandidate): boolean {
  const trimmedCandidate = candidate.text.trim();
  const hasClosingBoundary =
    (candidate.jsonType === "object" && trimmedCandidate.endsWith("}")) ||
    (candidate.jsonType === "array" && trimmedCandidate.endsWith("]"));

  return (
    (!candidate.complete && hasClosingBoundary) ||
    /after property value/i.test(message) ||
    /Unexpected token [A-Za-z]/i.test(message) ||
    /Expected ',' or '}'/i.test(message)
  );
}
