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
