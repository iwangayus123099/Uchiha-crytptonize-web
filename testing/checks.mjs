#!/usr/bin/env node
/**
 * Smoke-check untuk project cryptonize-web-trading.
 * Jalankan dari root project:
 *   node testing/checks.mjs
 *
 * Menghasilkan exit code 0 jika semua pass, 1 jika ada yang error.
 */

import { access, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

let failures = 0;
let passed = 0;

function check(name, ok, detail = '') {
  if (ok) {
    passed++;
    console.log(`  PASS  ${name}`);
  } else {
    failures++;
    console.error(`  FAIL  ${name}${detail ? ` — ${detail}` : ''}`);
  }
}

const REQUIRED_FILES = [
  'package.json',
  'vite.config.ts',
  'tsconfig.json',
  'netlify.toml',
  'src/router.tsx',
  'src/routes/__root.tsx',
  'src/routes/index.tsx',
  'src/routes/markets.tsx',
  'src/routes/trade.tsx',
  'src/routes/wallet.tsx',
  'src/routes/leaderboard.tsx',
  'src/routes/login.tsx',
  'src/routes/register.tsx',
  'src/routes/admin.tsx',
  'src/lib/store.ts',
  'src/lib/format.ts',
  'src/components/SiteHeader.tsx',
  'src/data/fixtures.ts',
  'src/data/dummy/dummyData.ts',
  'src/lib/dummy/dummyTrading.ts',
  'src/styles.css',
];

const REQUIRED_ROUTE_STEMS = [
  { file: 'src/routes/index.tsx', hint: 'beranda' },
  { file: 'src/routes/markets.tsx', hint: 'pasar' },
  { file: 'src/routes/trade.tsx', hint: 'trading' },
  { file: 'src/routes/leaderboard.tsx', hint: 'papan skor' },
];

async function exists(p) {
  try {
    await access(path.join(ROOT, p));
    return true;
  } catch {
    return false;
  }
}

console.log('cryptonize-web-trading — smoke-check\n');

// 1) File inti lengkap?
check('Struktur root', await exists('package.json'));

for (const p of REQUIRED_FILES) {
  check(`File ada: ${p}`, await exists(p));
}

// 2) Routes: createFileRoute + export Route di setiap route file? (khas TanStack Router)
for (const { file, hint } of REQUIRED_ROUTE_STEMS) {
  let content = '';
  try {
    content = await readFile(path.join(ROOT, file), 'utf8');
  } catch {
    check(`Route valid: ${hint} (${file})`, false, 'file tidak bisa dibaca');
    continue;
  }
  const hasRoute = /createFileRoute/.test(content) && /export\s+const\s+Route/.test(content);
  check(`Route valid: ${hint} (${file})`, hasRoute, 'createFileRoute/Route tidak ditemukan');
}

// 3) package.json valid dan punya scripts dev/build?
let pkg = null;
try {
  pkg = JSON.parse(await readFile(path.join(ROOT, 'package.json'), 'utf8'));
  const hasScripts = pkg.scripts && pkg.scripts.dev && pkg.scripts.build;
  check('package.json punya scripts dev & build', Boolean(hasScripts));
  check('package.json punya dependencies terisi', Object.keys(pkg.dependencies ?? {}).length > 0);
} catch (e) {
  check('package.json valid JSON', false, e.message);
}

// 4) tsconfig.json valid JSON (tanpa komentar)
let tsOk = false;
let tsDetail = '';
try {
  const raw = await readFile(path.join(ROOT, 'tsconfig.json'), 'utf8');
  JSON.parse(raw.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, ''));
  tsOk = true;
} catch (e) {
  tsDetail = e.message;
}
check('tsconfig.json valid JSON', tsOk, tsDetail);

console.log(`\nHasil: ${passed} pass, ${failures} fail`);
process.exit(failures === 0 ? 0 : 1);
