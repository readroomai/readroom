import { defineConfig } from 'vitest/config';
import path from 'node:path';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/unit/**/*.test.ts'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      // 'server-only' is a no-op guard package; stub it so server modules import in tests
      'server-only': path.resolve(__dirname, './tests/stubs/server-only.ts'),
    },
  },
});
