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

### GovernanceOS Dan Security Berhasil

- Owner memperbarui `PAT_TOKEN`.
- Semua workflow utama pada commit terbaru berhasil:
  - `Node CI (Quality Gate)`
  - `Security`
  - `GovernanceOS Gatekeeper`
- Ini menandakan jalur pengawasan repo sudah bisa dipakai tanpa mengganggu alur Phase 0.

### Implementation Plan Lanjutan Dibuat

- Owner meminta rencana selanjutnya yang high level dan mudah dipahami oleh junior engineer atau AI model yang lebih rendah.
- `implementation_plan.md` diperbarui dari rencana bootstrap awal menjadi roadmap lanjutan Phase 0.
- Urutan kerja disepakati secara praktis:
  - dokumentasi README.
  - examples.
  - validasi terhadap PRD.
  - trial pada pipeline nyata.
  - promosi `experiment -> dev`.
  - promosi `dev -> main`.
- Scope tetap Phase 0 dan tidak memasukkan fitur Phase 1.

### README Dan Examples Phase 0 Ditambahkan

- README diperluas agar bisa menjadi panduan pertama tanpa harus membaca chat.
- README sekarang menjelaskan:
  - tujuan tool.
  - scope dan non-goal Phase 0.
  - instalasi.
  - command utama.
  - arti flag.
  - exit code.
  - contoh command.
- Folder `examples/article/` ditambahkan.
- Example tersebut menunjukkan kasus raw AI output dengan preamble dan markdown code block yang dibersihkan menjadi JSON valid.

### Example Dan Quality Gate Diverifikasi

- Command example di README dijalankan secara lokal dan menghasilkan status `PASSED`.
- Clean output dan report yang dihasilkan sesuai dengan sample expected.
- File hasil generate sementara tidak disimpan ke repo dan diabaikan lewat `.gitignore`.
- Quality gate lokal yang diverifikasi setelah perubahan ini:
  - `npm run format:check`
  - `npm run lint`
  - `npm test`
  - `npm run typecheck`
  - `npm run build`
  - `npm pack --dry-run`

### Failure Case Dicoba Secara Manual

- Owner meminta simulasi contoh gagal agar perilaku tool lebih mudah dipahami.
- Dua skenario dijalankan:
  - `schema_deviation`
  - `truncated_output`
- Hasil yang terverifikasi:
  - terminal mengembalikan status `FAILED`
  - report JSON tetap ditulis
  - clean output tidak ditulis saat validasi gagal
  - issue dan retry guidance tampil sesuai jenis kegagalan

### Trial Kit Disiapkan

- Folder `examples/trial/` ditambahkan sebagai tempat menaruh raw output AI nyata dan schema yang sesuai.
- Tujuannya supaya trial berikutnya bisa dilakukan tanpa membuat struktur file dari nol lagi.
- README kecil di folder itu menjelaskan command yang perlu dijalankan saat data nyata sudah siap.

### Trial Kit Diuji Dengan Input Valid

- File aktif `examples/trial/raw-output.txt` dan `examples/trial/schema.json` diisi dengan contoh output yang sudah lolos di `examples/article/`.
- Command trial dijalankan ulang dan hasilnya `PASSED`.
- Report menunjukkan cleaning actions, parser metadata, dan schema metadata sesuai perilaku yang diharapkan.

### Trial Nyata Di Project Lain Berhasil

- Target project nyata yang diberikan owner adalah `C:\botyoutube\YoutubeDerry-codex-review-repos-for-user-friendly-patches`.
- Artefak yang diuji: `data/news_briefing/briefing_2026-06-11.json`.
- Schema sementara disusun mengikuti struktur output briefing harian.
- Hasil trial:
  - status `PASSED`
  - `cleaned: false` karena input sudah JSON bersih
  - file clean output dan report berhasil dibuat
- Ini membuktikan tool cocok dipakai di pipeline project nyata tanpa perlu menambah cleaning ekstra kalau sumber output sudah rapi.
