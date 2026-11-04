import tseslint from 'typescript-eslint';
import cspellPlugin from '@cspell/eslint-plugin';
import { moduleBoundariesConfig } from '@shared/eslint-config';

export default tseslint.config(
  { ignores: ['**/dist'] },
  {
    files: ['**/*.ts'],
    languageOptions: { parser: tseslint.parser },
    plugins: {
      '@typescript-eslint': tseslint.plugin,
      '@cspell': cspellPlugin,
      ...moduleBoundariesConfig.plugins,
    },
    rules: moduleBoundariesConfig.rules,
  },
);
