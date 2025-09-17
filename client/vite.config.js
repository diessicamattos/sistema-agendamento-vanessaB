import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',       // service worker atualiza sozinho
      includeAssets: [
        'favicon.ico',
        'apple-touch-icon.jpg',
        'icons/mask-icon.svg'
      ],
      manifest: {
        name: 'Agenda Manicure',
        short_name: 'Agenda',
        description: 'Agendamentos e gestão da manicure',
        theme_color: '#2f2f2f',         // cinza escuro do seu layout
        background_color: '#fdfaf6',    // bege do seu layout
        display: 'standalone',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: 'icons/pwa-192x192.jpg',
            sizes: '192x192',
            type: 'image/jpg'
          },
          {
            src: 'icons/pwa-512x512.jpg',
            sizes: '512x512',
            type: 'image/jpg'
          },
          {
            src: 'icons/pwa-512x512-maskable.jpg',
            sizes: '512x512',
            type: 'image/jpg',
            purpose: 'maskable'
          }
        ]
      },
      workbox: {
        // Mantemos simples para não interferir no Firebase/Firestore.
        // O plugin já faz o pre-cache dos assets do build.
        globPatterns: ['**/*.{js,css,html,ico,jpg,svg,webp}']
      }
    })
  ]
})