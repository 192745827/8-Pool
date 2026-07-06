import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  server: {
    port: 5173,
    fs: {
      // Allow serving files from the workspace root (e.g. shared/)
      allow: ['..']
    }
  }
});
