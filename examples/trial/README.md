# Trial Kit

Folder ini dipakai untuk uji coba terhadap output AI nyata.

Cara pakai:

1. Simpan raw output AI ke `raw-output.txt`.
2. Simpan schema yang sesuai ke `schema.json`.
3. Jalankan command ini dari root repo:

```bash
npm run dev -- check \
  --input examples/trial/raw-output.txt \
  --schema examples/trial/schema.json \
  --clean-output examples/trial/generated-clean-output.json \
  --report examples/trial/generated-report.json \
  --pretty \
  --verbose-report
```

Hasil yang diharapkan:

- `generated-clean-output.json` muncul kalau output valid.
- `generated-report.json` selalu muncul.
- Exit code `0` kalau lolos.
- Exit code `1` kalau output melanggar contract.
- Exit code `2` kalau file input atau schema tidak ada.

Jika Anda ingin mencoba `--no-fail`, tambahkan flag itu untuk melihat report gagal tanpa memblokir pipeline.
