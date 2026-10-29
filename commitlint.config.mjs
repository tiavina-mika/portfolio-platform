// Conventional Commits, with the same types as the branch prefixes (see .claude/rules/git-branches.md).
// The scope is free: an app (`mobile`), several (`server, mobile`) or a concern (`ci`, `docs`).
export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      ['feat', 'fix', 'chore', 'refactor', 'docs', 'test', 'perf', 'ci', 'build', 'revert'],
    ],
    'scope-case': [0],
    'subject-case': [0],
    // same ceiling as the code (110 columns)
    'header-max-length': [2, 'always', 110],
    'body-max-line-length': [0],
    'footer-max-line-length': [0],
  },
};
