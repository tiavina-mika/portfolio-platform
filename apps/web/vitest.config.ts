import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
import { playwright } from '@vitest/browser-playwright';
import { defineConfig } from 'vitest/config';

import { STORYBOOK_ENV } from './.storybook/storybook-env';

const dirname =
  typeof __dirname !== 'undefined' ? __dirname : path.dirname(fileURLToPath(import.meta.url));

// every story is run as a test (render + play function + a11y), see `pnpm test-storybook`
export default defineConfig({
  test: {
    projects: [
      {
        extends: true,
        optimizeDeps: {
          // found while the run is under way otherwise: each late discovery restarts the optimizer
          include: [
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-popover',
            '@radix-ui/react-select',
            'cmdk',
          ],
        },
        plugins: [storybookTest({ configDir: path.join(dirname, '.storybook') })],
        test: {
          name: 'storybook',
          /*
           * one story file at a time: fewer Chromium pages competing for the two cores of a CI runner
           * (it does not prevent the occasional dropped iframe, see scripts/run-story-tests.mjs)
           */
          fileParallelism: false,
          setupFiles: ['.storybook/vitest.setup.ts'],
          // the browser has no `.env` file: placeholders for what `env.ts` validates
          env: STORYBOOK_ENV,
          browser: {
            enabled: true,
            headless: true,
            provider: playwright({}),
            instances: [{ browser: 'chromium' }],
          },
        },
      },
    ],
  },
});
