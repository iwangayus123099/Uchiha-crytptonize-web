import { defineConfig } from 'vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import netlify from '@netlify/vite-plugin-tanstack-start'

// Plugin Netlify hanya dipakai saat build (untuk deploy).
// Saat `npm run dev` di komputer lokal, plugin ini dilewati agar server tidak crash.
export default defineConfig(({ command }) => ({
  resolve: { tsconfigPaths: true },
  plugins: [
    tailwindcss(),
    ...(command === 'build' ? [netlify()] : []),
    tanstackStart(),
    viteReact(),
  ],
}))
