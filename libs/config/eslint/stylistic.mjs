// --- Stylistic rules ---
export const stylisticRules = {
  '@stylistic/eol-last': 'error',
  '@stylistic/semi': 'error',
  'no-useless-return': 'error',
  '@stylistic/indent': ['error', 2],
  '@stylistic/keyword-spacing': ['error', { after: true, before: true }],
  '@stylistic/key-spacing': ['error', { beforeColon: false, afterColon: true }],
  '@stylistic/lines-around-comment': ['error', { beforeBlockComment: false }],
  '@stylistic/multiline-comment-style': ['error', 'starred-block'],
  '@stylistic/multiline-ternary': 'off',
  '@stylistic/no-extra-semi': 'error',
  '@stylistic/no-floating-decimal': 'error',
  '@stylistic/no-mixed-operators': 'error',
  '@stylistic/no-mixed-spaces-and-tabs': 'error',
  '@stylistic/no-multi-spaces': 'error',
  '@stylistic/no-multiple-empty-lines': ['error', { max: 2, maxEOF: 0 }],
  '@stylistic/no-trailing-spaces': 'error',
  '@stylistic/max-len': [
    'error',
    {
      code: 110,
      // Ignore objects when enforcing line length (to avoid conflicts with object-curly-newline)
      ignorePattern: 'ImportDeclaration',
      ignoreUrls: true,
      ignoreStrings: true,
      ignoreComments: true,
      ignoreTrailingComments: true,
    },
  ],
  '@stylistic/object-curly-newline': [
    'error',
    {
      // e.g: const a = {};
      ObjectExpression: { consistent: true, multiline: true, minProperties: 0 },
      // "ObjectExpression": { "consistent": true, "multiline": true, "minProperties": 3 },
      // e.g: const { a } = obj;
      ObjectPattern: { consistent: true, multiline: true, minProperties: 4 },
      // e.g: import { a } from 'module';
      ImportDeclaration: { consistent: true, minProperties: 4 },
      // e.g: export { a } from 'module';
      ExportDeclaration: {
        consistent: true,
        multiline: true,
        minProperties: 3,
      },
    },
  ],
  '@stylistic/object-curly-spacing': ['error', 'always'],
  '@stylistic/quote-props': ['error', 'as-needed'],
  '@stylistic/quotes': ['error', 'single'],
  '@stylistic/rest-spread-spacing': ['error', 'never'],
  '@stylistic/semi-spacing': 'error',
  '@stylistic/space-before-blocks': 'error',
  '@stylistic/space-in-parens': ['error', 'never'],
  '@stylistic/space-unary-ops': 'error',
  '@stylistic/spaced-comment': ['error', 'always'],
  '@stylistic/template-curly-spacing': 'error',
  '@stylistic/member-delimiter-style': 'error',
  '@stylistic/padding-line-between-statements': [
    'error',
    { blankLine: 'always', prev: ['const', 'let', 'var'], next: '*' },
    {
      blankLine: 'any',
      prev: ['const', 'let', 'var'],
      next: ['const', 'let', 'var'],
    },
  ],
  '@stylistic/comma-dangle': [
    'error',
    {
      arrays: 'always-multiline', // Trailing commas for arrays with multiple lines
      objects: 'always-multiline', // Trailing commas for objects with multiple lines
      imports: 'always-multiline', // Trailing commas in multi-line import statements
      exports: 'always-multiline', // Trailing commas in multi-line export statements
      functions: 'never', // No trailing commas in function parameter lists
    },
  ],
  '@stylistic/comma-spacing': ['error', { before: false, after: true }],
  '@stylistic/operator-linebreak': [
    'error',
    'after',
    {
      overrides: {
        '?': 'before',
        ':': 'before',
      },
    },
  ],
  '@stylistic/type-generic-spacing': ['error'],
  '@stylistic/dot-location': ['error', 'property'],
  '@stylistic/curly-newline': ['error', { minElements: 1 }],
};
