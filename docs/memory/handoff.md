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

Urutan lanjut yang disarankan sudah dirinci di `implementation_plan.md`. Ringkasannya:

1. Coba CLI di pipeline AI automation milik owner.
2. Catat hasil pemakaian pertama di `docs/memory/journey.md`.
3. Jika stabil, promosikan `experiment` ke `dev`.
4. Setelah review dan CI hijau, promosikan `dev` ke `main`.

Untuk pekerjaan besar berikutnya, mulai dari Milestone 1 di `implementation_plan.md`.

## Jika Terjadi Masalah

Jika test gagal:

- Baca pesan error dulu.
- Cari test terkait di `tests/check.test.ts`.
- Jangan ubah behavior produk hanya untuk membuat test hijau jika bertentangan dengan PRD.

Jika GovernanceOS gagal:

- Pastikan `PAT_TOKEN` tersedia di GitHub secrets.
- Pastikan `PAT_TOKEN` punya akses read ke repo private `derryimaw2103/GovernanceOSUNI`.
- Pastikan `.github/governance/policy.yaml` valid.
- Pastikan `npm run lint:sarif` menghasilkan `report.sarif`.
- Jika gagal di `setup-python`, jangan aktifkan `cache: pip` kecuali repo punya file dependency Python seperti `requirements.txt` atau `pyproject.toml`.
- GovernanceOS dibuat optional secara default. Jika ingin GovernanceOS wajib memblokir PR ketika token salah atau install gagal, set repository variable `GOVERNANCE_REQUIRED=true`.

Jika Security workflow gagal:

- Cek `npm audit --audit-level=high` terlebih dahulu.
- Dependency Review GitHub tidak dipakai saat ini karena dapat gagal jika Dependency Graph belum aktif atau belum tersedia.
- CodeQL dibuat optional untuk repo private atau repo tanpa dukungan GitHub Advanced Security.

Jika semua workflow sudah hijau:

- Anggap konfigurasi CI/security/governance sudah valid pada commit terakhir.
- Jika owner ingin governance menjadi hard gate permanen, set `GOVERNANCE_REQUIRED=true`.
- Setelah itu, promosi `experiment -> dev` dan `dev -> main` lebih aman dilakukan.

Jika branch berantakan:

- Jangan pakai `git reset --hard` tanpa izin owner.
- Cek:

```bash
git status --short --branch
git log --oneline --decorate --graph --all -10
```
