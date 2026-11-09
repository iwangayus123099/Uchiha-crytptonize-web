# Cryptonize — Web Trading Kripto

Cryptonize adalah aplikasi web trading kripto spot: landing page, daftar pasar, terminal trading dengan chart candlestick dan order book, serta dompet multi-aset dengan riwayat transaksi. Antarmuka berbahasa Indonesia dengan harga dalam USDT dan estimasi Rupiah.

Versi saat ini berjalan dengan akun demo dan harga simulasi — order, deposit, dan penarikan bekerja di dalam sesi browser sehingga seluruh alur bisa dicoba tanpa backend.

## Layar
- `/` — landing page dengan preview chart live
- `/markets` — pasar: pencarian, kategori, urutan, sparkline
- `/trade?pair=BTC` — terminal trading: chart, order book, form order, order terbuka/riwayat
- `/wallet` — dompet: saldo, grafik portofolio, alokasi, deposit/tarik, riwayat

## Teknologi
- TanStack Start (React 19) dengan file-based routing
- Tailwind CSS v4 (tema di `src/styles.css`)
- Chart.js untuk grafik dompet; chart candlestick SVG kustom
- TanStack Store untuk state sesi (harga live & akun demo)
- Di-deploy di Netlify

## Menjalankan secara lokal
Butuh Node.js 22 atau lebih baru. Jika belum punya pnpm, aktifkan dengan `corepack enable` (atau pakai `npm`).

1. Ekstrak zip, lalu buka foldernya di VS Code (**File → Open Folder…**).
2. Buka terminal VS Code (**Terminal → New Terminal**) dan jalankan:
   ```bash
   pnpm install   # atau: npm install
   pnpm dev       # atau: npm run dev
   ```
3. Buka http://localhost:3000 di browser.

Cara cepat di VS Code: setelah `npm install`, tekan **F5** (Run → Start Debugging) dan pilih **Jalankan Cryptonize (dev server)**. Dev server langsung jalan dan browser terbuka otomatis. Rekomendasi ekstensi (Tailwind CSS IntelliSense, Prettier, Netlify) akan ditawarkan saat folder dibuka.

Untuk emulasi fitur Netlify secara lokal, pasang Netlify CLI (`npm i -g netlify-cli`) lalu jalankan `netlify dev` (terbuka di http://localhost:8888).

## Roadmap
Pekerjaan berikutnya — data pasar nyata, autentikasi, database & ledger, mesin order, deposit Rupiah, dan KYC — dijabarkan di [PLAN.md](./PLAN.md).

## Akun, belajar, dan admin

- `/register` dan `/login`: daftar akun (nama, email, username, kata sandi) lalu masuk. Akun admin demo: `admin` / `admin123`.
- Halaman `/dashboard`, `/profile`, `/materi`, `/kuis/...`, `/leaderboard`, `/trade`, dan `/wallet` memerlukan akun masuk. Pengunjung diarahkan ke `/login`.
- `/materi`: materi per topik. Buka sebuah materi (`/materi/...`) untuk menandai bagian sebagai selesai (+10 poin per bagian).
- `/kuis/...`: kuis pilihan ganda. Setiap jawaban benar (nilai terbaik) bernilai 10 poin.
- `/leaderboard`: peringkat pengguna berdasarkan poin.
- `/admin` (khusus admin): tambah, ubah, dan hapus materi serta soal kuis.

Data akun, progres, dan materi disimpan di localStorage browser (kunci `cryptonize:v2`). Saldo dan transaksi trading masih memakai akun demo bersama, belum dipisah per pengguna (lihat PLAN.md Milestone 4).
