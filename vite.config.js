import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true,
    proxy: {
      // Proxy API requests to avoid CORS issues during development
      '/api': {
        target: 'https://hiring-dev.internal.kloudspot.com',
        changeOrigin: true,
        secure: true,
        // Don't rewrite - keep /api in the path
      }
    }
  }
})

