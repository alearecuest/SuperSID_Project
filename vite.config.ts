import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  base: './',
  server: {
    port: 5173,
    strictPort: false,
    hmr: {
      host: 'localhost',
      port: 5173,
    },
  },
  build: {
    outDir: 'dist/renderer',
    sourcemap: false,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/renderer/components'),
      '@pages': path.resolve(__dirname, './src/renderer/pages'),
      '@hooks': path.resolve(__dirname, './src/renderer/hooks'),
      '@utils': path.resolve(__dirname, './src/renderer/utils'),
      '@types': path.resolve(__dirname, './src/renderer/types'),
      '@context': path.resolve(__dirname, './src/renderer/context'),
      '@styles': path.resolve(__dirname, './src/renderer/styles'),
    },
  },
});