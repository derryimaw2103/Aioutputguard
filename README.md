# AI Output Guard

AI Output Guard adalah CLI untuk menjaga kontrak output AI sebelum dipakai pipeline lain. Phase 0 fokus pada satu command lokal: `ai-output-guard check`.

Tool ini membaca raw output AI dari file, membersihkan noise yang aman seperti preamble chatty dan markdown code fence, mengambil JSON object atau array pertama, memvalidasi hasilnya terhadap JSON Schema, lalu menulis clean output dan report dengan exit code yang cocok untuk CI/CD.

## Status Project

Project saat ini masih berada di **Phase 0**.

Scope Phase 0:

- CLI lokal berbasis Node.js + TypeScript.
- Command utama: `ai-output-guard check`.
- Validasi JSON output AI terhadap schema eksplisit.
- Report yang selalu ditulis.
- Exit code yang bisa dipakai di automation pipeline.

Di luar scope Phase 0:

- SaaS.
- dashboard.
- hosted API.
- GitHub Action product wrapper penuh.
- schema inference.
- auto-retry.
- aggressive JSON repair.

## Install

Butuh Node.js `20` atau lebih baru.

Install dependency:

```bash
npm ci
```

Jalankan CLI di mode development:

```bash
npm run dev -- check --help
```

Build CLI:

```bash
npm run build
```

Jalankan hasil build:

```bash
node dist/cli.js check --help
```

## Command Utama

```bash
ai-output-guard check \
  --input <file> \
  --schema <file> \
  --clean-output <file> \
  --report <file> \
  [--overwrite] \
  [--no-fail] \
  [--verbose-report] \
  [--pretty]
```

## Arti Setiap Flag

- `--input`: path file raw output AI.
- `--schema`: path file JSON Schema.
- `--clean-output`: path file hasil JSON bersih. Wajib jika tidak memakai `--overwrite`.
- `--report`: path file report JSON. Selalu ditulis, baik sukses maupun gagal.
- `--overwrite`: overwrite file input dengan clean JSON.
- `--no-fail`: jika kontrak output gagal, exit code tetap `0`.
- `--verbose-report`: report berisi detail tambahan seperti cleaning actions, parser metadata, schema metadata, dan timestamp.
- `--pretty`: tulis clean JSON dengan indentasi yang mudah dibaca.

## Exit Code

- `0`: validasi sukses, atau gagal kontrak tetapi `--no-fail` aktif.
- `1`: output AI gagal memenuhi kontrak.
- `2`: error sistem atau penggunaan tool salah, misalnya file input/schema tidak ada.

## Yang Dilakukan Tool

1. Baca raw output AI dari file.
2. Hapus noise yang aman seperti preamble dan markdown code block.
3. Cari JSON object atau array pertama.
4. Parse JSON dengan `JSON.parse`.
5. Validasi hasil parse terhadap JSON Schema.
6. Tulis clean output hanya jika validasi sukses.
7. Tulis report JSON pada semua hasil.

## Yang Tidak Dilakukan Tool

Tool ini sengaja **tidak** melakukan aggressive JSON repair. Contohnya:

- tidak menebak penutup kurung untuk JSON yang terpotong.
- tidak memperbaiki kutip yang rusak dengan tebakan bebas.
- tidak mengisi field yang hilang.
- tidak memetakan nama field yang salah ke nama field yang dianggap mirip.

Jika output AI ambigu, tool akan gagal dengan report yang jelas supaya pipeline tetap aman.

## Contoh Cepat

Contoh file ada di folder [`examples/`](examples/).

Jalankan example yang lolos validasi:

```bash
npm run dev -- check \
  --input examples/article/raw-output.txt \
  --schema examples/article/schema.json \
  --clean-output examples/article/generated-clean-output.json \
  --report examples/article/generated-report.json \
  --pretty
```

Jika ingin melihat detail report:

```bash
npm run dev -- check \
  --input examples/article/raw-output.txt \
  --schema examples/article/schema.json \
  --clean-output examples/article/generated-clean-output.json \
  --report examples/article/generated-report.json \
  --pretty \
  --verbose-report
```

Expected checked-in example output:

- Clean output: [examples/article/expected-clean-output.json](<D:/AI output guard/examples/article/expected-clean-output.json:1>)
- Report: [examples/article/expected-report.json](<D:/AI output guard/examples/article/expected-report.json:1>)

## Format Report

Simple report:

```json
{
  "status": "passed",
  "cleaned": true,
  "cleanOutputPath": "clean-output.json",
  "issues": [],
  "suggestedRetryPrompt": null
}
```

Verbose report menambahkan field berikut:

- `cleaningActions`
- `parser`
- `schema`
- `timestamps`

## Quality Gate Lokal

Jalankan sebelum membuka PR atau promosi branch:

```bash
npm run format:check
npm run lint
npm run lint:sarif
npm run typecheck
npm test
npm run build
npm pack --dry-run
```

## Branch Strategy

Alur kerja resmi project:

```text
experiment -> dev -> main
```

- `experiment`: semua perubahan baru dan eksperimen.
- `dev`: integrasi perubahan yang sudah diverifikasi.
- `main`: baseline stabil.

## Project Memory

Dokumentasi perjalanan project ada di [docs/memory/README.md](<D:/AI output guard/docs/memory/README.md:1>).

Dokumen penting:

- [project-status.md](<D:/AI output guard/docs/memory/project-status.md:1>)
- [journey.md](<D:/AI output guard/docs/memory/journey.md:1>)
- [decision-log.md](<D:/AI output guard/docs/memory/decision-log.md:1>)
- [handoff.md](<D:/AI output guard/docs/memory/handoff.md:1>)
