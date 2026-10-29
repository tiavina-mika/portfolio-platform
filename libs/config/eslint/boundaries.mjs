import nxEslintPlugin from '@nx/eslint-plugin';

// Enforces the generic (scope:shared-core) vs business-domain (scope:shared-domain) boundary
// a shared-core lib must never depend
// on a shared-domain lib, so a boilerplate clone can keep libs/shared-* without dragging in
// carpooling-specific code. scope:core (apps/server) and scope:app (mobile/bo/web) are the 4 real
// apps and may depend on both.
export const moduleBoundariesConfig = {
  plugins: { '@nx': nxEslintPlugin },
  rules: {
    '@nx/enforce-module-boundaries': [
      'error',
      {
        enforceBuildableLibDependency: true,
        depConstraints: [
          { sourceTag: 'scope:shared-core', onlyDependOnLibsWithTags: ['scope:shared-core'] },
          {
            sourceTag: 'scope:shared-domain',
            onlyDependOnLibsWithTags: ['scope:shared-core', 'scope:shared-domain'],
          },
          {
            sourceTag: 'scope:core',
            onlyDependOnLibsWithTags: ['scope:shared-core', 'scope:shared-domain', 'scope:core'],
          },
          {
            sourceTag: 'scope:app',
            onlyDependOnLibsWithTags: ['scope:shared-core', 'scope:shared-domain', 'scope:app'],
          },
          // the E2E suite drives the apps from the outside: it may share their types, never their code
          {
            sourceTag: 'scope:e2e',
            onlyDependOnLibsWithTags: ['scope:shared-core', 'scope:shared-domain'],
          },
        ],
      },
    ],
  },
};
