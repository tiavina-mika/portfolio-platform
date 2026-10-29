/**
 * What the two scripts posting to the `#changelog` Slack channel share: reading the repository at a
 * commit, writing Slack's markup, and either posting the message or printing it (`--dry-run`).
 * Used by `post-changelog-to-slack.mjs` (the releases) and `post-changesets-to-slack.mjs` (each
 * change as it reaches `develop`).
 */
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));

/** Display order of the messages, and how each app is named in them. */
export const APPS = [
  { dir: 'web', packageName: 'portfolio-web', label: '🌐 Site web' },
  { dir: 'bo', packageName: 'portfolio-bo', label: '🛠 Back-office' },
  { dir: 'server', packageName: 'portfolio-server', label: '⚙️ Serveur' },
];

export const git = (...args) =>
  execFileSync('git', args, { cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });

/** The file at a commit, or `undefined` when it did not exist there. */
export const readFileAt = (sha, path) => {
  try {
    return git('show', `${sha}:${path}`);
  }
  catch {
    return undefined;
  }
};

/** Markdown → Slack mrkdwn: escaped `&<>`, `**bold**` → `*bold*`, links → `<url|text>`. */
export const toSlackText = (markdown) =>
  markdown
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replace(/\*\*(.+?)\*\*/g, '*$1*')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<$2|$1>');

/** Base URL of the repository on GitHub, only known inside GitHub Actions. */
export const repositoryUrl = () => {
  const { GITHUB_SERVER_URL, GITHUB_REPOSITORY } = process.env;

  return GITHUB_SERVER_URL && GITHUB_REPOSITORY ? `${GITHUB_SERVER_URL}/${GITHUB_REPOSITORY}` : undefined;
};

/**
 * Reads `<base-sha> <head-sha> [--dry-run]` off the command line.
 * @returns the two commits to compare, or `undefined` after printing the usage
 */
export const readCommitRange = (scriptName) => {
  const args = process.argv.slice(2);
  const isDryRun = args.includes('--dry-run');
  const [baseArg, headSha] = args.filter((arg) => arg !== '--dry-run');

  if (!baseArg || !headSha) {
    console.error(`Usage: node scripts/${scriptName} <base-sha> <head-sha> [--dry-run]`);
    process.exitCode = 1;
    return undefined;
  }

  // a push that creates the branch has no previous commit: GitHub sends a SHA made of zeros
  const baseSha = /^0+$/.test(baseArg) ? `${headSha}~1` : baseArg;

  return { baseSha, headSha, isDryRun };
};

/**
 * Posts the message to the `#changelog` webhook, or prints it with `--dry-run`. A missing webhook or
 * a refusal from Slack fails the script, so the workflow run turns red instead of passing silently.
 * @returns whether the message left (or was printed)
 */
export const postOrPrint = async (message, isDryRun) => {
  if (isDryRun) {
    console.log(message);
    return true;
  }

  const webhookUrl = process.env.SLACK_CHANGELOG_WEBHOOK_URL;

  if (!webhookUrl) {
    console.error('SLACK_CHANGELOG_WEBHOOK_URL is not set: add it as a repository secret.');
    process.exitCode = 1;
    return false;
  }

  const response = await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: message, unfurl_links: false, unfurl_media: false }),
  });

  if (!response.ok) {
    throw new Error(`Slack answered ${response.status}: ${await response.text()}`);
  }

  return true;
};
