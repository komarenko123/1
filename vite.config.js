import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],
  base: '/1/',
  server: {
    proxy: {
      '/api': {
        target: 'https://komarenko123.github.io/1/',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  },
  define: {
    'process.env': {
      VITE_SOCKET_URL: 'https://komarenko123.github.io/1/'
    }
  }
});