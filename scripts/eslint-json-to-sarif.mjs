import { writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { relative } from "node:path";
import { fileURLToPath } from "node:url";

const eslintBin = new URL("../node_modules/eslint/bin/eslint.js", import.meta.url);
const result = spawnSync(process.execPath, [fileURLToPath(eslintBin), ".", "--format", "json"], {
  cwd: process.cwd(),
  encoding: "utf8"
});

if (!result.stdout && result.stderr) {
  process.stderr.write(result.stderr);
}

if (!result.stdout) {
  process.exit(result.status ?? 1);
}

const eslintResults = result.stdout ? JSON.parse(result.stdout) : [];
writeFileSync("eslint-report.json", `${JSON.stringify(eslintResults, null, 2)}\n`);
writeFileSync("report.sarif", `${JSON.stringify(toSarif(eslintResults), null, 2)}\n`);

function toSarif(eslintResults) {
  const rules = new Map();
  const artifacts = [];
  const artifactIndexes = new Map();
  const results = [];

  for (const fileResult of eslintResults) {
    const uri = normalizePath(relative(process.cwd(), fileResult.filePath || ""));

    if (uri && !artifactIndexes.has(uri)) {
      artifactIndexes.set(uri, artifacts.length);
      artifacts.push({
        location: {
          uri
        }
      });
    }

    for (const message of fileResult.messages ?? []) {
      const ruleId = message.ruleId ?? "eslint";
      if (!rules.has(ruleId)) {
        rules.set(ruleId, {
          id: ruleId,
          name: ruleId,
          shortDescription: {
            text: ruleId
          }
        });
      }

      results.push({
        ruleId,
        level: severityToSarifLevel(message.severity),
        message: {
          text: message.message
        },
        locations: [
          {
            physicalLocation: {
              artifactLocation: {
                uri,
                index: artifactIndexes.get(uri)
              },
              region: {
                startLine: message.line ?? 1,
                startColumn: message.column ?? 1,
                endLine: message.endLine ?? message.line ?? 1,
                endColumn: message.endColumn ?? message.column ?? 1
              }
            }
          }
        ]
      });
    }
  }

  return {
    version: "2.1.0",
    $schema: "https://json.schemastore.org/sarif-2.1.0.json",
    runs: [
      {
        tool: {
          driver: {
            name: "ESLint",
            informationUri: "https://eslint.org",
            rules: Array.from(rules.values())
          }
        },
        artifacts,
        results
      }
    ]
  };
}

function severityToSarifLevel(severity) {
  if (severity === 2) {
    return "error";
  }
  if (severity === 1) {
    return "warning";
  }
  return "note";
}

function normalizePath(path) {
  return path.replace(/\\/g, "/");
}
