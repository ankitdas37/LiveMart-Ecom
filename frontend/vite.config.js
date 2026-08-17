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
        // Must be a Function in Vite 8+ (not a plain object)
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react-dom') || id.includes('react-router-dom')) return 'vendor-react';
            if (id.includes('react/') || id.includes('/react.')) return 'vendor-react';
            if (id.includes('react-hot-toast') || id.includes('react-helmet-async')) return 'vendor-ui';
            if (id.includes('@react-oauth') || id.includes('axios')) return 'vendor-auth';
            if (id.includes('socket.io-client')) return 'vendor-socket';
          }
        },
      },
    },
  },
})

