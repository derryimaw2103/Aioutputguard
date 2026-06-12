import { mkdtemp, readFile, rm, stat, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { runCheck } from "../src/commands/check.js";

let workspace: string;

beforeEach(async () => {
  workspace = await mkdtemp(join(tmpdir(), "ai-output-guard-"));
});

afterEach(async () => {
  await rm(workspace, { recursive: true, force: true });
});

describe("ai-output-guard check", () => {
  it("passes and cleans chatty preamble output", async () => {
    await writeFixture(
      "raw-output.txt",
      ["Tentu, berikut JSON-nya:", '{ "title": "Rahasia Miliarder" }', "Semoga sukses!"].join("\n")
    );
    await writeFixture("schema.json", titleSchema());

    const result = await runCheck(
      baseOptions({
        input: "raw-output.txt",
        schema: "schema.json",
        cleanOutput: "clean-output.json",
        report: "report.json"
      }),
      workspace
    );

    expect(result.exitCode).toBe(0);
    expect(result.report.status).toBe("passed");
    expect(result.report.cleaned).toBe(true);
    expect(await readFixture("clean-output.json")).toBe('{"title":"Rahasia Miliarder"}');
    expect(JSON.parse(await readFixture("report.json"))).toMatchObject({
      status: "passed",
      cleaned: true,
      cleanOutputPath: "clean-output.json",
      issues: []
    });
  });

  it("passes and records markdown code block cleaning", async () => {
    await writeFixture(
      "raw-output.txt",
      ["```json", '{ "title": "Rahasia Miliarder" }', "```"].join("\n")
    );
    await writeFixture("schema.json", titleSchema());

    const result = await runCheck(
      baseOptions({
        input: "raw-output.txt",
        schema: "schema.json",
        cleanOutput: "clean-output.json",
        report: "report.json",
        verboseReport: true
      }),
      workspace
    );

    expect(result.exitCode).toBe(0);
    expect(result.report.status).toBe("passed");
    expect(result.report.cleaned).toBe(true);
    expect("cleaningActions" in result.report ? result.report.cleaningActions : []).toContain(
      "removed_markdown_code_block"
    );
  });

  it("detects truncated JSON and does not write clean output", async () => {
    await writeFixture(
      "raw-output.txt",
      '{ "title": "Misteri Laut Dalam", "chapters": [ { "narasi": "Di kedalaman laut...'
    );
    await writeFixture("schema.json", titleSchema());

    const result = await runCheck(
      baseOptions({
        input: "raw-output.txt",
        schema: "schema.json",
        cleanOutput: "clean-output.json",
        report: "report.json"
      }),
      workspace
    );

    expect(result.exitCode).toBe(1);
    expect(result.report.status).toBe("failed");
    expect(result.report.issues[0]?.type).toBe("truncated_output");
    await expect(fileExists("clean-output.json")).resolves.toBe(false);
  });

  it("detects likely unescaped quotes and returns a retry prompt", async () => {
    await writeFixture(
      "raw-output.txt",
      '{ "script": "Elon Musk berkata, "Saya suka Mars", lalu tertawa." }'
    );
    await writeFixture(
      "schema.json",
      JSON.stringify({
        type: "object",
        required: ["script"],
        properties: {
          script: { type: "string" }
        },
        additionalProperties: false
      })
    );

    const result = await runCheck(
      baseOptions({
        input: "raw-output.txt",
        schema: "schema.json",
        cleanOutput: "clean-output.json",
        report: "report.json"
      }),
      workspace
    );

    expect(result.exitCode).toBe(1);
    expect(result.report.status).toBe("failed");
    expect(result.report.issues[0]?.type).toBe("unescaped_quote");
    expect(result.report.suggestedRetryPrompt).toContain("Escape all double quotes");
  });

  it("reports schema deviation and unexpected fields", async () => {
    await writeFixture("raw-output.txt", '{ "background_image": "hutan pinus" }');
    await writeFixture(
      "schema.json",
      JSON.stringify({
        type: "object",
        required: ["visual_keyword"],
        properties: {
          visual_keyword: { type: "string" }
        },
        additionalProperties: false
      })
    );

    const result = await runCheck(
      baseOptions({
        input: "raw-output.txt",
        schema: "schema.json",
        cleanOutput: "clean-output.json",
        report: "report.json"
      }),
      workspace
    );

    expect(result.exitCode).toBe(1);
    expect(result.report.status).toBe("failed");
    expect(result.report.issues.map((issue) => issue.type)).toEqual([
      "schema_deviation",
      "unexpected_field"
    ]);
    expect(result.report.suggestedRetryPrompt).toContain("exactly follows this schema");
  });

  it("writes pretty clean output when pretty mode is enabled", async () => {
    await writeFixture("raw-output.txt", '{ "title": "Rahasia Miliarder" }');
    await writeFixture("schema.json", titleSchema());

    const result = await runCheck(
      baseOptions({
        input: "raw-output.txt",
        schema: "schema.json",
        cleanOutput: "clean-output.json",
        report: "report.json",
        pretty: true
      }),
      workspace
    );

    expect(result.exitCode).toBe(0);
    expect(await readFixture("clean-output.json")).toBe(
      ["{", '  "title": "Rahasia Miliarder"', "}", ""].join("\n")
    );
  });

  it("keeps exit code 0 for validation failures when no-fail is enabled", async () => {
    await writeFixture("raw-output.txt", '{ "background_image": "hutan pinus" }');
    await writeFixture(
      "schema.json",
      JSON.stringify({
        type: "object",
        required: ["visual_keyword"],
        properties: {
          visual_keyword: { type: "string" }
        },
        additionalProperties: false
      })
    );

    const result = await runCheck(
      baseOptions({
        input: "raw-output.txt",
        schema: "schema.json",
        cleanOutput: "clean-output.json",
        report: "report.json",
        noFail: true
      }),
      workspace
    );

    expect(result.exitCode).toBe(0);
    expect(result.report.status).toBe("failed");
    expect(result.terminalOutput).toContain("WARNING");
  });

  it("returns exit code 2 and writes a report when the input file is missing", async () => {
    await writeFixture("schema.json", titleSchema());

    const result = await runCheck(
      baseOptions({
        input: "missing.txt",
        schema: "schema.json",
        cleanOutput: "clean-output.json",
        report: "report.json"
      }),
      workspace
    );

    expect(result.exitCode).toBe(2);
    expect(result.report.status).toBe("failed");
    expect(result.report.issues[0]?.type).toBe("input_file_not_found");
    expect(JSON.parse(await readFixture("report.json")).issues[0].type).toBe(
      "input_file_not_found"
    );
  });

  it("returns exit code 2 and writes a report when the schema file is missing", async () => {
    await writeFixture("raw-output.txt", '{ "title": "Rahasia Miliarder" }');

    const result = await runCheck(
      baseOptions({
        input: "raw-output.txt",
        schema: "missing-schema.json",
        cleanOutput: "clean-output.json",
        report: "report.json"
      }),
      workspace
    );

    expect(result.exitCode).toBe(2);
    expect(result.report.status).toBe("failed");
    expect(result.report.issues[0]?.type).toBe("schema_file_not_found");
    expect(JSON.parse(await readFixture("report.json")).issues[0].type).toBe(
      "schema_file_not_found"
    );
  });

  it("keeps the input file unchanged without overwrite", async () => {
    await writeFixture(
      "raw-output.txt",
      ["```json", '{ "title": "Rahasia Miliarder" }', "```"].join("\n")
    );
    await writeFixture("schema.json", titleSchema());
    const original = await readFixture("raw-output.txt");

    const result = await runCheck(
      baseOptions({
        input: "raw-output.txt",
        schema: "schema.json",
        cleanOutput: "clean-output.json",
        report: "report.json"
      }),
      workspace
    );

    expect(result.exitCode).toBe(0);
    expect(await readFixture("raw-output.txt")).toBe(original);
  });

  it("overwrites the input file only when overwrite is enabled", async () => {
    await writeFixture(
      "raw-output.txt",
      ["```json", '{ "title": "Rahasia Miliarder" }', "```"].join("\n")
    );
    await writeFixture("schema.json", titleSchema());

    const result = await runCheck(
      baseOptions({
        input: "raw-output.txt",
        schema: "schema.json",
        report: "report.json",
        overwrite: true,
        pretty: true
      }),
      workspace
    );

    expect(result.exitCode).toBe(0);
    expect(await readFixture("raw-output.txt")).toBe(
      ["{", '  "title": "Rahasia Miliarder"', "}", ""].join("\n")
    );
    await expect(fileExists("clean-output.json")).resolves.toBe(false);
  });

  it("accepts UTF-8 BOM at the start of input and schema files", async () => {
    await writeFixture("raw-output.txt", '\uFEFF{ "title": "Rahasia Miliarder" }');
    await writeFixture("schema.json", `\uFEFF${titleSchema()}`);

    const result = await runCheck(
      baseOptions({
        input: "raw-output.txt",
        schema: "schema.json",
        cleanOutput: "clean-output.json",
        report: "report.json"
      }),
      workspace
    );

    expect(result.exitCode).toBe(0);
    expect(await readFixture("clean-output.json")).toBe('{"title":"Rahasia Miliarder"}');
  });

  it("passes with chatty preamble before JSON", async () => {
    await writeFixture(
      "raw-output.txt",
      ["Boleh, ini JSON-nya:", '{ "title": "Rahasia Miliarder" }', "Terima kasih."].join("\n")
    );
    await writeFixture("schema.json", titleSchema());

    const result = await runCheck(
      baseOptions({
        input: "raw-output.txt",
        schema: "schema.json",
        cleanOutput: "clean-output.json",
        report: "report.json",
        verboseReport: true
      }),
      workspace
    );

    expect(result.exitCode).toBe(0);
    expect(result.report.status).toBe("passed");
    expect(result.report.cleaned).toBe(true);
    expect(result.report.issues).toEqual([]);
    expect("cleaningActions" in result.report ? result.report.cleaningActions : []).toContain(
      "removed_text_outside_json"
    );
    await expect(fileExists("clean-output.json")).resolves.toBe(true);
    await expect(fileExists("report.json")).resolves.toBe(true);
  });

  it("passes with markdown code block around JSON", async () => {
    await writeFixture(
      "raw-output.txt",
      ["```json", '{ "title": "Rahasia Miliarder" }', "```"].join("\n")
    );
    await writeFixture("schema.json", titleSchema());

    const result = await runCheck(
      baseOptions({
        input: "raw-output.txt",
        schema: "schema.json",
        cleanOutput: "clean-output.json",
        report: "report.json",
        verboseReport: true
      }),
      workspace
    );

    expect(result.exitCode).toBe(0);
    expect(result.report.status).toBe("passed");
    expect(result.report.cleaned).toBe(true);
    expect("cleaningActions" in result.report ? result.report.cleaningActions : []).toContain(
      "removed_markdown_code_block"
    );
    await expect(fileExists("clean-output.json")).resolves.toBe(true);
    await expect(fileExists("report.json")).resolves.toBe(true);
  });

  it("fails on truncated JSON with the expected issue", async () => {
    await writeFixture(
      "raw-output.txt",
      '{ "title": "Misteri Laut Dalam", "chapters": [ { "narasi": "Di kedalaman laut...'
    );
    await writeFixture("schema.json", titleSchema());

    const result = await runCheck(
      baseOptions({
        input: "raw-output.txt",
        schema: "schema.json",
        cleanOutput: "clean-output.json",
        report: "report.json"
      }),
      workspace
    );

    expect(result.exitCode).toBe(1);
    expect(result.report.status).toBe("failed");
    expect(result.report.issues[0]?.type).toBe("truncated_output");
    expect(result.report.suggestedRetryPrompt).toBeNull();
    await expect(fileExists("clean-output.json")).resolves.toBe(false);
    await expect(fileExists("report.json")).resolves.toBe(true);
  });

  it("fails on unescaped quotes and returns a retry prompt", async () => {
    await writeFixture(
      "raw-output.txt",
      '{ "script": "Elon Musk berkata, "Saya suka Mars", lalu tertawa." }'
    );
    await writeFixture(
      "schema.json",
      JSON.stringify({
        type: "object",
        required: ["script"],
        properties: {
          script: { type: "string" }
        },
        additionalProperties: false
      })
    );

    const result = await runCheck(
      baseOptions({
        input: "raw-output.txt",
        schema: "schema.json",
        cleanOutput: "clean-output.json",
        report: "report.json"
      }),
      workspace
    );

    expect(result.exitCode).toBe(1);
    expect(result.report.status).toBe("failed");
    expect(result.report.issues[0]?.type).toBe("unescaped_quote");
    expect(result.report.suggestedRetryPrompt).toContain("Escape all double quotes");
    await expect(fileExists("clean-output.json")).resolves.toBe(false);
    await expect(fileExists("report.json")).resolves.toBe(true);
  });

  it("fails on schema deviation with expected issue types", async () => {
    await writeFixture("raw-output.txt", '{ "background_image": "hutan pinus" }');
    await writeFixture(
      "schema.json",
      JSON.stringify({
        type: "object",
        required: ["visual_keyword"],
        properties: {
          visual_keyword: { type: "string" }
        },
        additionalProperties: false
      })
    );

    const result = await runCheck(
      baseOptions({
        input: "raw-output.txt",
        schema: "schema.json",
        cleanOutput: "clean-output.json",
        report: "report.json"
      }),
      workspace
    );

    expect(result.exitCode).toBe(1);
    expect(result.report.status).toBe("failed");
    expect(result.report.issues.map((issue) => issue.type)).toEqual([
      "schema_deviation",
      "unexpected_field"
    ]);
    expect(result.report.suggestedRetryPrompt).toContain("exactly follows this schema");
    await expect(fileExists("clean-output.json")).resolves.toBe(false);
    await expect(fileExists("report.json")).resolves.toBe(true);
  });
});

function baseOptions(overrides: Parameters<typeof runCheck>[0]): Parameters<typeof runCheck>[0] {
  return overrides;
}

async function writeFixture(path: string, content: string): Promise<void> {
  await writeFile(join(workspace, path), content, "utf8");
}

async function readFixture(path: string): Promise<string> {
  return readFile(join(workspace, path), "utf8");
}

async function fileExists(path: string): Promise<boolean> {
  try {
    const info = await stat(join(workspace, path));
    return info.isFile();
  } catch {
    return false;
  }
}

function titleSchema(): string {
  return JSON.stringify({
    type: "object",
    required: ["title"],
    properties: {
      title: { type: "string" }
    },
    additionalProperties: false
  });
}
