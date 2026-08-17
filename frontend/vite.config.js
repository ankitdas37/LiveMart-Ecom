import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
  build: {
    // Reduce chunk warning limit
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        // Split vendor libraries into separate cached chunks
        manualChunks: {
          // Core React runtime — rarely changes, cached aggressively
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          // UI/notification libs
          'vendor-ui': ['react-hot-toast', 'react-helmet-async'],
          // Auth + HTTP
          'vendor-auth': ['axios', '@react-oauth/google'],
          // Socket.IO client
          'vendor-socket': ['socket.io-client'],
        },
      },
    },
  },
})

