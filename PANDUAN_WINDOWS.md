# Panduan Cryptonize (Windows) - versi 5

## Cara tercepat (disarankan)

1. **Install Node.js** (sekali saja)
   - Buka https://nodejs.org, unduh versi **LTS**, lalu install.
   - Di halaman *Custom Setup*, biarkan **Add to PATH** tercentang.
   - **Jangan** centang **Tools for Native Modules** / *Automatically install the necessary tools*.

2. **Ekstrak zip** ke folder milik kamu, misalnya:
   `C:\Users\NAMA-KAMU\Documents\cryptonize`
   - Klik kanan zip → **Extract All…** → pilih folder tadi → **Extract**.
   - Jangan jalankan dari dalam zip.

3. **Klik dua kali `JALANKAN.bat`** di folder hasil ekstrak.
   - Pertama kali: file ini memasang dependensi (beberapa menit).
   - Setelah selesai, browser otomatis membuka http://localhost:3000.
   - Biarkan jendela hitam tetap terbuka selama aplikasi dipakai. Tutup jendela untuk menghentikan.

4. **Login**
   - Admin: `admin` / `admin123`
   - Pengguna baru: klik **Daftar**.

## Jika mau pakai VS Code

1. Buka VS Code biasa (**jangan** *Run as administrator*).
2. **File → Open Folder…** → pilih folder hasil ekstrak (yang berisi `package.json`).
3. **Terminal → New Terminal**, lalu ketik:
   ```
   npm install
   npm run dev
   ```
4. Jika muncul `npm.ps1 cannot be loaded`, pakai `npm.cmd install` dan `npm.cmd run dev`.

## Masalah umum

| Pesan | Solusi |
|---|---|
| `Node.js belum terpasang` | Install Node.js LTS dari nodejs.org, lalu restart komputer |
| `npm error code EPERM` | Pindahkan folder ke `Documents`, jangan ke `Downloads`, `C:\`, atau `D:\`. Jangan jalankan sebagai administrator |
| `Another instance of Code is already running` | Task Manager → End task semua *Visual Studio Code* |
| `Port 3000 is in use` | Tutup jendela aplikasi lain yang memakai port 3000, lalu jalankan ulang |
| Layar kosong | Tekan Ctrl+Shift+R di browser |
| Data akun hilang | Data tersimpan di browser. DevTools → Application → Local Storage → hapus `cryptonize:v2` |

Jangan pernah menjalankan `JALANKAN.bat` atau `npm install` sebagai administrator. Ini yang membuat folder `node_modules` dimiliki administrator, sehingga akun biasa gagal menulis.

## Catatan versi 5
- Server dev sebelumnya bisa crash dengan pesan `EdgeFunctionsHandler.initialize` dan `ERR_CONNECTION_REFUSED`. Sudah diperbaiki: plugin Netlify hanya dipakai saat build, bukan saat `npm run dev`.
- Jika kamu masih memakai versi 4, ganti isi `vite.config.ts` dengan versi dari zip v5, lalu jalankan ulang `npm.cmd run dev`.
