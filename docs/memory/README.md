# Project Memory

Project Memory adalah dokumentasi hidup untuk AI Output Guard.

Tujuannya sederhana: siapa pun yang melanjutkan project ini harus bisa memahami konteks, keputusan, perjalanan, risiko, dan langkah berikutnya tanpa harus membaca seluruh percakapan sebelumnya.

## Cara Pakai

Sebelum mulai kerja, baca dokumen ini dengan urutan:

1. `docs/memory/project-status.md`
2. `docs/memory/branch-workflow.md`
3. `docs/memory/decision-log.md`
4. `docs/memory/journey.md`
5. `docs/memory/handoff.md`

Setelah selesai kerja, update dokumen yang relevan:

- Update `journey.md` untuk perjalanan penting.
- Update `decision-log.md` untuk keputusan yang punya dampak teknis, produk, keamanan, atau proses.
- Update `project-status.md` jika status Phase 0 berubah.
- Update `handoff.md` jika ada cara kerja, command, risiko, atau next step baru.

## Source Of Truth

Urutan kepercayaan project:

1. PRD Phase 0 milik owner.
2. Implementasi dan test yang ada di repo.
3. `implementation_plan.md`.
4. Project Memory ini.
5. Percakapan/chat sebelumnya.

Jika ada konflik, PRD dan test lebih kuat daripada catatan perjalanan.

## Yang Tidak Boleh Disimpan Di Memory

- Secret, token, API key, credential.
- Data pribadi yang tidak perlu.
- Spekulasi yang ditulis seperti fakta.
- Keputusan besar tanpa alasan, trade-off, dan rollback.

## Standar Catatan

Setiap catatan penting sebaiknya menjawab:

- Apa yang berubah?
- Kenapa berubah?
- Apa trade-off-nya?
- Bagaimana verifikasinya?
- Bagaimana rollback jika salah?
