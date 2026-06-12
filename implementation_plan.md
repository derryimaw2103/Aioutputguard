# Implementation Plan: AI Output Guard Phase 0 - Next Steps

Dokumen ini adalah peta kerja lanjutan untuk Phase 0. Tulisannya sengaja dibuat high level dan eksplisit supaya bisa diikuti oleh junior engineer atau AI model yang lebih rendah tanpa perlu menebak arah project.

## Prinsip Utama

- Project masih berada di **Phase 0**.
- Fokus Phase 0 adalah CLI lokal `ai-output-guard check`.
- Semua perubahan baru dimulai dari branch `experiment`.
- Setelah stabil, perubahan dipromosikan dari `experiment` ke `dev`.
- Setelah benar-benar siap, perubahan dipromosikan dari `dev` ke `main`.
- `asisten_ai.md` dan `prd.md` tetap file lokal. Jangan commit dua file itu kecuali owner meminta secara eksplisit.
- Setiap perubahan penting harus dicatat di `docs/memory/`.

## Kondisi Saat Ini

- Scaffold Node.js + TypeScript sudah ada.
- CLI `ai-output-guard check` sudah ada.
- Test dasar Phase 0 sudah ada.
- Workflow CI, security, package smoke, dan GovernanceOS Gatekeeper sudah berhasil berjalan setelah `PAT_TOKEN` diperbarui.
- GovernanceOSUNI dipakai sebagai pengawas repo, bukan fitur produk AI Output Guard.
- `implementation_plan.md` sekarang menjadi roadmap lanjutan, bukan lagi rencana bootstrap awal.

## Target Phase 0

Phase 0 dianggap siap naik dari `experiment` ke `dev` jika:

- README menjelaskan cara memakai CLI dengan contoh yang jelas.
- Folder `examples/` berisi contoh input, schema, clean output, dan report.
- CLI sudah dicoba minimal satu kali pada alur AI automation nyata milik owner.
- Semua quality gate lokal dan GitHub Actions hijau.
- Memory project sudah mencatat hasil pekerjaan dan keputusan penting.

Phase 0 dianggap siap naik dari `dev` ke `main` jika:

- Perubahan di `dev` sudah direview.
- Tidak ada issue blocking dari CI, security, package smoke, atau GovernanceOS.
- Scope masih sesuai PRD Phase 0.
- Tidak ada fitur Phase 1 yang masuk diam-diam.

## Milestone 1: Rapikan Dokumentasi Publik

Tujuan: orang baru bisa memahami dan menjalankan CLI tanpa membaca chat.

Tugas:

- Update `README.md` dengan penjelasan singkat produk.
- Tambahkan command instalasi dan cara menjalankan CLI lokal.
- Jelaskan semua flag utama:
  - `--input`
  - `--schema`
  - `--clean-output`
  - `--report`
  - `--overwrite`
  - `--no-fail`
  - `--verbose-report`
  - `--pretty`
- Jelaskan exit code:
  - `0` untuk sukses.
  - `1` untuk output AI yang gagal kontrak.
  - `2` untuk error sistem atau penggunaan tool yang salah.
- Jelaskan bahwa tool tidak melakukan aggressive JSON repair.

Definition of done:

- README bisa dipakai sebagai panduan pertama.
- `npm run format:check` tetap hijau.
- Memory di `docs/memory/journey.md` dan `docs/memory/project-status.md` diupdate.

## Milestone 2: Tambahkan Examples

Tujuan: user bisa melihat bentuk input dan output yang benar.

Tugas:

- Buat folder `examples/`.
- Tambahkan contoh raw output AI yang punya preamble atau markdown code block.
- Tambahkan contoh JSON Schema.
- Tambahkan contoh clean output yang valid.
- Tambahkan contoh report sederhana.
- Tambahkan command README yang memakai file dari `examples/`.

Definition of done:

- Contoh bisa dijalankan dengan CLI lokal.
- Output contoh tidak bergantung pada file lokal rahasia.
- `npm test` dan `npm run build` tetap hijau.

## Milestone 3: Validasi CLI Terhadap PRD

Tujuan: pastikan implementasi Phase 0 masih sesuai kebutuhan awal.

Tugas:

- Cocokkan behavior CLI dengan PRD lokal tanpa commit `prd.md`.
- Pastikan lima kasus wajib tetap teruji:
  - chatty preamble.
  - markdown code block.
  - truncated JSON.
  - unescaped quotes.
  - schema deviation.
- Pastikan report selalu ditulis.
- Pastikan clean output hanya ditulis ketika validasi sukses.
- Pastikan `--no-fail` mengubah exit code gagal kontrak menjadi `0`.

Definition of done:

- `npm run lint` hijau.
- `npm run typecheck` hijau.
- `npm test` hijau.
- Jika ada gap PRD, catat di memory sebelum mengubah behavior.

## Milestone 4: Trial Di Pipeline Nyata

Tujuan: membuktikan tool berguna di workflow AI automation milik owner.

Tugas:

- Pilih satu alur yang menghasilkan raw AI output.
- Simpan raw output ke file sementara atau artifact.
- Jalankan `ai-output-guard check` terhadap schema yang jelas.
- Simpan clean output dan report.
- Catat apakah tool menangkap masalah nyata.
- Jika perlu, jalankan mode `--no-fail` dulu agar trial tidak memblokir pipeline.

Definition of done:

- Ada catatan hasil trial di `docs/memory/journey.md`.
- Jika trial menemukan bug, buat task lanjutan yang jelas.
- Jika trial sukses, catat bahwa Phase 0 sudah pernah dipakai pada alur nyata.

## Milestone 5: Siapkan Promosi `experiment` Ke `dev`

Tujuan: membawa perubahan yang sudah rapi ke branch integrasi.

Tugas:

- Pastikan working tree bersih kecuali file lokal yang memang tidak di-commit.
- Jalankan quality gate lokal.
- Pastikan GitHub Actions pada branch atau PR hijau.
- Pastikan PR `experiment -> dev` hanya berisi perubahan yang memang siap.
- Review file memory agar status project terbaru mudah dipahami.

Definition of done:

- PR `experiment -> dev` siap merge.
- Tidak ada file lokal `asisten_ai.md` atau `prd.md` ikut commit.
- Owner menyetujui promosi ke `dev`.

## Milestone 6: Siapkan Promosi `dev` Ke `main`

Tujuan: menjadikan Phase 0 baseline stabil.

Tugas:

- Buat PR `dev -> main` setelah `dev` stabil.
- Pastikan CI, security, package smoke, dan GovernanceOS hijau.
- Jalankan smoke test CLI dari build output.
- Pastikan README dan examples sesuai behavior terbaru.
- Jangan membuat release/tag npm sebelum owner setuju.

Definition of done:

- `main` menjadi baseline stabil Phase 0.
- Memory mencatat commit/PR yang menjadi baseline.
- Next phase baru dibahas setelah Phase 0 stabil.

## Quality Gate Lokal

Jalankan command ini sebelum membuka PR atau promosi branch:

```bash
npm run format:check
npm run lint
npm run lint:sarif
npm run typecheck
npm test
npm run build
npm pack --dry-run
```

Jika perubahan hanya dokumentasi, minimal jalankan:

```bash
npm run format:check
```

## Hal Yang Jangan Dikerjakan Di Phase 0

- Jangan membuat SaaS.
- Jangan membuat dashboard.
- Jangan membuat hosted API.
- Jangan membuat GitHub Action product wrapper penuh.
- Jangan membuat schema inference.
- Jangan membuat auto-retry.
- Jangan membuat aggressive JSON repair.
- Jangan memasukkan secret atau token ke repo.
- Jangan memindahkan scope produk mengikuti GovernanceOSUNI. GovernanceOSUNI hanya pengawas project.

## Aturan Memory

Setiap pekerjaan penting harus update minimal satu file di `docs/memory/`.

Gunakan panduan sederhana ini:

- Update `journey.md` untuk kejadian kronologis.
- Update `project-status.md` untuk status saat ini.
- Update `decision-log.md` untuk keputusan yang memengaruhi arsitektur, scope, workflow, atau keamanan.
- Update `handoff.md` jika ada orang/agent lain yang perlu tahu cara melanjutkan.

## Tugas Paling Dekat

Urutan kerja paling dekat setelah dokumen ini:

1. Update `README.md`.
2. Tambahkan folder `examples/`.
3. Jalankan CLI terhadap examples.
4. Update memory.
5. Jalankan quality gate.
6. Commit ke branch `experiment`.
7. Lanjutkan PR `experiment -> dev` jika semua sudah stabil.
