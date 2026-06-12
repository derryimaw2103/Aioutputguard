# Project Status

Last updated: 2026-06-12

## Status Saat Ini

Project masih berada di **Phase 0**.

Phase 0 fokus pada CLI lokal:

```bash
ai-output-guard check \
  --input raw-output.txt \
  --schema schema.json \
  --clean-output clean-output.json \
  --report report.json
```

Project belum masuk Phase 1. GitHub Action product wrapper, SaaS, dashboard, hosted API, billing, schema inference, auto-retry, dan aggressive JSON repair tetap di luar scope Phase 0.

## Branch Saat Ini

Alur kerja resmi:

```text
experiment -> dev -> main
```

- `experiment`: semua perubahan baru, spike, eksperimen, integrasi baru.
- `dev`: integrasi perubahan yang sudah dipilih dan lolos verifikasi.
- `main`: stabil, hanya untuk hasil yang sudah siap menjadi baseline utama.

Baseline sebelum Project Memory dibuat:

```text
b94651f Move GovernanceOS policy under GitHub config
```

## Yang Sudah Ada

- Scaffold Node.js + TypeScript.
- CLI `ai-output-guard check`.
- Core modules:
  - extract JSON candidate.
  - clean markdown/preamble noise.
  - parse JSON.
  - classify parse/schema errors.
  - validate with AJV.
  - build simple/verbose report.
- Test Vitest untuk 5 kasus wajib PRD dan beberapa edge case CLI.
- CI quality gate: format, lint, typecheck, test, build.
- Security workflow: `npm audit --audit-level=high` dan CodeQL optional jika repo mendukung.
- Package smoke test: `npm pack --dry-run`.
- GovernanceOS oversight workflow di `.github/workflows/governance-check.yml`.
- Governance policy di `.github/governance/policy.yaml`.
- Labeler dan Dependabot untuk membantu maintenance.
- Project Memory di `docs/memory/`.

## Yang Belum Selesai

- README publik belum berisi usage lengkap Phase 0.
- Belum ada PR `dev -> main`.
- Belum dipakai di satu pipeline AI automation milik owner.
- Belum ada examples folder untuk sample raw output dan schema.
- Belum ada release/tag npm.

## File Lokal Yang Sengaja Tidak Di-commit

File berikut masih lokal/untracked:

- `asisten_ai.md`
- `prd.md`

Catatan: jika project akan diteruskan oleh orang lain di luar mesin owner, ringkasan PRD di memory ini belum menggantikan PRD lengkap. Owner perlu memutuskan apakah PRD lengkap akan dipublish, disimpan private, atau diringkas sebagai dokumen repo.
