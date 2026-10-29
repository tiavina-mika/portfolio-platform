#!/usr/bin/env node
/**
 * Checks that docs/inventory/README.md (and docs/services/README.md) still match the code.
 *
 * Reports, without ever printing a value:
 *   - env variables declared in an app's `.env.example` but missing from the inventory
 *   - env variables read in the code (`process.env.X`, `import.meta.env.X`) but absent from `.env.example`
 *   - Cloud Code files (functions, triggers, jobs) missing from the inventory table
 *   - env variables that the inventory lists but no `.env.example` declares any more
 *
 * Usage (from the repo root):
 *   node .claude/skills/inventory/scripts/inventory.mjs          → report, exit 1 if something is stale
 *   node .claude/skills/inventory/scripts/inventory.mjs --list   → also print every Cloud Function, trigger and job name
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../..');
const APPS = ['server', 'bo', 'web'];
const CLOUD_DIR = path.join(ROOT, 'apps/server/src/cloud');
const SKIPPED_DIRS = new Set(['node_modules', '.next', 'dist', 'build', 'coverage', 'clientBuild']);
// provided by the runtime or the tooling, not by a `.env` file
const RUNTIME_VARS = new Set(['NODE_ENV', 'MODE', 'DEV', 'PROD', 'SSR', 'BASE_URL', 'CI', 'PWD', 'HOME', 'TIME', 'ANALYZE', 'VITE_APP_VERSION']);

const read = (file) => fs.readFileSync(file, 'utf8');
const rel = (file) => path.relative(ROOT, file).split(path.sep).join('/');

const walk = (dir, filter) => {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    if (SKIPPED_DIRS.has(entry.name) || entry.name.startsWith('.')) return [];
    const full = path.join(dir, entry.name);

    if (entry.isDirectory()) return walk(full, filter);
    return filter(full) ? [full] : [];
  });
};

const inventory = read(path.join(ROOT, 'docs/inventory/README.md'));
const services = read(path.join(ROOT, 'docs/services/README.md'));
const documented = new Set([...(inventory + services).matchAll(/`([A-Z][A-Z0-9_]+)`/g)].map((m) => m[1]));

const problems = [];
const declaredEverywhere = new Set();

for (const app of APPS) {
  const envFile = path.join(ROOT, 'apps', app, '.env.example');
  const declared = fs.existsSync(envFile)
    ? [...read(envFile).matchAll(/^([A-Z][A-Z0-9_]*)=/gm)].map((m) => m[1])
    : [];

  declared.forEach((name) => declaredEverywhere.add(name));
  for (const name of declared) {
    if (!documented.has(name)) problems.push(`apps/${app}: ${name} is in .env.example but not in docs/inventory/README.md`);
  }

  const sources = walk(path.join(ROOT, 'apps', app), (file) => /\.(ts|tsx|js|mjs|cjs)$/.test(file) && !file.endsWith('.d.ts'));
  const used = new Set();

  for (const file of sources) {
    for (const m of read(file).matchAll(/(?:process\.env|import\.meta\.env)\.([A-Z][A-Z0-9_]+)/g)) used.add(m[1]);
  }
  for (const name of used) {
    if (!declared.includes(name) && !RUNTIME_VARS.has(name) && !(app === 'web' && name === 'PORT')) {
      problems.push(`apps/${app}: ${name} is read in the code but not declared in .env.example`);
    }
  }
}

for (const name of documented) {
  // a documented variable-looking token that no .env.example declares: stale, or not a variable at all
  if (/^(VITE_|NEXT_PUBLIC_)|_(KEY|URL|SECRET|ID|EMAIL|IV|NAME|SENDER|ENV|PORT|PREPROD)$/.test(name) && !declaredEverywhere.has(name)) {
    problems.push(`docs: ${name} is documented but no .env.example declares it`);
  }
}

// Cloud Code files vs the "Cloud Code" table
const cloudRows = inventory.split('\n').filter((line) => /^\| (Functions|Triggers|Jobs) \|/.test(line));
const kinds = { functions: 'Functions', triggers: 'Triggers', jobs: 'Jobs' };
const names = { functions: [], triggers: [], jobs: [] };

for (const [dir, label] of Object.entries(kinds)) {
  const row = cloudRows.find((line) => line.startsWith(`| ${label} |`)) ?? '';

  for (const file of walk(path.join(CLOUD_DIR, dir), (f) => f.endsWith(`.${dir}.ts`))) {
    const base = path.basename(file).replace(`.${dir}.ts`, '');

    if (!row.includes(`\`${base}\``)) problems.push(`${rel(file)}: \`${base}\` is missing from the "${label}" row of docs/inventory/README.md`);
    const text = read(file);

    if (dir === 'functions') for (const m of text.matchAll(/Parse\.Cloud\.define\(\s*'([^']+)'/g)) names.functions.push(`${base}: ${m[1]}`);
    if (dir === 'jobs') for (const m of text.matchAll(/Parse\.Cloud\.job\(\s*'([^']+)'/g)) names.jobs.push(`${base}: ${m[1]}`);
    if (dir === 'triggers') {
      for (const m of text.matchAll(/Parse\.Cloud\.(before\w+|after\w+)\(\s*([\w.'"]+)/g)) names.triggers.push(`${base}: ${m[1]} ${m[2]}`);
    }
  }
}

if (process.argv.includes('--list')) {
  for (const [kind, list] of Object.entries(names)) console.log(`\n## ${kind} (${list.length})\n${list.join('\n')}`);
}

if (problems.length) {
  console.log(`\nInventory is stale (${problems.length}):\n${problems.map((p) => `  - ${p}`).join('\n')}`);
  process.exit(1);
}
console.log('Inventory matches the code.');
