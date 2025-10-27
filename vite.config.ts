import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import viteTsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig(() => {
  const apiBaseUrl = process.env.VITE_API_BASE_URL;

  return {
    base: '/',
    plugins: [react(), viteTsconfigPaths()],
    resolve: { alias: [] },
    server: {
      open: true,
      port: Number(process.env.VITE_PORT) || 3000,
      proxy: {
        '/api': {
          target: apiBaseUrl,
          changeOrigin: true,
          secure: false
        }
      }
    }
  };
});
