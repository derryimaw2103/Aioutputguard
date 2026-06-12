# Journey

Dokumen ini mencatat perjalanan penting project secara kronologis.

## 2026-06-11

### Repo Dan Branch Awal

- Repo GitHub `derryimaw2103/Aioutputguard` disiapkan.
- Branch dibuat:
  - `main`
  - `dev`
  - `experiment`
- `main` dipakai sebagai branch stabil.
- Workflow awal dibuat untuk CI, security, dan package smoke test.

### PRD Phase 0 Dibaca

- PRD menetapkan produk sebagai **LLM Output Contract Guard**.
- Scope Phase 0 dikunci sebagai CLI lokal.
- Non-goals dicatat: SaaS, hosted API, GitHub Action penuh, auto-retry, schema inference, aggressive repair, dan fitur besar lain.

### Implementasi Foundation Phase 0

- CLI `ai-output-guard check` mulai diimplementasikan.
- Core modules dibuat untuk cleaning, extraction, parsing, schema validation, report, dan error classification.
- Test wajib PRD dibuat dengan Vitest.
- Quality gate lokal berhasil:
  - format check.
  - lint.
  - typecheck.
  - test.
  - build.
  - package smoke.
  - audit.

## 2026-06-12

### Koreksi Pemahaman GovernanceOSUNI

- Awalnya workflow `GovernanceOSUNI` dibaca terlalu sempit sebagai CI teknis.
- Owner mengklarifikasi bahwa GovernanceOSUNI dimaksudkan sebagai pengawas project.
- Repo kemudian ditambahkan:
  - GovernanceOS Gatekeeper workflow.
  - Dependabot.
  - PR labeler.
  - Governance policy.
  - SARIF generation dari ESLint.

### Governance Policy Dipindah

- Policy awal sempat berada di root sebagai `governance.yaml`.
- Owner mempertanyakan potensi kebingungan dengan PRD.
- Policy dipindah ke `.github/governance/policy.yaml`.
- Workflow GovernanceOS diarahkan eksplisit ke path baru.

### Branch Flow Dikoreksi

- Owner menegaskan proses yang benar:

```text
experiment -> dev -> main
```

- `experiment` di-fast-forward agar baseline-nya sama dengan `dev`.
- Workspace kerja dipindahkan ke `experiment`.
- SOP baru: perubahan berikutnya dimulai dari `experiment`.

### Project Memory Dibuat

- Folder `docs/memory/` dibuat sebagai dokumentasi hidup.
- Tujuannya agar perjalanan, keputusan, status, dan handoff project tidak hilang di chat.

### Workflow Security Dan Governance Diperbaiki

- Owner melaporkan `GovernanceOS Gatekeeper` gagal pada event push dan pull request.
- Log menunjukkan `actions/setup-python@v6` gagal karena `cache: pip` aktif tetapi repo Node ini tidak punya `requirements.txt` atau `pyproject.toml`.
- `cache: pip` dihapus dari GovernanceOS workflow.
- Owner juga melaporkan `Dependency Review` gagal dan CodeQL tidak bisa dipakai pada repo private.
- Security workflow diganti ke `npm audit --audit-level=high` sebagai pemeriksaan dependency yang stabil untuk repo ini.
- CodeQL dibuat optional dan hanya berjalan ketika repo tidak private.
- Setelah itu GovernanceOS masih gagal karena `PAT_TOKEN` tidak punya akses clone ke repo private `GovernanceOSUNI`.
- GovernanceOS workflow dibuat optional secara default: install/evaluate di-skip dengan warning jika PAT belum benar, dan bisa dibuat wajib dengan repository variable `GOVERNANCE_REQUIRED=true`.
