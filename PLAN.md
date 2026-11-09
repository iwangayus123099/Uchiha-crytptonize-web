# Cryptonize — Roadmap Produk

Cryptonize adalah platform web trading kripto (spot) untuk pasar Indonesia: chart real-time, order book, order limit/market, dan dompet multi-aset dengan deposit Rupiah.

Roadmap ini memecah produk lengkap menjadi milestone kecil yang masing-masing bisa dikirim sendiri.

## ✅ Milestone 1 — Permukaan produk (selesai)
- Landing page bermerek (`/`) dengan preview chart BTC live, ticker, top movers, fitur, dan CTA.
- Halaman Pasar (`/markets`): pencarian, filter kategori, tabel yang bisa diurutkan, sparkline, highlight gainers/losers/volume.
- Terminal Trading (`/trade?pair=BTC`): chart candlestick multi-timeframe + MA20 + crosshair, order book & transaksi terkini live, form order limit/market dengan slider persentase, order terbuka & riwayat (bisa dibatalkan).
- Dompet (`/wallet`): total saldo (USDT & Rupiah), PnL harian, grafik nilai portofolio 30 hari, alokasi aset, tabel aset, riwayat transaksi, dialog deposit/tarik.
- Semua data adalah stub di `src/data/fixtures.ts`; harga bergerak lewat feed simulasi di `src/lib/store.ts`.

## Milestone 2 — Data pasar nyata
- Server route/function yang mengambil harga, candle, dan order book dari penyedia data (mis. API bursa publik) dengan cache singkat.
- Ganti `generateCandles`, `generateOrderBook`, `generateTrades` dan feed simulasi dengan endpoint tersebut (polling atau SSE).
- Tambah aset baru dan metadata (logo, deskripsi) dari sumber data.

## Milestone 3 — Akun & autentikasi
- Daftar, masuk, lupa kata sandi dengan Netlify Identity.
- Route terlindungi untuk `/trade` (aksi order) dan `/wallet`.
- Halaman profil & keamanan: 2FA, sesi perangkat, whitelist alamat penarikan.

## Milestone 4 — Model data & ledger
- Skema Netlify Database (Drizzle): `users`, `balances`, `orders`, `trades`, `transactions`, `watchlists`.
- Ledger saldo dengan reservasi dana saat order dipasang (logika yang sekarang ada di `placeOrder`/`cancelOrder`).
- Watchlist/favorit tersimpan per pengguna.

## Milestone 5 — Mesin order
- API server untuk pasang/batal order dengan validasi saldo di dalam transaksi database.
- Pencocokan order limit terhadap harga pasar (scheduled/background function) dan notifikasi saat terisi.
- Biaya trading per tier VIP.

## Milestone 6 — Deposit & penarikan
- Integrasi payment gateway Rupiah (virtual account, QRIS, e-wallet) dengan webhook konfirmasi.
- Alur penarikan dengan verifikasi 2FA dan status antrean.
- Verifikasi KYC (unggah KTP & selfie ke Netlify Blobs, status review).

## Milestone 7 — Pelengkap
- Notifikasi harga (price alert) dan pusat notifikasi.
- Ekspor riwayat (CSV) untuk laporan pajak.
- Halaman bantuan/FAQ, syarat & ketentuan, dan pengungkapan risiko.
