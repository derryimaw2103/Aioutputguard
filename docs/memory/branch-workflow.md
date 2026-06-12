# Branch Workflow

## Aturan Utama

Semua pekerjaan baru harus mengikuti alur:

```text
experiment -> dev -> main
```

## Makna Branch

### `experiment`

Tempat kerja default untuk:

- fitur baru.
- perubahan workflow.
- integrasi GovernanceOS.
- spike teknis.
- refactor yang belum pasti.
- ide yang masih perlu divalidasi.

### `dev`

Tempat integrasi untuk perubahan yang:

- sudah dipilih dari `experiment`.
- sudah lolos quality gate lokal.
- sudah cukup stabil untuk review lebih serius.

### `main`

Tempat baseline stabil untuk:

- hasil yang sudah direview.
- hasil yang sudah lolos CI.
- versi yang bisa dianggap releasable.

## SOP Kerja

Sebelum mulai:

```bash
git checkout experiment
git pull origin experiment
git status --short --branch
```

Setelah implementasi:

```bash
npm run format:check
npm run lint
npm run lint:sarif
npm run typecheck
npm test
npm run build
npm pack --dry-run
```

Jika hijau, commit ke `experiment`.

Promosi ke `dev` dilakukan setelah perubahan dianggap layak:

```bash
git checkout dev
git pull origin dev
git merge --ff-only experiment
git push origin dev
```

Promosi ke `main` sebaiknya melalui pull request dari `dev`.

## Prinsip Keamanan

- Jangan langsung kerja di `main`.
- Jangan push perubahan besar langsung ke `dev` kecuali memperbaiki kesalahan proses yang sudah jelas.
- Jangan gunakan force push kecuali owner secara eksplisit menyetujui.
- Jangan commit `asisten_ai.md` atau `prd.md` tanpa instruksi owner.
