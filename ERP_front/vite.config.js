import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 3000
  },
  // КРИТИЧЕСКИ ВАЖНО: если приложение в корне, оставьте '/'
  // Если в подпапке, например /erp/, тогда '/erp/'
  base: '/',
  build: {
    outDir: 'dist',
    // Для HashRouter это важно
    assetsDir: 'assets',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom']
        }
      }
    }
  }
})