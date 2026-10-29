#!/usr/bin/env node
/**
 * Posts each changeset added between two commits to the `#changelog` Slack channel: the team sees a
 * change as soon as it reaches `develop`, without waiting for the release that will gather it. Run
 * by `.github/workflows/changeset-notify.yml` on every push to `develop` that touches
 * `.changeset/`.
 *
 * Usage: node scripts/post-changesets-to-slack.mjs <base-sha> <head-sha> [--dry-run]
 *
 * `SLACK_CHANGELOG_WEBHOOK_URL` must be set, unless `--dry-run` prints the message instead.
 *
 * Only added changesets count: the merge of the release PR deletes them all, and has nothing new to
 * announce — the release notes are posted by `post-changelog-to-slack.mjs` instead.
 */
import {
  APPS, git, postOrPrint, readCommitRange, readFileAt, repositoryUrl, toSlackText,
} from './slack.utils.mjs';

const BUMP_LABELS = {
  major: 'changement majeur',
  minor: 'nouveauté',
  patch: 'correction',
};

// the order a changeset's bump is read in: the strongest of its apps names the whole change
const BUMP_ORDER = ['major', 'minor', 'patch'];

/**
 * A changeset file: a front matter naming each package and its bump (`'portfolio-web': minor`), then
 * the summary.
 */
const parseChangeset = (content) => {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);

  if (!match) return undefined;

  const bumps = [...match[1].matchAll(/^\s*['"]?([^'":]+)['"]?\s*:\s*(major|minor|patch)\s*$/gm)]
    .map(([, packageName, bump]) => ({ packageName, bump }));

  return { bumps, summary: match[2].trim().replace(/\s*\n\s*/g, ' ') };
};

const formatChangeset = ({ bumps, summary }) => {
  const apps = APPS.filter((app) => bumps.some((bump) => bump.packageName === app.packageName));
  const bump = BUMP_ORDER.find((candidate) => bumps.some((entry) => entry.bump === candidate));
  const appLabels = apps.map((app) => app.label).join(', ');

  return `• *${appLabels}* (${BUMP_LABELS[bump]}) : ${toSlackText(summary)}`;
};

/**
 * The pull request the push came from, read off the subject of its commit: GitHub writes
 * "Merge pull request #155 from …" for a merge and "title (#155)" for a squash.
 */
const findPullRequestNumber = (headSha) => git('log', '-1', '--format=%s', headSha).match(/#(\d+)/)?.[1];

const buildMessage = (changesets, headSha) => {
  const repoUrl = repositoryUrl();
  const pullRequest = findPullRequestNumber(headSha);
  let source = '';

  if (repoUrl && pullRequest) source = ` — <${repoUrl}/pull/${pullRequest}|PR #${pullRequest}>`;
  else if (repoUrl) source = ` — <${repoUrl}/commit/${headSha}|${headSha.slice(0, 7)}>`;

  return [`*🆕 Arrivé sur develop${source}*`, ...changesets.map(formatChangeset)].join('\n');
};

const main = async () => {
  const range = readCommitRange('post-changesets-to-slack.mjs');

  if (!range) return;

  const { baseSha, headSha, isDryRun } = range;
  const addedPaths = git('diff', '--name-only', '--diff-filter=A', baseSha, headSha, '--', '.changeset/*.md')
    .split('\n')
    .filter((path) => path && !path.endsWith('README.md'));
  const changesets = addedPaths
    .map((path) => parseChangeset(readFileAt(headSha, path) ?? ''))
    .filter((changeset) => changeset?.bumps.length);

  if (changesets.length === 0) {
    console.log('No changeset added, nothing to post.');
    return;
  }

  const isPosted = await postOrPrint(buildMessage(changesets, headSha), isDryRun);

  if (isPosted && !isDryRun) console.log(`Posted ${changesets.length} changeset(s).`);
};

await main();
