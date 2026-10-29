import comments from '@eslint-community/eslint-plugin-eslint-comments/configs';
import js from '@eslint/js';
import stylistic from '@stylistic/eslint-plugin';
import perfectionist from 'eslint-plugin-perfectionist';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import preferArrowFunctions from 'eslint-plugin-prefer-arrow-functions';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import nextPlugin from "@next/eslint-plugin-next";
import { defineConfig } from 'eslint/config';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import importPlugin from 'eslint-plugin-import';
import cspellESLintPluginRecommended from '@cspell/eslint-plugin/recommended';
import eslintPluginBetterTailwindcss from "eslint-plugin-better-tailwindcss";
import { stylisticRules, typescriptRules, jsxRules, moduleBoundariesConfig } from '@shared/eslint-config';
import storybook from 'eslint-plugin-storybook';

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
      '**.next/**/*',
      '**/*.d.ts',
      '**/public/**/*',
      '**/coverage/**/*',
      // design tooling scripts and their caches: not part of the site
      '**/.design-sync/**',
      '**/.ds-sync/**',
      '**/ds-bundle/**',
      'eslint.config.mjs',
      'tailwind.config.ts',
      "**/.storybook/**/*",
      '**/*.js',
      'lintstagedrc.js',
      "server/**/*",
    ],
  },
  { files: ['**/*.ts', '**/*.tsx'], ...moduleBoundariesConfig },
  jsxA11y.flatConfigs.recommended,
  eslintPluginPrettierRecommended,
  cspellESLintPluginRecommended,
  comments.recommended,
  importPlugin.flatConfigs.recommended,
  // This add .js extension support for ESM imports (e.g: import x from 'async/queue.js')
  ...tseslint.configs.recommendedTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,
  {
    languageOptions: {
      globals: {
        Parse: 'readonly',
        window: "readonly",
        document: "readonly",
        fetch: "readonly",
        ...globals.node,
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
      // eslintPluginPrettierRecommended,
      comments.recommended,
    ],
    plugins: {
      'react-hooks': reactHooks,
      'prefer-arrow-functions': preferArrowFunctions,
      '@stylistic': stylistic,
      perfectionist,
      "@next/next": nextPlugin,
      js
    },
    rules: {
      ...nextPlugin.configs.recommended.rules,
      '@next/next/no-img-element': 'off',
      ...generalRules,
      ...stylisticRules,
      ...typescriptRules,
      ...jsxRules
    },
  },
    {
    files: ["**/*.{jsx,tsx}"],
    languageOptions: {
      parserOptions: {
        ecmaFeatures: {
          jsx: true
        }
      }
    },
    plugins: {
      "better-tailwindcss": eslintPluginBetterTailwindcss
    },
    rules: {
      // enable all recommended rules to report a warning
      ...eslintPluginBetterTailwindcss.configs["recommended-warn"].rules,
      // enable all recommended rules to report an error
      ...eslintPluginBetterTailwindcss.configs["recommended-error"].rules,
      'better-tailwindcss/enforce-shorthand-classes': 'warn',
      "better-tailwindcss/enforce-consistent-line-wrapping": ["warn", { lineBreakStyle: 'unix', group: 'newLine', printWidth: 110 }],
      "better-tailwindcss/no-unregistered-classes": ["warn", {
        // `dark` is the theme class (next-themes puts it on <html>), also set on a surface that stays dark
        ignore: [
          'leading-snug', 'leading-relaxed', 'max-md:leading-snug', 'divider', 'text-destructive-foreground', 'dark',
        ]
      }],
      "better-tailwindcss/enforce-consistent-important-position": ["warn", { "position": "recommended" }]
    },

    settings: {
      "better-tailwindcss": {
        // tailwindcss 4: the path to the entry file of the css based tailwind config (eg: `src/global.css`)
        entryPoint: "app/globals.css",
      }
    }
  },
  // conventions for stories (default export, awaited interactions, `storybook/test` expect…)
  ...storybook.configs['flat/recommended'],
  {
    // Storybook decorators/render props conventionally use a PascalCase `Story` parameter
    // (rendered as JSX: `<Story />`), which conflicts with the camelCase parameter rule.
    files: ['**/*.stories.tsx'],
    rules: {
      '@typescript-eslint/naming-convention': 'off',
    },
  }
);
