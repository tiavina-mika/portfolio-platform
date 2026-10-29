/*
 * Runs the Storybook tests of one app in shards, and runs a failed shard again.
 *
 * On a two-core CI runner, Chromium sometimes drops the test iframe while it is busy ("Cannot connect to
 * the iframe", "Browser connection was closed"), roughly once every hundred story files. Vitest treats that
 * as fatal for the whole run, so a single app-wide run almost never completes. A shard of a few dozen files
 * does, and the rare shard that still fails passes when it is run again. A story that really fails fails
 * every attempt, so the run still goes red for it.
 *
 * usage: node scripts/run-story-tests.mjs <app> <shards>
 */
import { spawnSync } from 'node:child_process';
import { readdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

const MAX_ATTEMPTS = 3;

const [app, shardsArg] = process.argv.slice(2);
const shards = Number(shardsArg);

if (!app || !Number.isInteger(shards) || shards < 1) {
  console.error('usage: node scripts/run-story-tests.mjs <app> <shards>');
  process.exit(2);
}

/*
 * Chromium leaves its profile folder (hundreds of MB of cache) in the temp folder when it is closed in the
 * middle of a run, and a CI runner has little disk: after a few failed attempts it runs out of space.
 */
const removeChromiumProfiles = () => {
  readdirSync(tmpdir())
    .filter((name) => name.startsWith('playwright'))
    .forEach((name) => rmSync(path.join(tmpdir(), name), { recursive: true, force: true }));
};

const printFreeDisk = () => {
  if (process.platform !== 'win32') spawnSync('df', ['-h', '/', tmpdir()], { stdio: 'inherit' });
};

const runShard = (shard) => {
  const result = spawnSync(
    'pnpm',
    ['nx', 'run', `${app}:test-storybook`, '--', `--shard=${shard}/${shards}`],
    { stdio: 'inherit', shell: process.platform === 'win32' },
  );

  return result.status === 0;
};

const failedShards = [];
const retriedShards = [];

for (let shard = 1; shard <= shards; shard += 1) {
  let passed = false;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS && !passed; attempt += 1) {
    console.log(`::group::${app} shard ${shard}/${shards}, attempt ${attempt}`);
    passed = runShard(shard);
    removeChromiumProfiles();
    printFreeDisk();
    console.log('::endgroup::');

    if (!passed && attempt < MAX_ATTEMPTS) retriedShards.push(`${shard}/${shards}`);
  }

  if (!passed) failedShards.push(`${shard}/${shards}`);
}

if (retriedShards.length > 0) {
  console.log(`${app}: shards run again after a failure: ${retriedShards.join(', ')}`);
}

if (failedShards.length > 0) {
  console.error(`${app}: shards still failing after ${MAX_ATTEMPTS} attempts: ${failedShards.join(', ')}`);
  process.exit(1);
}

console.log(`${app}: all ${shards} shards passed`);
