# Implementation Plan: AI Output Guard Phase 0

## Summary

- Create `implementation_plan.md` in the repo root as the source-of-truth execution plan for Phase 0.
- Keep `asisten_ai.md` and `prd.md` local only; do not commit them unless explicitly requested later.
- Implement Phase 0 as a Node.js + TypeScript CLI package focused on `ai-output-guard check`.
- Adapt the `GovernanceOSUNI` CI pattern as a Node "Quality Gate": checkout, setup runtime, install dependencies, lint/format/typecheck/test/build.

## Key Changes

- Scaffold the CLI project on branch `dev`: `package.json`, TypeScript config, Vitest, build tooling, and CLI entrypoint.
- Public command interface:
  `ai-output-guard check --input <file> --schema <file> --clean-output <file> --report <file> [--overwrite] [--no-fail] [--verbose-report] [--pretty]`
- Core behavior:
  read raw AI output, safely remove markdown/code-fence/preamble noise, extract first JSON object or array, parse with `JSON.parse`, validate with AJV, write clean JSON only on success, always write report JSON.
- Exit codes:
  `0` passed, `1` validation/contract failure, `2` system/tool error, `0` for failures when `--no-fail` is enabled.
- Report interface:
  simple report by default; verbose report adds cleaning actions, parser metadata, schema metadata, timestamp, and suggested retry prompt.

## GitHub Actions Plan

- Update existing workflows after scaffold exists:
  CI becomes `Node CI (Quality Gate)` modeled after `GovernanceOSUNI` structure but adapted for Node/TypeScript.
- Use current action majors where suitable:
  `actions/checkout@v6`, `actions/setup-node@v6`, `github/codeql-action@v4`, `actions/dependency-review-action@v4`.
- CI runs on push to `main`, `dev`, `experiment`, and PR to `main`/`dev`.
- CI matrix uses Node `20.x` and `22.x`; package smoke uses Node `22.x`.
- Keep security workflow separate: dependency review on PR, CodeQL on push/schedule/manual.

## Test Plan

- Add Vitest coverage for the 5 required PRD cases:
  chatty preamble, markdown code block, truncated JSON, unescaped quotes, schema deviation.
- Add CLI-level tests for report writing, clean output writing, `--pretty`, `--no-fail`, and missing input/schema exit code `2`.
- Acceptance is green `npm run lint`, `npm run format:check`, `npm run typecheck`, `npm test`, `npm run build`, and `npm pack --dry-run`.

## Assumptions

- `implementation_plan.md` should be committed later to the repo root, but only after leaving Plan Mode.
- Phase 0 must not implement SaaS, hosted API, GitHub Action product wrapper, schema inference, auto-retry, or aggressive JSON repair.
- `GovernanceOSUNI` only provides workflow style guidance; its Python-specific steps are not copied.
- References checked: [`actions/checkout` releases](https://github.com/actions/checkout/releases), [`actions/setup-node` releases](https://github.com/actions/setup-node/releases), [`github/codeql-action` releases](https://github.com/github/codeql-action/releases), [`actions/dependency-review-action` releases](https://github.com/actions/dependency-review-action/releases).
