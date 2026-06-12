# PHASE 0 VALIDATION

Status pengecekan sebelum promote:

- 5 failure pattern: passed
- exit code behavior: passed
- overwrite safety: passed
- real pipeline trial: passed

Safe dogfooding protocol:

- read raw AI output dari file asli
- tulis hasil ke file baru, jangan sentuh file input
- jangan pakai `--overwrite`
- pakai `--no-fail` di 2-5 run awal
- bandingkan `clean-output.json` dengan output lama sebelum mengganti pipeline
- pasang di satu titik kecil dulu sebelum jadi gate utama

Known limitations:

- no auto-retry
- no aggressive JSON repair
- no schema inference
- no GitHub Action yet
