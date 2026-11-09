# Folder Testing

Berisi smoke-check sederhana untuk project ini.

## Cara pakai (dari root project)

```bash
node testing/checks.mjs
```

Akan mengecheck:

- File-file inti (source, config, docs) lengkap
- Route TanStack Router valid (`createFileRoute` + `export const Route`)
- `package.json` formatnya valid & punya scripts `dev`/`build`
- `tsconfig.json` formatnya valid

Exit code `0` = semua pass, `1` = ada yang gagal (cocok untuk CI).

## Check yang lebih dalam (butuh `npm install` dulu)

```bash
npx tsc --noEmit   # cek type-error di seluruh codebase
npm run build      # cek bisa di-build (dipakai Netlify juga)
```

## Isi modul dummy yang Dimitri check

- `src/data/dummy/dummyData.ts` — data koin & kuis fiktif
- `src/lib/dummy/dummyTrading.ts` — engine trading simulasi (order, posisi, PnL)
