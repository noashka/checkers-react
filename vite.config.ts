import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: { port: 1337 },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./config/setupTests.ts'],
    coverage: {
      provider: 'v8',
      include: ['src/domain/**/*.ts', 'src/entities/**/*.ts'],
      exclude: ['src/domain/testBoard.ts', '**/*.test.ts'],
      thresholds: { statements: 100, branches: 100, functions: 100, lines: 100 },
    },
  },
});
