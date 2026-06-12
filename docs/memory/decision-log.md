# Decision Log

Decision Log mencatat keputusan yang memengaruhi produk, arsitektur, workflow, keamanan, atau cara kerja project.

## Template

```text
ID:
Tanggal:
Keputusan:
Alasan:
Trade-off:
Alternatif:
Rollback:
Status:
```

## D-001: Phase 0 Berfokus Pada CLI Lokal

Tanggal: 2026-06-11

Keputusan: AI Output Guard Phase 0 dibangun sebagai CLI Node.js + TypeScript, bukan dashboard, hosted API, SDK, atau GitHub Action product wrapper.

Alasan: PRD Phase 0 menekankan kebutuhan paling kecil yang bisa langsung dipakai di pipeline lokal: baca raw output AI, bersihkan noise aman, validasi JSON Schema, tulis clean output, tulis report, dan beri exit code CI-friendly.

Trade-off: Produk belum punya UI atau integrasi marketplace, tetapi scope tetap kecil dan mudah diverifikasi.

Alternatif: Langsung membuat GitHub Action penuh atau SaaS. Ditolak karena termasuk non-goal Phase 0.

Rollback: Jika CLI tidak cocok, scope bisa direvisi di Phase berikutnya setelah Phase 0 dipakai minimal sekali di pipeline owner.

Status: Aktif.

## D-002: Tidak Melakukan Aggressive JSON Repair

Tanggal: 2026-06-11

Keputusan: Tool tidak memperbaiki JSON yang ambigu seperti truncated JSON, unescaped quote, field mapping, atau field missing.

Alasan: Produk menjaga kontrak output AI. Menebak data bisa mengubah makna dan merusak pipeline produksi.

Trade-off: Beberapa output yang mungkin bisa diperbaiki manual akan gagal. Ini sengaja dipilih demi keamanan dan kebenaran data.

Alternatif: Auto-repair JSON. Ditolak untuk Phase 0.

Rollback: Tidak disarankan untuk Phase 0. Jika dibutuhkan, buat mode eksplisit di Phase lanjutan dengan label risiko tinggi.

Status: Aktif.

## D-003: Stack Awal

Tanggal: 2026-06-11

Keputusan: Gunakan `commander`, `ajv`, `vitest`, `tsup`, `eslint`, `prettier`, dan TypeScript ESM.

Alasan: Stack ini umum untuk CLI Node modern, cukup sederhana, dan cocok dengan PRD.

Trade-off: Ada dependency build/test, tetapi quality gate menjadi jelas.

Alternatif: CLI parser custom, JSON Schema validator custom, atau build dengan `tsc` saja. Ditolak karena menambah risiko dan mengurangi ergonomi.

Rollback: Bisa diganti selama interface CLI dan test PRD tetap stabil.

Status: Aktif.

## D-004: GovernanceOS Sebagai Pengawas Repo, Bukan Fitur Produk

Tanggal: 2026-06-12

Keputusan: GovernanceOSUNI dipakai sebagai oversight workflow untuk development repo, bukan bagian dari fitur AI Output Guard Phase 0.

Alasan: Owner menginginkan GovernanceOSUNI membantu mengawasi project. Ini valid sebagai layer CI/governance, tetapi tidak boleh menggeser scope produk.

Trade-off: Repo punya workflow tambahan dan secret dependency (`PAT_TOKEN`) untuk install repo private GovernanceOSUNI.

Alternatif: Tidak memasang GovernanceOS sampai Phase 1. Ditolak karena owner ingin pengawasan sejak awal.

Rollback: Disable atau hapus `.github/workflows/governance-check.yml` tanpa mengubah produk CLI.

Status: Aktif.

## D-005: Branch Flow Resmi Adalah Experiment Ke Dev Ke Main

Tanggal: 2026-06-12

Keputusan: Semua perubahan baru harus dimulai dari `experiment`, lalu dipromosikan ke `dev`, lalu ke `main` ketika stabil.

Alasan: Owner ingin proses kerja yang lebih disiplin dan aman. `dev` menjadi branch integrasi, bukan tempat eksplorasi utama.

Trade-off: Ada satu langkah promosi tambahan, tetapi risiko perubahan mentah masuk ke branch integrasi lebih kecil.

Alternatif: Langsung kerja di `dev`. Pernah dilakukan untuk bootstrap awal, tetapi tidak menjadi SOP ke depan.

Rollback: Jika project masih sangat kecil dan owner ingin cepat, aturan bisa dilonggarkan sementara dengan catatan eksplisit.

Status: Aktif.

## D-006: Governance Policy Dipindah Ke `.github/governance`

Tanggal: 2026-06-12

Keputusan: Policy GovernanceOS disimpan di `.github/governance/policy.yaml`, bukan root `governance.yaml`.

Alasan: Root project harus tetap fokus pada produk. Policy governance adalah konfigurasi pengawas, bukan source of truth produk.

Trade-off: Path policy lebih panjang, tetapi maksud file lebih jelas.

Alternatif: Simpan di root. Ditolak karena bisa membingungkan dengan PRD.

Rollback: Pindahkan kembali ke root dan update command workflow jika GovernanceOS mengharuskan default path.

Status: Aktif.

## D-007: SARIF ESLint Dibuat Dengan Script Lokal

Tanggal: 2026-06-12

Keputusan: Generate SARIF ESLint memakai `scripts/eslint-json-to-sarif.mjs`, bukan dependency formatter tambahan.

Alasan: Formatter eksternal membawa dependency deprecated. Script lokal cukup untuk kebutuhan GovernanceOSUNI: rules, artifacts, results, severity, file path, dan line.

Trade-off: Kita punya script maintenance kecil sendiri.

Alternatif: Pakai `@microsoft/eslint-formatter-sarif`. Ditolak karena menambah dependency transitive yang berisik.

Rollback: Kembali memakai formatter eksternal jika script lokal tidak cukup untuk kebutuhan SARIF lanjutan.

Status: Aktif.

## D-008: Security Workflow Tidak Bergantung Pada Dependency Review

Tanggal: 2026-06-12

Keputusan: Security workflow memakai `npm audit --audit-level=high` sebagai pemeriksaan dependency utama. `actions/dependency-review-action` tidak dipakai untuk saat ini. CodeQL hanya berjalan jika repository tidak private.

Alasan: Workflow `Dependency Review` gagal karena dependency review tidak didukung pada repo ini saat Dependency Graph atau fitur GitHub terkait belum aktif. Owner juga mengonfirmasi CodeQL tidak bisa dipakai pada repo private saat ini.

Trade-off: Kita kehilangan diff-level dependency review dari GitHub, tetapi tetap punya audit dependency yang stabil dan bisa berjalan di repo ini.

Alternatif: Mengaktifkan Dependency Graph/GitHub Advanced Security dan mempertahankan Dependency Review serta CodeQL. Ditunda karena bergantung pada setting/plan GitHub, bukan kebutuhan produk Phase 0.

Rollback: Jika fitur GitHub sudah tersedia, tambahkan kembali `actions/dependency-review-action` dan aktifkan CodeQL penuh.

Status: Aktif.

## D-009: GovernanceOS Workflow Tidak Menggunakan Pip Cache

Tanggal: 2026-06-12

Keputusan: `cache: pip` dihapus dari step `actions/setup-python` pada GovernanceOS workflow.

Alasan: Repo ini adalah project Node.js. `setup-python` dengan `cache: pip` gagal jika tidak menemukan file dependency Python seperti `requirements.txt` atau `pyproject.toml`.

Trade-off: Install Python dependency GovernanceOS tidak memakai cache pip, tetapi workflow tidak gagal sebelum audit berjalan.

Alternatif: Menambahkan file Python dependency dummy. Ditolak karena akan mengotori repo Node dan membingungkan scope produk.

Rollback: Aktifkan kembali pip cache jika nanti repo memang punya dependency Python yang sah.

Status: Aktif.

## D-010: GovernanceOS Gatekeeper Optional Sampai PAT Valid

Tanggal: 2026-06-12

Keputusan: GovernanceOS Gatekeeper tidak memblokir PR jika `PAT_TOKEN` belum tersedia atau belum punya akses ke repo private `GovernanceOSUNI`. Workflow memberi warning dan melewati install/evaluation. Jika owner ingin GovernanceOS wajib, set repository variable `GOVERNANCE_REQUIRED=true`.

Alasan: Log GitHub Actions menunjukkan `PAT_TOKEN` terbaca tetapi clone `GovernanceOSUNI` gagal dengan 403. Kondisi ini adalah masalah permission secret, bukan kegagalan produk AI Output Guard. Membiarkan workflow merah akan menghambat PR Phase 0 walaupun core CI dan security audit sudah hijau.

Trade-off: GovernanceOS belum menjadi hard gate sampai PAT benar. Namun sinyal warning tetap terlihat, dan hard gate bisa diaktifkan tanpa mengubah kode.

Alternatif: Tetap gagal keras ketika PAT salah. Ditolak untuk fase bootstrap karena akan memblokir seluruh PR akibat konfigurasi eksternal.

Rollback: Set `GOVERNANCE_REQUIRED=true` setelah PAT dikonfigurasi dengan akses read ke `derryimaw2103/GovernanceOSUNI`.

Status: Aktif.

## D-011: GovernanceOS Gatekeeper Terverifikasi Setelah PAT Diperbarui

Tanggal: 2026-06-12

Keputusan: Setelah `PAT_TOKEN` diperbarui, GovernanceOS Gatekeeper dianggap terverifikasi dan dapat dipakai sebagai pengawas repo yang aktif. Status optional hanya dipertahankan sebagai mekanisme fallback teknis jika secret rusak lagi.

Alasan: Owner mengonfirmasi semua workflow sudah berhasil. Artinya jalur install dan evaluation GovernanceOS sudah valid untuk repo ini.

Trade-off: GovernanceOS tetap bergantung pada secret eksternal, jadi jika token kedaluwarsa workflow bisa kembali perlu fallback.

Alternatif: Menyimpan GovernanceOS sebagai warning-only selamanya. Ditolak karena sekarang sudah terbukti bisa berjalan.

Rollback: Jika secret rusak lagi, kembali ke mode optional atau set `GOVERNANCE_REQUIRED=false` sementara.

Status: Aktif.

## D-012: Roadmap Lanjutan Phase 0 Disusun Sebagai Milestone Sederhana

Tanggal: 2026-06-12

Keputusan: `implementation_plan.md` dipakai sebagai roadmap lanjutan Phase 0 dengan milestone sederhana: README, examples, validasi PRD, trial pipeline nyata, promosi `experiment -> dev`, lalu promosi `dev -> main`.

Alasan: Owner meminta plan high level yang bisa dipahami junior engineer atau AI model yang lebih rendah. Rencana perlu eksplisit agar project bisa diteruskan tanpa bergantung pada konteks chat.

Trade-off: Dokumen menjadi lebih panjang, tetapi lebih mudah diikuti oleh penerus project.

Alternatif: Menyimpan plan hanya dalam chat. Ditolak karena owner sudah meminta memory dokumentasi repo selalu diperbarui.

Rollback: Jika prioritas berubah, update `implementation_plan.md` dan catat perubahan baru di decision log.

Status: Aktif.

## D-013: README Dan Examples Menjadi Bagian Wajib Sebelum Promosi Ke Dev

Tanggal: 2026-06-12

Keputusan: README usage dan folder `examples/` diperlakukan sebagai bagian wajib dari kesiapan Phase 0 sebelum promosi `experiment` ke `dev`.

Alasan: Tool CLI tanpa contoh pakai akan sulit diteruskan oleh engineer lain atau AI model yang lebih rendah, meskipun implementasi kodenya sudah benar.

Trade-off: Ada sedikit pekerjaan dokumentasi tambahan, tetapi onboarding dan verifikasi manual menjadi jauh lebih mudah.

Alternatif: Menunda dokumentasi sampai setelah code stabil penuh. Ditolak karena owner sudah menekankan pentingnya memory dan keberlanjutan project.

Rollback: Jika struktur examples perlu diubah nanti, update README dan memory tanpa mengubah keputusan bahwa contoh penggunaan tetap wajib ada.

Status: Aktif.
