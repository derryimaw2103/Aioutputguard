# AI Output Guard

AI Output Guard is an LLM output contract guard. The Phase 0 target is a Node.js and TypeScript CLI that reads raw AI output, extracts safe JSON, validates it against JSON Schema, writes clean output, writes a report, and returns CI-friendly exit codes.

## Phase 0 Focus

- Build a local CLI command: `ai-output-guard check`.
- Accept raw AI output from a file.
- Remove safe noise such as chatty preamble and markdown code fences.
- Extract the first JSON object or JSON array.
- Validate with JSON Schema.
- Write clean JSON only when validation passes.
- Always write `report.json`.
- Return predictable exit codes for CI/CD.

## Non-Goals For Phase 0

- SaaS dashboard
- Hosted API
- Billing
- GitHub App
- Automatic LLM retry
- Aggressive JSON repair
- Schema inference

## Branch Strategy

- `main`: stable branch. Keep this branch releasable.
- `dev`: integration branch for Phase 0 development.
- `experiment`: sandbox branch for spikes, tests, and risky ideas.

Recommended flow: `experiment` -> `dev` -> `main` through pull requests.

## GitHub Actions

This repository starts with Actions that support the Phase 0 CLI plan:

- CI: installs dependencies when `package.json` exists and runs available scripts for format, lint, typecheck, test, and build.
- Security: dependency review on pull requests plus CodeQL when JavaScript or TypeScript source exists.
- Package smoke test: validates `npm pack --dry-run` for release tags or manual checks.
