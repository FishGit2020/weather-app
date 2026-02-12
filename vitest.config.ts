import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      'citySearch/CitySearch': resolve(__dirname, './packages/shell/src/test/mocks/CitySearchMock.tsx'),
      'weatherDisplay/WeatherDisplay': resolve(__dirname, './packages/shell/src/test/mocks/WeatherDisplayMock.tsx'),
      'stockTracker/StockTracker': resolve(__dirname, './packages/shell/src/test/mocks/StockTrackerMock.tsx'),
    }
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      'e2e/**',
      'functions/**',
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        '**/*.d.ts',
        '**/*.config.*',
        'dist/'
      ]
    }
  }
})
