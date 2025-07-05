import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path'; // Добавьте этот импорт

export default defineConfig({
  plugins: [vue()],
  base: '/1/',
  
  // Настройки для разработки
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000', // Для разработки используем localhost
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  },

  // Настройки для production
  build: {
    rollupOptions: {
      external: ['socket.io-client'], // Решает проблему с импортом socket.io
      output: {
        assetFileNames: 'assets/[name].[hash][extname]',
        chunkFileNames: 'assets/[name].[hash].js',
        entryFileNames: 'assets/[name].[hash].js'
      }
    }
  },

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src') // Опционально: алиас для путей
    }
  },

  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production'),
    'process.env.VITE_SOCKET_URL': JSON.stringify(
      process.env.NODE_ENV === 'development' 
        ? 'http://localhost:3000' 
        : 'https://komarenko123.github.io/1/'
    )
  }
});