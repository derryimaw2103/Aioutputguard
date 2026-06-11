import { Ajv, type AnySchema, type ErrorObject } from "ajv/dist/ajv.js";
import type { ContractIssue } from "../types/issue.js";

export interface SchemaValidationResult {
  valid: boolean;
  issues: ContractIssue[];
}

export function validateAgainstSchema(data: unknown, schema: unknown): SchemaValidationResult {
  const ajv = new Ajv({
    allErrors: true,
    strict: false
  });

  const validate = ajv.compile(schema as AnySchema);
  const valid = validate(data);

  if (valid) {
    return {
      valid: true,
      issues: []
    };
  }

  return {
    valid: false,
    issues: (validate.errors ?? []).map(schemaErrorToIssue)
  };
}

function schemaErrorToIssue(error: ErrorObject): ContractIssue {
  if (error.keyword === "required") {
    const missingProperty = String(error.params.missingProperty);
    return {
      type: "schema_deviation",
      severity: "critical",
      message: `Missing required field: ${missingProperty}`,
      path: joinJsonPointer(error.instancePath, missingProperty)
    };
  }

  if (error.keyword === "additionalProperties") {
    const additionalProperty = String(error.params.additionalProperty);
    return {
      type: "unexpected_field",
      severity: "critical",
      message: `Unexpected field: ${additionalProperty}`,
      path: joinJsonPointer(error.instancePath, additionalProperty)
    };
  }

  return {
    type: "validation_error",
    severity: "critical",
    message: error.message
      ? `Schema validation error: ${error.message}`
      : "Schema validation failed",
    path: error.instancePath || undefined
  };
}

function joinJsonPointer(base: string, segment: string): string {
  const escaped = segment.replace(/~/g, "~0").replace(/\//g, "~1");
  return `${base || ""}/${escaped}`;
}
