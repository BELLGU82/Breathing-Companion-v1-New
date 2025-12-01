import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    server: {
      port: 3000,
      host: '0.0.0.0',
    },
    plugins: [
      react(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['**/*.mp3', '**/*.png', '**/*.svg', '**/*.ico'],
        manifest: {
          name: 'Neshima - Breathing Companion',
          short_name: 'Neshima',
          description: 'אפליקציית נשימה מרגיעה לניהול לחץ וחרדה',
          theme_color: '#E0E5EC',
          background_color: '#E0E5EC',
          display: 'standalone',
          orientation: 'portrait',
          dir: 'rtl',
          lang: 'he',
          start_url: '/',
          scope: '/',
          icons: [
            {
              src: '/icon-192.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'any maskable'
            },
            {
              src: '/icon-512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any maskable'
            }
          ],
          categories: ['health', 'wellness', 'lifestyle']
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,mp3}'],
          maximumFileSizeToCacheInBytes: 20 * 1024 * 1024, // allow precaching larger audio like calm_music.mp3
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'google-fonts-cache',
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 60 * 24 * 365
                },
                cacheableResponse: {
                  statuses: [0, 200]
                }
              }
            }
          ]
        },
        devOptions: {
          enabled: true,
          type: 'module',
        },
      })
    ],
    define: {
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    },
    assetsInclude: ['**/*.mp3']
  };
});
