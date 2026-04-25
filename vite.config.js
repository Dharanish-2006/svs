import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import vike from 'vite-plugin-ssr/plugin'

export default defineConfig({
  plugins: [react(), vike()],
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
