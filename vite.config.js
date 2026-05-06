import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://chalebuddy-backend.onrender.com', // Localhost ki jagah Render ka link use karein
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
  }
})