// --- TypeScript rules ---
export const typescriptRules = {
  '@typescript-eslint/no-unused-vars': [
    'error',
    {
      args: 'all',
      argsIgnorePattern: '^_',
      caughtErrors: 'all',
      caughtErrorsIgnorePattern: '^_',
      destructuredArrayIgnorePattern: '^_',
      varsIgnorePattern: '^_',
      ignoreRestSiblings: true,
    },
  ],
  'default-param-last': 'off',
  '@typescript-eslint/default-param-last': 'error',
  // Note: you must disable the base rule as it can report incorrect errors
  'max-params': 'off',
  '@typescript-eslint/no-unsafe-assignment': 'off',
  '@typescript-eslint/max-params': ['error', { max: 4 }],
  '@typescript-eslint/method-signature-style': ['error', 'property'],
  '@typescript-eslint/no-array-delete': 'error',
  '@typescript-eslint/no-duplicate-enum-values': 'error',
  '@typescript-eslint/no-duplicate-type-constituents': 'error',
  '@typescript-eslint/no-mixed-enums': 'error',
  '@typescript-eslint/no-require-imports': 'error',
  '@typescript-eslint/no-unnecessary-boolean-literal-compare': [
    'error',
    { allowComparingNullableBooleansToTrue: false },
  ],
  '@typescript-eslint/no-unnecessary-template-expression': 'error',
  '@typescript-eslint/no-unnecessary-type-arguments': 'error',
  '@typescript-eslint/no-unsafe-function-type': 'error',
  '@typescript-eslint/no-useless-empty-export': 'error',
  // Note: you must disable the base rule as it can report incorrect errors
  'no-throw-literal': 'off',
  '@typescript-eslint/only-throw-error': 'error',
  '@typescript-eslint/prefer-find': 'error',
  '@typescript-eslint/prefer-for-of': 'error',
  '@typescript-eslint/prefer-optional-chain': 'error',
  '@typescript-eslint/array-type': 'error',
  '@typescript-eslint/explicit-function-return-type': 'off',
  // these 2 following rules cause performance issue (type-aware, expensive on large projects) —
  // default off here; `server` overrides both to 'warn' in its own eslint.config.mjs
  // (rolled out to server first, perf impact to be measured before extending to web/mobile/bo)
  '@typescript-eslint/await-thenable': 'off',
  '@typescript-eslint/no-floating-promises': 'off',
  '@typescript-eslint/no-unsafe-call': 'off',
  '@typescript-eslint/no-unsafe-member-access': 'off',
  '@typescript-eslint/no-unsafe-argument': 'off',
  '@typescript-eslint/no-unsafe-return': 'off',
  '@typescript-eslint/no-unsafe-enum-comparison': 'off',
  '@typescript-eslint/no-redundant-type-constituents': 'off',
  // This rule will not work as expected if strictNullChecks is not enabled, so it is disabled by default.
  '@typescript-eslint/prefer-nullish-coalescing': 'off',
  '@typescript-eslint/no-misused-promises': 'off',
  '@typescript-eslint/no-non-null-asserted-optional-chain': 'off',
  '@typescript-eslint/consistent-type-definitions': 'off',
  '@typescript-eslint/naming-convention': [
    'error',
    {
      selector: 'variable',
      modifiers: ['const'],
      format: ['camelCase', 'UPPER_CASE', 'PascalCase'],
    },
    {
      selector: 'import',
      format: ['camelCase', 'PascalCase', 'UPPER_CASE'],
    },
    {
      selector: 'variable',
      types: ['boolean'],
      format: ['PascalCase'],
      // e.g: isReady, hasError, shouldFetch, ...
      prefix: ['is', 'should', 'has', 'can', 'did', 'will', 'open'],
      filter: {
        // exception. e.g: loadingProjects, openDialog, LOCAL
        regex: '^(?:[A-Z][A-Z0-9_]*|.*loading.*|open.*)$',
        match: false,
      },
    },
    { selector: 'typeLike', format: ['PascalCase'] },
    // e.g: IProject, IUser, IProjectData, ...
    { selector: 'interface', format: ['PascalCase'], prefix: ['I'] },
    { selector: 'typeAlias', format: ['PascalCase'] },
    { selector: 'enumMember', format: ['UPPER_CASE', 'camelCase'] },
    { selector: 'class', format: ['PascalCase'] },
    { selector: 'classProperty', format: ['camelCase', 'UPPER_CASE'] },
    { selector: 'classMethod', format: ['camelCase'] },
    {
      selector: 'parameter',
      format: ['camelCase'],
      leadingUnderscore: 'allow',
    },
    { selector: 'function', format: ['camelCase'] },
    { selector: 'enum', format: ['PascalCase'] },
  ],
};
