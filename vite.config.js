import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://svs-90l6.onrender.com',
        changeOrigin: true,
      },
      '/orders': {
        target: 'https://svs-90l6.onrender.com',
        changeOrigin: true,
      },
    },
  },
})