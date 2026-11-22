import { fileURLToPath } from 'node:url';

import { defineConfig } from 'vitest/config';

// unit tests of pure server code, run by `pnpm nx run server:test`; they sit next to the code they test
export default defineConfig({
  resolve: {
    // the `@/` alias of tsconfig.json and the SWC config, which Vite does not read
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
});
