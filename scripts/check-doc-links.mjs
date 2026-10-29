#!/usr/bin/env node
/**
 * Checks the relative links and the anchors of the Markdown docs, run by the `pre-push` hook, by the
 * `CI` workflow and by `pnpm check-doc-links`.
 *
 * Docs are moved, renamed and deleted far more often than the links that point at them are read, so a
 * link to a file (a doc, a source file) or to a heading that no longer exists goes unnoticed until
 * someone clicks it. This script reads every tracked `docs/**\/*.md` and fails when
 *   - a relative link points at a file that does not exist,
 *   - an anchor (`#some-heading`) points at a heading the target Markdown file does not have.
 *
 * Links inside fenced code blocks and inline code are ignored, as are `http(s):` and `mailto:` links.
 * Anchors follow the GitHub rule (lowercase, punctuation stripped, spaces → `-`, `-1`, `-2` for repeated
 * headings); a `#L12` / `#L12-L20` anchor on a source file is not checked.
 *
 * Usage (from the repo root):
 *   pnpm check-doc-links
 */
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, posix } from 'node:path';

const MARKDOWN_LINK = /\]\(((?:[^()\s]|\([^()]*\))+)\)/g;
const EXTERNAL_LINK = /^(https?:|mailto:|tel:)/;

const listedDocs = execFileSync(
  'git',
  ['ls-files', '--cached', '--others', '--exclude-standard', 'docs/*.md'],
  { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 }
);
const trackedDocs = listedDocs.split('\n').filter((filePath) => filePath && existsSync(filePath));

const withoutFences = (text) => text.replace(/```[\s\S]*?```/g, '');
const withoutCode = (text) => withoutFences(text).replace(/`[^`\n]*`/g, '');

/** GitHub slug of one heading, before the `-1` / `-2` suffix given to repeated headings. */
const slugify = (heading) => heading.trim().toLowerCase()
  .replace(/<[^>]+>/g, '')
  .replace(/[`*~]/g, '')
  .replace(/[^\p{L}\p{N}\s_-]/gu, '')
  .replace(/\s/g, '-');

const anchorCache = new Map();

const getAnchors = (filePath) => {
  if (anchorCache.has(filePath)) return anchorCache.get(filePath);

  const seen = {};
  const anchors = new Set();

  for (const line of withoutFences(readFileSync(filePath, 'utf8')).split('\n')) {
    const match = line.match(/^#{1,6} (.+)/);

    if (!match) continue;

    const slug = slugify(match[1]);

    seen[slug] = seen[slug] === undefined ? 0 : seen[slug] + 1;
    anchors.add(seen[slug] === 0 ? slug : `${slug}-${seen[slug]}`);
  }

  anchorCache.set(filePath, anchors);

  return anchors;
};

const decode = (value) => {
  try {
    return decodeURIComponent(value);
  }
  catch {
    return value;
  }
};

const problems = [];

for (const docPath of trackedDocs) {
  for (const [, target] of withoutCode(readFileSync(docPath, 'utf8')).matchAll(MARKDOWN_LINK)) {
    if (EXTERNAL_LINK.test(target)) continue;

    const [rawPath, ...rawAnchor] = target.split('#');
    const anchor = decode(rawAnchor.join('#')).toLowerCase();
    const targetPath = rawPath
      ? posix.normalize(join(dirname(docPath), decode(rawPath)).replaceAll('\\', '/'))
      : docPath;

    if (!existsSync(targetPath)) {
      problems.push(`${docPath}: ${target} → file not found`);
      continue;
    }

    const isSourceLineAnchor = /^l\d+(-l?\d+)?$/.test(anchor);

    if (anchor && !isSourceLineAnchor && targetPath.endsWith('.md') && !getAnchors(targetPath).has(anchor)) {
      problems.push(`${docPath}: ${target} → heading not found`);
    }
  }
}

if (problems.length > 0) {
  console.error(`✗ ${problems.length} broken doc link(s):\n`);
  console.error(problems.map((problem) => `  ${problem}`).join('\n'));
  process.exit(1);
}

console.log(`✓ ${trackedDocs.length} docs checked, no broken link or anchor.`);
