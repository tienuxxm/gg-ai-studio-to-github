// frontend/vite.config.ts
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Load biến môi trường (.env hoặc .env.production)
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],
    
    // 1. Base path lấy từ biến môi trường (Linh hoạt)
    base: env.VITE_BASE_PATH, 

    server: {
      // 2. Cấu hình Proxy cho npm run dev
      proxy: {
        '/api': {
          target: 'http://127.0.0.1:8000', // Trỏ về Laravel đang chạy
          changeOrigin: true,
          secure: false,
        },
      },
    },

    optimizeDeps: { exclude: ['lucide-react'] },
    build: {
      outDir: '../public',
      emptyOutDir: false,
    }
  };
});