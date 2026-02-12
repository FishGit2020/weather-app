import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import federation from '@originjs/vite-plugin-federation';
import { VitePWA } from 'vite-plugin-pwa';

const isProduction = process.env.NODE_ENV === 'production';

// In production (Firebase), all MFs are served from the same origin
// In development, each MF runs on its own port
const citySearchRemote = isProduction
  ? '/city-search/assets/remoteEntry.js'
  : 'http://localhost:3001/assets/remoteEntry.js';

const weatherDisplayRemote = isProduction
  ? '/weather-display/assets/remoteEntry.js'
  : 'http://localhost:3002/assets/remoteEntry.js';

const stockTrackerRemote = isProduction
  ? '/stock-tracker/assets/remoteEntry.js'
  : 'http://localhost:3005/assets/remoteEntry.js';

const podcastPlayerRemote = isProduction
  ? '/podcast-player/assets/remoteEntry.js'
  : 'http://localhost:3006/assets/remoteEntry.js';

export default defineConfig({
  plugins: [
    react(),
    federation({
      name: 'shell',
      remotes: {
        citySearch: citySearchRemote,
        weatherDisplay: weatherDisplayRemote,
        stockTracker: stockTrackerRemote,
        podcastPlayer: podcastPlayerRemote
      },
      shared: ['react', 'react-dom', 'react-router', '@apollo/client', '@weather/shared']
    }),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'icons/*.png'],
      manifest: {
        name: 'MyCircle',
        short_name: 'MyCircle',
        description: 'Your personal dashboard for weather, stocks, podcasts, and more',
        theme_color: '#3b82f6',
        background_color: '#1e293b',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: '/icons/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/icons/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: '/icons/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /\/remoteEntry\.js$/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'mfe-remote-entries',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 // 1 hour
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            urlPattern: /^https:\/\/.*\.openweathermap\.org\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'weather-api-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 5 // 5 minutes
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            urlPattern: /\/graphql/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'graphql-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 5 // 5 minutes
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ]
      },
      devOptions: {
        enabled: true // Enable PWA in development for testing
      }
    })
  ],
  build: {
    modulePreload: false,
    target: 'esnext',
    minify: false,
    cssCodeSplit: false
  },
  server: {
    port: 3000,
    strictPort: true,
    cors: true
  },
  preview: {
    port: 3000,
    strictPort: true
  }
});
