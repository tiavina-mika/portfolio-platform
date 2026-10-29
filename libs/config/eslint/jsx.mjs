// --- JSX rules --- (consumed by web/mobile/bo only — server never renders JSX)
export const jsxRules = {
  '@stylistic/jsx-closing-bracket-location': [1, 'line-aligned'],
  '@stylistic/jsx-one-expression-per-line': [1, { allow: 'non-jsx' }],
  '@stylistic/jsx-pascal-case': [
    1,
    {
      allowAllCaps: false,
      allowNamespace: true,
      allowLeadingUnderscore: false,
    },
  ],
  '@stylistic/jsx-equals-spacing': ['error', 'never'],
  '@stylistic/jsx-max-props-per-line': [
    'error',
    {
      maximum: { single: 3, multi: 1 },
    },
  ],
  // Force new line after opening tag if multiline
  '@stylistic/jsx-first-prop-new-line': [2, 'multiline-multiprop'],
  '@stylistic/no-multi-spaces': 'error',
  '@stylistic/jsx-tag-spacing': [
    'error',
    {
      closingSlash: 'never',
      beforeSelfClosing: 'always',
      afterOpening: 'never',
      beforeClosing: 'never',
    },
  ],
  /**
   * Sort props in JSX
   * NOTE: comments between props (line) is not supported
   * solution: name="John" // User name
   */
  'perfectionist/sort-jsx-props': [
    'error',
    {
      type: 'alphabetical',
      order: 'asc',
      ignoreCase: true,
      groups: ['shorthand-prop', 'unknown', 'multiline-prop'],
    },
  ],

  '@stylistic/jsx-wrap-multilines': [
    'error',
    {
      declaration: 'parens-new-line',
      assignment: 'parens-new-line',
      return: 'parens-new-line',
      arrow: 'parens-new-line',
      condition: 'parens-new-line',
      logical: 'parens-new-line',
      prop: 'parens-new-line',
      propertyValue: 'parens-new-line',
    },
  ],
};
