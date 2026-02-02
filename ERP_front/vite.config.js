import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 3000,
    // ВАЖНО: добавь эту настройку
    historyApiFallback: {
      disableDotRule: true,
      rewrites: [
        // Все маршруты, кроме API, отправляй на index.html
        { from: /^\/api\/.*/, to: '' },
        { from: /./, to: '/index.html' }
      ]
    }
  }
})