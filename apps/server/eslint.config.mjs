import globals from 'globals';
import stylistic from '@stylistic/eslint-plugin';
import tseslint from 'typescript-eslint';

import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import preferArrowFunctions from 'eslint-plugin-prefer-arrow-functions';
import js from '@eslint/js';
import comments from '@eslint-community/eslint-plugin-eslint-comments/configs';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import { defineConfig } from 'eslint/config';
import cspellESLintPluginRecommended from '@cspell/eslint-plugin/recommended';
import importPlugin from 'eslint-plugin-import';
import lodashPlugin from 'eslint-plugin-lodash';
import externalImportEsm from 'eslint-plugin-external-import-esm';
import { stylisticRules, typescriptRules, moduleBoundariesConfig, coreDomainBoundaryConfig } from '@shared/eslint-config';

// --- General rules ---
const generalRules = {
  '@cspell/spellchecker': [
    'warn',
    {
      configFile: new URL('./.cspell.json', import.meta.url).toString(),
    },
  ],
  'require-await': 'off', // Use TS version
  '@typescript-eslint/no-empty-object-type': 'off',
  'prettier/prettier': ['off', { singleQuote: true }],
  '@typescript-eslint/no-explicit-any': 'off',
  'import/no-extraneous-dependencies': 'off',
  'import/extensions': 'off',
  'no-await-in-loop': 'off',
  'import/no-cycle': 'off',
  'no-plusplus': 'off',
  'no-param-reassign': 'off',
  'prefer-template': 'off',
  'no-console': 'off',
  'import/prefer-default-export': 'off',
  'global-require': 'off',
  'jsx-a11y/label-has-associated-control': 'off',
  'jsx-a11y/control-has-associated-label': 'off',
  'max-len': 'off',
  'consistent-return': 'off',
  'no-restricted-syntax': 'off',
  'arrow-body-style': 'off',
  'prefer-arrow-callback': 'off',
  'no-unsafe-optional-chaining': 'error',
  'prefer-arrow-functions/prefer-arrow-functions': [
    'warn',
    {
      allowNamedFunctions: false,
      classPropertiesAllowed: false,
      disallowPrototype: false,
      returnStyle: 'unchanged',
      singleReturnOnly: false,
    },
  ],
  'no-use-before-define': 'error',
  'array-bracket-spacing': ['error', 'never'],
  'block-spacing': 'error',
  'no-unused-vars': 'off',
  '@eslint-community/eslint-comments/disable-enable-pair': 'off',
  camelcase: 'off',
  'import/no-unresolved': 'off', // Enforce resolution of imports
  // import order
  'import/order': [
    'error',
    {
      groups: [
        'builtin', // Node built-ins (if any)
        'external', // External libs (alphabetical)
        'internal', // Internal libs (alphabetical)
        'type', // Type imports (alphabetical)
        'unknown', // For CSS (custom)
        ['parent', 'sibling', 'index'], // Relative imports
      ],
      'newlines-between': 'always', // Empty lines (spaces) between groups
      alphabetize: {
        order: 'asc',
        caseInsensitive: true, // Fixed: Use 'caseInsensitive' instead of 'ignoreCase'
        orderImportKind: 'ignore', // Optional: Ignore kind ordering (default)
      },
      pathGroups: [
        // Node.js built-in modules first
        {
          pattern: 'node:*',
          group: 'builtin',
          position: 'before',
        },
        // Express imports after builtins
        {
          pattern: 'express',
          group: 'external',
          position: 'before',
        },
        // Parse Server imports after express
        {
          pattern: 'parse-server',
          group: 'external',
          position: 'before',
        },
        // Internal with @ alias (treat as internal group)
        {
          pattern: '^@/',
          group: 'internal',
          position: 'before', // Before other internals if needed
        },
      ],
    },
  ],
};

export default defineConfig(
  {
    ignores: [
      '**/dist',
      '**/node_modules/',
      '**/.prettierrc.mjs',
      '**/eslint.config.mjs',
      '**/demos/',
      '**/commitlint.config.mjs',
      // plain Node tooling, outside the TypeScript project the rules are typed against
      '**/scripts/*.mjs',
      '**/config',
      '**/clientBuild',
      '**/coverage',
      '**/scripts/*.js',
    ],
  },
  { files: ['**/*.ts', '**/*.tsx'], ...moduleBoundariesConfig },
  ...coreDomainBoundaryConfig(),
  jsxA11y.flatConfigs.recommended,
  eslintPluginPrettierRecommended,
  cspellESLintPluginRecommended,
  comments.recommended,
  importPlugin.flatConfigs.recommended,
  // This add .js extension support for ESM imports (e.g: import x from 'async/queue.js.js')
  externalImportEsm.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,
  {
    languageOptions: {
      globals: {
        ...globals.node,
        Parse: 'readonly',
      },
      parserOptions: {
        projectService: {
          allowDefaultProject: ['*.mjs', '*.js'],
          defaultProject: 'tsconfig.json',
        },
        tsconfigRootDir: import.meta.dirname,
      },
      sourceType: 'module',
      ecmaVersion: 2023,
    },
  },
  {
    extends: [js.configs.recommended],
    files: ['**/*.ts', '**/*.tsx'],
    plugins: {
      'prefer-arrow-functions': preferArrowFunctions,
      '@stylistic': stylistic,
      js,
    },
    rules: {
      ...generalRules,
      ...stylisticRules,
      ...typescriptRules,
      // rolled out here first (Cloud Functions/triggers/jobs are the most exposed to unhandled
      // rejections)
      '@typescript-eslint/await-thenable': 'warn',
      '@typescript-eslint/no-floating-promises': 'warn',
    },
  },
  // --- Lodash rules --- //
  {
    files: ["**/*.js", "**/*.ts"],
    plugins: {
      lodash: lodashPlugin,
    },
    rules: {
      "lodash/import-scope": ["error", "method"],
    },
  },
);
