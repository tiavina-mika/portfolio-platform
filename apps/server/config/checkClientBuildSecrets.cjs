const fs = require('fs');
const path = require('path');

/**
 * Scans server/clientBuild/ (the committed BO bundle) for literal values of
 * sensitive VITE_* variables defined in bo/.env.preprod and bo/.env.prod.
 * Vite inlines every VITE_* variable into the client bundle at build time, so any
 * variable whose name looks like a secret (KEY/SECRET/TOKEN/PASSWORD suffix) must
 * never end up readable in the committed JS.
 */

const ENV_FILES = ['../../bo/.env.preprod', '../../bo/.env.prod'];
const CLIENT_BUILD_DIR = path.join(__dirname, '..', 'clientBuild');
const SENSITIVE_KEY_PATTERN = /(KEY|SECRET|TOKEN|PASSWORD)$/i;
const SCANNABLE_FILE_PATTERN = /\.(js|mjs|cjs|map)$/;
const MIN_SECRET_LENGTH = 8;

const walk = (dir) => {
  const files = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...walk(fullPath));
    } else {
      files.push(fullPath);
    }
  }
  return files;
};

const parseEnvSecrets = (envPath) => {
  if (!fs.existsSync(envPath)) return [];

  const content = fs.readFileSync(envPath, 'utf8');
  const secrets = [];

  for (const line of content.split('\n')) {
    const match = line.match(/^\s*VITE_([A-Z0-9_]+)\s*=\s*(.+?)\s*$/);
    if (!match) continue;

    const [, name, rawValue] = match;
    if (!SENSITIVE_KEY_PATTERN.test(name)) continue;

    const value = rawValue.replace(/^['"]|['"]$/g, '');
    if (value.length >= MIN_SECRET_LENGTH) {
      secrets.push({ name: `VITE_${name}`, value });
    }
  }

  return secrets;
};

const run = () => {
  const secrets = ENV_FILES.flatMap((file) => parseEnvSecrets(path.join(__dirname, file)));

  if (secrets.length === 0) {
    console.log('No sensitive VITE_* variables found in bo env files — skipping clientBuild secret scan.');
    return;
  }

  if (!fs.existsSync(CLIENT_BUILD_DIR)) {
    console.log('No clientBuild/ directory found — skipping secret scan.');
    return;
  }

  const files = walk(CLIENT_BUILD_DIR).filter((file) => SCANNABLE_FILE_PATTERN.test(file));
  const leaks = [];

  for (const file of files) {
    const content = fs.readFileSync(file, 'utf8');
    for (const secret of secrets) {
      if (content.includes(secret.value)) {
        leaks.push({ file, name: secret.name });
      }
    }
  }

  if (leaks.length > 0) {
    console.error('\nSecret leak detected in server/clientBuild/ — commit blocked.\n');
    for (const leak of leaks) {
      console.error(`  - ${leak.name} found in ${leak.file}`);
    }
    console.error(
      '\nThese files would be committed to the server repo, exposing the secret in git history.' +
        '\nMove this variable out of bo/.env.* or rename it without a KEY/SECRET/TOKEN/PASSWORD suffix' +
        ' if it is meant to be public.\n',
    );
    process.exitCode = 1;
    return;
  }

  console.log(`Scanned ${files.length} clientBuild file(s) — no known secrets found.`);
};

run();
