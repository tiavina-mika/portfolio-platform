// This file has been automatically migrated to valid ESM format by Storybook.
import { fileURLToPath } from "node:url";
import path, { dirname } from 'path';

import type { StorybookConfig } from '@storybook/nextjs-vite';
import { mergeConfig } from "vite";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const config: StorybookConfig = {
  'stories': [
    '../stories/**/*.mdx',
    '../stories/**/*.stories.@(js|jsx|mjs|ts|tsx)',
    '../stories/**/**/*.stories.@(js|jsx|mjs|ts|tsx)',
    '../stories/**/**/**/*.stories.@(js|jsx|mjs|ts|tsx)',
    '../stories/**/**/**/**/*.stories.@(js|jsx|mjs|ts|tsx)',
  ],

  'addons': [
    '@storybook/addon-links',
    '@storybook/addon-onboarding',
    '@storybook/addon-themes',
    '@chromatic-com/storybook',
    // Add the visual test addon here
    '@storybook/addon-docs',
    "@storybook/addon-vitest",
    "@storybook/addon-a11y",
  ],

  'framework': {
    'name': '@storybook/nextjs-vite',
    'options': {},
  },
  "staticDirs": [
    "..\\public"
  ],
  'docs': {},

  async viteFinal(config) {
    return mergeConfig(config, {
      resolve: {
        alias: {
          // Résout le problème "Emitter is not a constructor" avec Parse
          // quand tu utilises import Parse from 'parse' ou 'parse/dist/browser'
          events: 'eventemitter3',

          // Optionnel : autres alias que vous utilisez dans votre projet Next.js
          // '@/components': path.resolve(__dirname, '../components'),
        },
      },

      optimizeDeps: {
        include: ['eventemitter3'], // évite des warnings Vite
      },


  typescript: {
    reactDocgen: 'react-docgen-typescript'
  }

    });
  },
};

export default config;
