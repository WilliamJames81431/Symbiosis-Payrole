import { defineConfig } from 'vite';

export default defineConfig({
  define: {
    // Inject env vars at build time — only VITE_* vars are safe for client bundle
    'window.__ENV__': {
      API_BASE_URL: JSON.stringify(process.env.VITE_API_BASE_URL || 'http://localhost:3000'),
      APP_VERSION:  JSON.stringify('2.0.0'),
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: false,            // Never expose sourcemaps in production
    rollupOptions: {
      output: {
        manualChunks: undefined  // Single bundle for simplicity (Vanilla JS SPA)
      }
    }
  },
  server: {
    port: 5173,
    proxy: {
      // Proxy API calls in dev so we don't hit CORS
      '/api/': {
        target: process.env.VITE_API_BASE_URL || 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      }
    }
  }
});
