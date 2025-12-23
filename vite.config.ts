import { defineConfig } from 'vite';

export default defineConfig({
  base: '/break_WEB/',
  build: {
    outDir: 'docs',
    emptyOutDir: true,
  },
  server: {
    port: 5173,
  },
});
