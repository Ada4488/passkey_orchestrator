import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    environment: 'happy-dom',
    globals: true,
    setupFiles: ['./src/test-setup.ts']
  },
  resolve: {
    alias: {
      '@passkey-orchestrator/shared': path.resolve(__dirname, '../shared/src')
    }
  }
});
