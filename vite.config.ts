import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import viteTsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  // Dynamically set which backend to use based on the mode
  const API_URL =
    mode === 'development'
      ? env.VITE_DEV_URL || 'https://xp-backend.sytes.net/api/v1'
      : env.VITE_APP_API_URL || 'https://airquality.nairobi.go.ke/api/api/v1';

  return {
    // 👇 Important: use '/dashboard/' explicitly for production
    // You can still override with VITE_APP_BASE_NAME if needed.
    // base: mode === 'development' ? '/' : env.VITE_APP_BASE_NAME || '/dashboard/',
    base: '/',

    plugins: [react(), viteTsconfigPaths()],

    server: {
      open: true,
      port: 3000,

      proxy: {
        '/api': {
          target: API_URL,
          changeOrigin: true,
          secure: false,
          // remove /api prefix only if necessary
          // rewrite: (path) => path.replace(/^\/api/, '')
        }
      }
    }
  };
});
