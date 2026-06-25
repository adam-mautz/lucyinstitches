import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    // Bind on all interfaces (IPv4 + IPv6) so both localhost and
    // 127.0.0.1 work — avoids the IPv6-only "blank page" gotcha.
    host: true,
  },
});
