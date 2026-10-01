import { defineConfig } from 'vitest/config';

// Unit tests for pure logic (validation, ViewModel helpers). Screens are checked in the app.
export default defineConfig({
  test: {
    include: ['src/**/*.test.ts'],
  },
});
