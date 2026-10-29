import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactPlugin from 'eslint-plugin-react';
import stylistic from '@stylistic/eslint-plugin';
import perfectionist from 'eslint-plugin-perfectionist';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';

import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import preferArrowFunctions from 'eslint-plugin-prefer-arrow-functions';
import js from '@eslint/js';
import comments from '@eslint-community/eslint-plugin-eslint-comments/configs';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import { defineConfig } from 'eslint/config';
import cspellESLintPluginRecommended from '@cspell/eslint-plugin/recommended';
import importPlugin from 'eslint-plugin-import';
import { stylisticRules, typescriptRules, jsxRules, moduleBoundariesConfig, coreDomainBoundaryConfig } from '@shared/eslint-config';

// --- General rules ---
const generalRules = {
  '@cspell/spellchecker': [
    'warn',
    {
      configFile: new URL('./.cspell.json', import.meta.url).toString(),
    },
  ],
  '@typescript-eslint/no-empty-object-type': 'off',
  'react-refresh/only-export-components': [
    'warn',
    { allowConstantExport: true },
  ],
  'prettier/prettier': ['off', { singleQuote: true }],
  '@typescript-eslint/no-explicit-any': 'off',
  'import/no-extraneous-dependencies': 'off',
  'import/extensions': 'off',
  'no-await-in-loop': 'off',
  'import/no-cycle': 'off',
  'no-plusplus': 'off',
  'no-param-reassign': 'off',
  'prefer-template': 'off',
  'react/react-in-jsx-scope': 'off',
  'no-console': 'off',
  'import/prefer-default-export': 'off',
  'global-require': 'off',
  'react/require-default-props': 'off',
  'react/jsx-props-no-spreading': 'off',
  'jsx-a11y/label-has-associated-control': 'off',
  'react/no-unescaped-entities': 'off',
  'jsx-a11y/control-has-associated-label': 'off',
  'react/function-component-definition': 'off',
  'react/prop-types': 'off',
  'max-len': 'off',
  'consistent-return': 'off',
  'react/no-array-index-key': 'off',
  // false-positive prone on `forwardRef((props, ref) => ...)` — TS already gives strong typing here
  'react/display-name': 'off',
  'no-restricted-syntax': 'off',
  'arrow-body-style': 'off',
  'prefer-arrow-callback': 'off',
  'no-unsafe-optional-chaining': 'error',
  // the bare 'lodash' entry is CommonJS: a named import from it cannot be tree-shaken and bundles
  // the whole library into the chunk, while 'lodash/<method>' only pulls that method's module
  'no-restricted-imports': [
    'error',
    {
      paths: [
        {
          name: 'lodash',
          message: "Use per-method imports instead, e.g. import debounce from 'lodash/debounce'.",
        },
      ],
    },
  ],
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
  'require-await': 'off', // Use TS version
  'no-use-before-define': 'error',
  'array-bracket-spacing': ['error', 'never'],
  'block-spacing': 'error',
  'no-unused-vars': 'off',
  '@eslint-community/eslint-comments/disable-enable-pair': 'off',
  camelcase: 'off',
  'import/no-unresolved': 'off', // Enforce resolution of imports
  // react-hooks — plugin was already registered but its rules were never enabled.
  'react-hooks/rules-of-hooks': 'error',
  'react-hooks/exhaustive-deps': 'warn',
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
        // React and React-related before external
        {
          pattern: '^react($|/)',
          group: 'external',
          position: 'before',
        },
        // Internal with @ alias (treat as internal group)
        {
          pattern: '^@/',
          group: 'internal',
          position: 'before', // Before other internals if needed
        },
        // CSS after types (assigned to unknown, before relatives)
        {
          pattern: '\\.(css|scss|sass|less)$',
          group: 'unknown',
          position: 'before',
        },
      ],
      pathGroupsExcludedImportTypes: ['react'], // Exclude React from standard external sorting
    },
  ],
};

export default defineConfig(
  {
    ignores: [
      '**/dist',
      '**/node_modules/',
      '**/build',
      '**/storybook-static',
      '**/vite.config.ts',
      '**/vitest.config.ts',
      '**/.prettierrc.mjs',
      '**/eslint.config.mjs',
    ],
  },
  { files: ['**/*.ts', '**/*.tsx'], ...moduleBoundariesConfig },
  jsxA11y.flatConfigs.recommended,
  eslintPluginPrettierRecommended,
  cspellESLintPluginRecommended,
  comments.recommended,
  importPlugin.flatConfigs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,
  {
    languageOptions: {
      globals: {
        ...globals.browser,
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
    extends: [
      js.configs.recommended,
      // 'react-hooks/recommended' is not a flat config, so use the plugin in plugins section
    ],
    files: ['**/*.ts', '**/*.tsx'],
    plugins: {
      react: reactPlugin,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      'prefer-arrow-functions': preferArrowFunctions,
      '@stylistic': stylistic,
      perfectionist,
      js,
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
    rules: {
      ...reactPlugin.configs.recommended.rules,
      // bo uses @emotion/react's `css` prop (Emotion jsx pragma) — not a real DOM attribute,
      // but a valid Emotion pattern; react/no-unknown-property doesn't know about it by default
      'react/no-unknown-property': ['error', { ignore: ['css'] }],
      ...generalRules,
      ...stylisticRules,
      ...typescriptRules,
      ...jsxRules
    },
  },
  // last, so the general rules above do not replace it
  ...coreDomainBoundaryConfig({
    paths: [{ name: 'lodash', message: "Use per-method imports instead, e.g. import debounce from 'lodash/debounce'." }],
  }),
);
