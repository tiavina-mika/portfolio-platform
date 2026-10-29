#!/usr/bin/env node
/**
 * Posts the release notes added to the apps' `CHANGELOG.md` between two commits to the `#changelog`
 * Slack channel. Run by `.github/workflows/release-notify.yml` on every push to `develop` or `main`
 * that touches a changelog — in practice, the merge of the "version packages" PR on `develop`
 * (preproduction), then the merge of `develop` into `main` (production).
 *
 * Usage: node scripts/post-changelog-to-slack.mjs <base-sha> <head-sha> [--dry-run]
 *
 * `SLACK_CHANGELOG_WEBHOOK_URL` must be set, unless `--dry-run` prints the message instead.
 *
 * Every version section the base commit did not have is posted, not only the top one: a merge of
 * `develop` into `main` can carry several releases of the same app at once.
 */
import {
  APPS, git, postOrPrint, readCommitRange, readFileAt, repositoryUrl, toSlackText,
} from './slack.utils.mjs';

/** Headings written by `changeset version`, in the order they are shown. */
const CHANGE_KINDS = [
  { heading: 'Major Changes', label: 'Changements majeurs' },
  { heading: 'Minor Changes', label: 'Nouveautés' },
  { heading: 'Patch Changes', label: 'Corrections et ajustements' },
];

/**
 * Past this, the rest of an app's entries is replaced by a link to its changelog: the first release
 * gathers dozens of changesets, and a wall of text in Slack is read by nobody.
 */
const MAX_ENTRIES_PER_APP = 10;

const BRANCH_LABELS = {
  develop: '🧪 Nouvelle release en préproduction',
  main: '🚀 Nouvelle release en production',
};

const MOBILE_VERSION_NOTE =
  '_Mobile : version du code, pas celle des stores. Les changements arrivent sur les téléphones par '
  + 'une mise à jour EAS ou une nouvelle version publiée sur les stores._';

/**
 * Splits a changesets changelog into its version sections, newest first:
 * `## 1.2.0` → `### Minor Changes` → `- abc1234: summary`, a summary going on over indented lines.
 */
const parseChangelog = (content) => {
  const sections = [];
  let section;
  let kind;
  let entry;

  for (const line of content.split(/\r?\n/)) {
    const versionMatch = line.match(/^## (\S+)/);
    const kindMatch = line.match(/^### (.+?)\s*$/);
    const entryMatch = line.match(/^- (?:([0-9a-f]{7,40}): )?(.*)$/);

    if (versionMatch) {
      section = { version: versionMatch[1], entries: [] };
      sections.push(section);
      kind = undefined;
      entry = undefined;
    }
    else if (section && kindMatch) {
      kind = kindMatch[1];
      entry = undefined;
    }
    else if (section && kind && entryMatch) {
      entry = { kind, hash: entryMatch[1], text: entryMatch[2].trim() };
      section.entries.push(entry);
    }
    else if (entry && /^\s+\S/.test(line)) {
      entry.text = `${entry.text} ${line.trim()}`;
    }
  }

  return sections;
};

const formatDate = (date) =>
  new Intl.DateTimeFormat('fr-FR', {
    timeZone: 'Indian/Antananarivo',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);

const formatEntry = (entry, repoUrl) => {
  const commitLink = entry.hash && repoUrl ? ` (<${repoUrl}/commit/${entry.hash}|${entry.hash}>)` : '';

  return `• ${toSlackText(entry.text)}${commitLink}`;
};

const formatAppBlock = ({ app, changelogPath, sections }, headSha, repoUrl) => {
  // sections come newest first; a merge into `main` can carry several releases of one app
  const newest = sections[0].version;
  const oldest = sections.at(-1).version;
  const versions = newest === oldest ? newest : `${oldest} → ${newest}`;
  const entries = sections.flatMap((section) => section.entries);
  const lines = [`*${app.label} ${versions}*`];
  let shown = 0;

  for (const kind of CHANGE_KINDS) {
    const ofKind = entries.filter((entry) => entry.kind === kind.heading);
    const room = MAX_ENTRIES_PER_APP - shown;

    if (ofKind.length === 0 || room <= 0) {
      continue;
    }

    lines.push(`_${kind.label}_`, ...ofKind.slice(0, room).map((entry) => formatEntry(entry, repoUrl)));
    shown += Math.min(ofKind.length, room);
  }

  const hidden = entries.length - shown;

  if (hidden > 0) {
    const changelogLink = repoUrl
      ? `<${repoUrl}/blob/${headSha}/${changelogPath}|changelog complet>`
      : changelogPath;

    const plural = hidden > 1 ? 's' : '';

    lines.push(`… et ${hidden} autre${plural} changement${plural} : ${changelogLink}`);
  }

  return lines.join('\n');
};

/** The version sections each app gained between the two commits, apps without any left out. */
const collectReleases = (baseSha, headSha) => {
  const changedPaths = new Set(
    git('diff', '--name-only', baseSha, headSha, '--', 'apps/*/CHANGELOG.md').split('\n').filter(Boolean)
  );

  return APPS.map((app) => {
    const changelogPath = `apps/${app.dir}/CHANGELOG.md`;

    if (!changedPaths.has(changelogPath)) {
      return undefined;
    }

    const headContent = readFileAt(headSha, changelogPath) ?? '';
    const baseContent = readFileAt(baseSha, changelogPath) ?? '';
    const knownVersions = new Set(parseChangelog(baseContent).map((section) => section.version));
    const sections = parseChangelog(headContent).filter((section) => !knownVersions.has(section.version));

    return sections.length > 0 ? { app, changelogPath, sections } : undefined;
  }).filter(Boolean);
};

const buildMessage = (releases, headSha, branch) => {
  const repoUrl = repositoryUrl();
  const title = BRANCH_LABELS[branch] ?? '📦 Nouvelle release';
  const blocks = [
    `*${title} — ${formatDate(new Date())}*`,
    ...releases.map((release) => formatAppBlock(release, headSha, repoUrl)),
  ];

  if (releases.some((release) => release.app.dir === 'mobile')) {
    blocks.push(MOBILE_VERSION_NOTE);
  }

  return blocks.join('\n\n');
};

const main = async () => {
  const range = readCommitRange('post-changelog-to-slack.mjs');

  if (!range) return;

  const releases = collectReleases(range.baseSha, range.headSha);

  if (releases.length === 0) {
    console.log('No new version section in any changelog, nothing to post.');
    return;
  }

  const message = buildMessage(releases, range.headSha, process.env.GITHUB_REF_NAME);
  const isPosted = await postOrPrint(message, range.isDryRun);

  if (isPosted && !range.isDryRun) {
    console.log(`Posted the release notes of ${releases.map((release) => release.app.dir).join(', ')}.`);
  }
};

await main();
