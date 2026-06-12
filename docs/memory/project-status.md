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
- Semua workflow utama terakhir sudah hijau setelah `PAT_TOKEN` diperbarui.
- GovernanceOS Gatekeeper sudah berhasil menjalankan install dan evaluation path dengan konfigurasi terbaru.
- `implementation_plan.md` sudah diperbarui menjadi roadmap lanjutan Phase 0 yang mudah diikuti oleh junior engineer atau AI model yang lebih rendah.
- README sekarang sudah berisi usage Phase 0, flag, exit code, branch flow, dan contoh command.
- Folder `examples/article/` sekarang tersedia sebagai contoh input, schema, expected clean output, dan expected report.
- Example CLI sudah diverifikasi jalan secara lokal.
- Example failure untuk `schema_deviation` dan `truncated_output` sudah diverifikasi jalan secara lokal.
- Folder `examples/trial/` sekarang tersedia sebagai kit untuk mencoba output AI nyata.
- Trial kit sudah diuji dengan output yang valid dan menghasilkan `PASSED`.
- Trial nyata pertama di project `YoutubeDerry-codex-review-repos-for-user-friendly-patches` berhasil pada `data/news_briefing/briefing_2026-06-11.json`.
- Trial itu lolos tanpa cleaning karena output sumber sudah berupa JSON bersih.
- Lima failure pattern yang diminta owner sudah diuji:
  - basa-basi sebelum JSON: `PASSED`, `cleaned: true`
  - markdown code block: `PASSED`, `cleaned: true`
  - JSON terpotong: `FAILED`, `truncated_output`
  - quote rusak: `FAILED`, `unescaped_quote` dengan suggested retry prompt
  - key schema diganti: `FAILED`, `schema_deviation`
- Lima failure pattern sekarang juga punya test eksplisit di `tests/check.test.ts`.
- `PHASE_0_VALIDATION.md` sudah ditambahkan sebagai catatan singkat batas dan hasil validasi sebelum promote.
- Quality gate lokal tetap hijau setelah penambahan README dan examples.
- Trial read-only terhadap `C:\botyoutube\YoutubeDerry-codex-review-repos-for-user-friendly-patches\data\news_briefing\briefing_2026-06-11.json` berhasil dengan `--no-fail`.
- Hasil trial itu `PASSED` dan `cleaned: false` karena input sumber sudah bersih.

## Yang Belum Selesai

- README publik belum berisi usage lengkap Phase 0.
- Belum ada PR `dev -> main`.
- Belum dipakai di satu pipeline AI automation milik owner.
- Belum ada examples folder untuk sample raw output dan schema.
- Belum ada release/tag npm.

## Fokus Berikutnya

Urutan kerja berikutnya:

1. Kalau perlu, coba artefak lain dari project nyata itu, misalnya title test JSON.
2. Jika siap promosi, lanjutkan `experiment -> dev`.
3. Setelah review dan semua gate hijau, lanjutkan `dev -> main`.

## File Lokal Yang Sengaja Tidak Di-commit

File berikut masih lokal/untracked:

- `asisten_ai.md`
- `prd.md`

Catatan: jika project akan diteruskan oleh orang lain di luar mesin owner, ringkasan PRD di memory ini belum menggantikan PRD lengkap. Owner perlu memutuskan apakah PRD lengkap akan dipublish, disimpan private, atau diringkas sebagai dokumen repo.
