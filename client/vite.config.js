import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// In development the browser talks only to http://localhost:5173.
// Vite forwards every /api request to the Express server, so the browser sees ONE origin:
// no CORS problems and the HttpOnly auth cookie works with SameSite=Lax.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:5000',
        changeOrigin: true,
      },
    },
  },
});
