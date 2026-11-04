import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Capture Berita Pintar',
        short_name: 'BeritaPintar',
        description: 'Aplikasi preview berita dari berbagai media',
        theme_color: '#2563eb',
        background_color: '#f0f2f5',
        display: 'standalone', // Membuat tampilan seperti aplikasi HP asli
        icons: [
          {
            src: 'https://cdn-icons-png.flaticon.com/512/2965/2965879.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ],
})