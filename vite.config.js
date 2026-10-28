import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: '/musica-retro/',
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icono.svg'],
      manifest: {
        name: 'Música Retro',
        short_name: 'Música Retro',
        description: 'Catálogo personal de vinilos y CDs',
        lang: 'es-AR',
        theme_color: '#0d0c0f',
        background_color: '#0d0c0f',
        display: 'standalone',
        start_url: '/musica-retro/',
        scope: '/musica-retro/',
        icons: [
          { src: 'icono-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icono-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icono-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
        clientsClaim: true,
        skipWaiting: true,
        runtimeCaching: [
          {
            // Google Fonts: hojas de estilo y archivos de fuente
            urlPattern: ({ url }) => url.origin === 'https://fonts.googleapis.com' || url.origin === 'https://fonts.gstatic.com',
            handler: 'StaleWhileRevalidate',
            options: { cacheName: 'fuentes', cacheableResponse: { statuses: [0, 200] } },
          },
          {
            // Imágenes privadas: la clave de caché es la ruta, sin el token de la URL firmada
            urlPattern: ({ url }) => url.pathname.includes('/storage/v1/object/sign/imagenes/'),
            handler: 'CacheFirst',
            options: {
              cacheName: 'imagenes',
              matchOptions: { ignoreVary: true },
              cacheableResponse: { statuses: [200] },
              plugins: [
                {
                  cacheKeyWillBeUsed: async ({ request }) => {
                    const url = new URL(request.url)
                    url.search = ''
                    return url.href
                  },
                },
              ],
            },
          },
        ],
      },
    }),
  ],
  test: {
    environment: 'node',
  },
})
