#!/usr/bin/env node
/**
 * Checks that a translated doc and its twin change together, run by the `pre-push` hook, by the `CI`
 * workflow and by `pnpm check-doc-twins`.
 *
 * Docs live in pairs, `<folder>/fr/NAME.FR.md` and `<folder>/en/NAME.md`. A rule alone cannot keep
 * them in step: it only binds whoever reads it, so an edit made by hand, or by a tool that never read
 * the rule, leaves one side describing a behavior the other no longer has. This script looks at what a
 * range of commits changed and fails when one side moved without the other.
 *
 * It checks that the twin was touched, not that the translation is right: that stays a review matter.
 *
 * Usage (from the repo root):
 *   pnpm check-doc-twins                    → commits since the merge-base with origin/develop
 *   pnpm check-doc-twins --base <ref>       → commits since the merge-base with <ref>
 *   pnpm check-doc-twins --worktree         → also the uncommitted and untracked changes
 *   SKIP_DOC_TWINS=1 git push               → skip the check for one push (a typo fix on one side)
 *
 * Not concerned, because they have no twin by design: README files (English only) and
 * `docs/features/**` (French only).
 */
import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';

const DEFAULT_BASES = ['origin/develop', 'origin/main'];

/** Paths under these prefixes have no translated twin by design. */
const SINGLE_LANGUAGE_PREFIXES = ['docs/features/'];

const git = (args) => execFileSync('git', args, {
  encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], maxBuffer: 64 * 1024 * 1024,
});

const gitSucceeds = (args) => {
  try {
    git(args);
    return true;
  }
  catch {
    return false;
  }
};

/** `docs/x/fr/sub/NAME.FR.md` ↔ `docs/x/en/sub/NAME.md`; null for a file that has no twin by design. */
const getTwinPath = (filePath) => {
  if (!filePath.startsWith('docs/') || !filePath.endsWith('.md')) return null;
  if (SINGLE_LANGUAGE_PREFIXES.some((prefix) => filePath.startsWith(prefix))) return null;
  if (/(^|\/)README(\.[A-Z]+)?\.md$/.test(filePath)) return null;

  const french = filePath.match(/^(docs\/.*?)\/fr\/(.+)\.FR\.md$/);

  if (french) return { side: 'fr', twin: `${french[1]}/en/${french[2]}.md` };

  const english = filePath.match(/^(docs\/.*?)\/en\/(.+)\.md$/);

  // a `.FR.md` under `en/` is a stale copy, not a translation: other tooling handles it
  if (english && !english[2].endsWith('.FR')) return { side: 'en', twin: `${english[1]}/fr/${english[2]}.FR.md` };
  return null;
};

const resolveBase = (requested) => {
  for (const candidate of requested ? [requested] : DEFAULT_BASES) {
    if (gitSucceeds(['rev-parse', '--verify', '--quiet', candidate])) {
      return git(['merge-base', 'HEAD', candidate]).trim();
    }
  }
  return null;
};

/** The files a range changed, with what happened to them: A, M or D (a rename is a delete plus an add). */
const getChanges = (base, includeWorktree) => {
  const changes = new Map();
  const record = (status, filePath) => {
    if (filePath.startsWith('docs/') && filePath.endsWith('.md')) changes.set(filePath, status);
  };
  // -M off: a moved doc must move with its twin, so it is read as a delete and an add
  const diffArgs = includeWorktree ? ['diff', '--name-status', '--no-renames', base] : ['diff', '--name-status', '--no-renames', `${base}..HEAD`];

  for (const line of git([...diffArgs, '--', 'docs']).split('\n').filter(Boolean)) {
    const [status, filePath] = line.split('\t');

    record(status[0], filePath);
  }
  if (includeWorktree) {
    for (const filePath of git(['ls-files', '--others', '--exclude-standard', '--', 'docs']).split('\n').filter(Boolean)) {
      record('A', filePath);
    }
  }
  return changes;
};

const main = () => {
  if (process.env.SKIP_DOC_TWINS === '1') {
    console.log('check-doc-twins: skipped (SKIP_DOC_TWINS=1)');
    return;
  }
  const args = process.argv.slice(2);
  const baseIndex = args.indexOf('--base');
  const requestedBase = baseIndex !== -1 ? args[baseIndex + 1] : undefined;
  const includeWorktree = args.includes('--worktree');
  const base = resolveBase(requestedBase);

  if (!base) {
    // a shallow clone or a repository without the remote: nothing to compare against, not a failure
    console.warn(`check-doc-twins: no base to compare with (${requestedBase ?? DEFAULT_BASES.join(', ')}), skipped`);
    return;
  }
  const changes = getChanges(base, includeWorktree);
  const twinExists = (filePath) => (includeWorktree ? existsSync(filePath) : gitSucceeds(['cat-file', '-e', `HEAD:${filePath}`]));
  const errors = [];
  const warnings = [];

  for (const [filePath, status] of changes) {
    const pairing = getTwinPath(filePath);

    if (!pairing) continue;
    const { twin } = pairing;
    const twinStatus = changes.get(twin);

    if (status === 'D') {
      if (twinExists(twin) && twinStatus !== 'D') errors.push(`${filePath} was deleted but its twin still exists: ${twin}`);
      continue;
    }
    if (twinStatus && twinStatus !== 'D') continue;
    if (!twinExists(twin)) {
      // a new doc must come with its twin; an old one that never had it is reported, not blocked
      const message = `${filePath} has no twin: ${twin}`;

      if (status === 'A') errors.push(message);
      else warnings.push(`${message} (existing doc, not blocking)`);
      continue;
    }
    errors.push(`${filePath} changed but its twin did not: ${twin}`);
  }
  for (const warning of warnings) console.warn(`  ⚠ ${warning}`);

  if (errors.length) {
    console.error('\ncheck-doc-twins: a translated doc and its twin must change together.\n');
    for (const error of errors) console.error(`  ✗ ${error}`);
    console.error(
      '\nUpdate the twin in the same push (same sections, rows and ✅/❌/⏳ markers; `/sync-doc-twins`\n'
      + 'can translate a change), or, for a change that really concerns one language only,\n'
      + 'push with SKIP_DOC_TWINS=1.\n'
    );
    process.exit(1);
  }
  console.log(`check-doc-twins: ${changes.size} changed doc(s) since ${base.slice(0, 9)}, every pair moved together`);
};

main();
