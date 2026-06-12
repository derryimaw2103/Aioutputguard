# Handoff

Dokumen ini untuk orang atau agent yang melanjutkan AI Output Guard.

## Mulai Dari Sini

1. Pastikan berada di branch `experiment`.
2. Baca `docs/memory/README.md`.
3. Baca `docs/memory/project-status.md`.
4. Baca `implementation_plan.md`.
5. Jalankan quality gate lokal sebelum mengubah banyak hal.

## Command Penting

Install dependencies:

```bash
npm ci
```

Quality gate:

```bash
npm run format:check
npm run lint
npm run lint:sarif
npm run typecheck
npm test
npm run build
npm pack --dry-run
```

Run CLI lokal:

```bash
npm run dev -- check \
  --input raw-output.txt \
  --schema schema.json \
  --clean-output clean-output.json \
  --report report.json
```

Build CLI:

```bash
npm run build
node dist/cli.js check --input raw-output.txt --schema schema.json --clean-output clean-output.json --report report.json
```

## Bagian Kode Penting

- `src/commands/check.ts`: orchestration command `check`.
- `src/core/extract-json.ts`: pencarian JSON object atau array pertama.
- `src/core/clean-output.ts`: pembersihan markdown dan teks di luar JSON.
- `src/core/classify-error.ts`: klasifikasi issue produk.
- `src/core/validate-schema.ts`: validasi AJV dan mapping error schema.
- `scripts/eslint-json-to-sarif.mjs`: membuat SARIF untuk GovernanceOS.

## Risiko Yang Perlu Dijaga

- Jangan memperbaiki JSON ambigu secara otomatis.
- Jangan overwrite raw output kecuali `--overwrite` dipakai.
- Jangan mengubah issue type tanpa update test.
- Jangan memasukkan fitur Phase 1 sebelum acceptance Phase 0 terpenuhi.
- Jangan commit secret atau token.
- Jangan commit `asisten_ai.md` atau `prd.md` tanpa instruksi owner.

## Next Step Yang Masuk Akal

Urutan lanjut yang disarankan:

1. Rapikan README usage untuk CLI Phase 0.
2. Tambahkan `examples/` berisi raw output, schema, clean output, dan report sample.
3. Coba CLI di pipeline AI automation milik owner.
4. Catat hasil pemakaian pertama di `docs/memory/journey.md`.
5. Jika stabil, promosikan `experiment` ke `dev`.
6. Setelah review dan CI hijau, promosikan `dev` ke `main`.

## Jika Terjadi Masalah

Jika test gagal:

- Baca pesan error dulu.
- Cari test terkait di `tests/check.test.ts`.
- Jangan ubah behavior produk hanya untuk membuat test hijau jika bertentangan dengan PRD.

Jika GovernanceOS gagal:

- Pastikan `PAT_TOKEN` tersedia di GitHub secrets.
- Pastikan `.github/governance/policy.yaml` valid.
- Pastikan `npm run lint:sarif` menghasilkan `report.sarif`.

Jika branch berantakan:

- Jangan pakai `git reset --hard` tanpa izin owner.
- Cek:

```bash
git status --short --branch
git log --oneline --decorate --graph --all -10
```
