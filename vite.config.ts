import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import viteTsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  base: '/',
  plugins: [react(), viteTsconfigPaths()],
  resolve: {
    alias: []
  },
  server: {
    open: true,
    port: 3000,
    proxy: {
      // Proxy API calls during local dev
      '/api': {
        target: 'http://161.97.134.211/xp', // 👈 backend server
        changeOrigin: true,
        secure: false
      }
    }
  }
});
