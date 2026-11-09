@echo off
title Cryptonize Web
cd /d "%~dp0"

echo ============================================
echo  Cryptonize Web - jalankan aplikasi
echo ============================================
echo.

where node >nul 2>nul
if errorlevel 1 (
  echo [GAGAL] Node.js belum terpasang.
  echo Install versi LTS dari https://nodejs.org lalu jalankan file ini lagi.
  echo Di halaman Custom Setup, JANGAN centang "Tools for Native Modules".
  echo.
  pause
  exit /b 1
)

if not exist "node_modules" (
  echo [1/2] Memasang dependensi. Cukup sekali, bisa beberapa menit...
  echo.
  call npm.cmd install
  if errorlevel 1 (
    echo.
    echo [GAGAL] npm install tidak berhasil. Lihat pesan error di atas.
    echo Jika muncul EPERM, pindahkan folder ini ke C:\Users\NAMA-KAMU\Documents lalu coba lagi.
    echo.
    pause
    exit /b 1
  )
)

echo.
echo [2/2] Menjalankan aplikasi di http://localhost:3000
echo Biarkan jendela ini terbuka selama aplikasi dipakai. Tutup jendela untuk menghentikan.
echo.
start "" cmd /c "timeout /t 6 >nul & start http://localhost:3000"
call npm.cmd run dev

echo.
echo Aplikasi berhenti.
pause
