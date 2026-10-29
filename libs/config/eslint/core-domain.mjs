// A `_core/` file must keep compiling when `_domain/` is deleted, so it never imports from it: the
// domain plugs into the core through a registry filled at a composition point (a flat file outside
// `_core/`). The rule is an `error`; what it leaves out is on purpose:
// - the files below carry a reviewed `@boilerplate-scope` exception;
// - tests may build their fixtures from the domain they exercise.
//
// `no-restricted-imports` is replaced as a whole for the files it targets, so an app that already
// restricts imports passes its own `paths` to keep them.
const ANNOTATED_EXCEPTIONS = [
  '**/cloud/triggers/_core/rating.triggers.ts',
  '**/cloud/services/_core/rating-reply.service.cloud.ts',
];

const TESTS = ['**/__tests__/**', '**/*.test.ts', '**/*.test.tsx', '**/*.spec.ts'];

export const coreDomainBoundaryConfig = ({ paths = [] } = {}) => [
  {
    files: ['**/_core/**/*.ts', '**/_core/**/*.tsx'],
    ignores: [...ANNOTATED_EXCEPTIONS, ...TESTS],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths,
          patterns: [
            {
              group: ['**/_domain/**'],
              message:
                'A _core file must not import from _domain: expose a registry in _core and register from a composition point instead.',
            },
          ],
        },
      ],
    },
  },
];
