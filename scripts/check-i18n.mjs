#!/usr/bin/env node
/**
 * Two checks on the translation files, run in CI and by `pnpm check-i18n`.
 *
 * 1. **Parity** — every key that exists in the reference locale exists in the others. A missing key
 *    is not a crash: i18next falls back to the key itself or to French, so an English or Malagasy
 *    reader sees `regeneratePdf` where a label should be, and nobody notices until they switch
 *    language.
 * 2. **Usage** — every `t('namespace:key')` written in the code resolves to a key that exists. This
 *    is the one that would have caught `form.errors:invalidPhoneNumber`, a namespace that never
 *    existed, printed raw on the login, sign-up and password-reset screens.
 *
 * Only literal keys are checked: a key built at runtime (`t(`user:${status}`)`) is skipped rather
 * than guessed at, which is why the check has no false positives to silence.
 */
import { readdirSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const REFERENCE_LOCALE = 'fr';
const SOURCE_EXTENSIONS = ['.ts', '.tsx'];

/**
 * `checkUsage: false` for the website: next-intl splits the namespace from the key
 * (`useTranslations('Form')` then `t('submit')`), so a literal `t('...')` there says nothing about
 * which file the key lives in. Parity still applies to it.
 */
const APPS = [
  { name: 'bo', localesDir: 'apps/bo/src/config/i18n/locales', sourceDir: 'apps/bo/src', checkUsage: true },
  { name: 'server', localesDir: 'apps/server/src/locales', sourceDir: 'apps/server/src', checkUsage: false },
  { name: 'web', localesDir: 'apps/web/translations', sourceDir: 'apps/web', checkUsage: false },
];

/** `t('ns:some.key')`, `i18n.t("ns:some.key")` — the only form this can resolve with certainty. */
const NAMESPACED_KEY_PATTERN = /\bt\(\s*['"]([a-zA-Z][\w.-]*):([\w.-]+)['"]/g;

/**
 * Blanks out every object literal nested inside a namespace of the exported object
 * (`contact: { ...contact, filters: { ...contact.filters } }` keeps `contact`'s own body but loses
 * `filters`'), so a sub-object that merges two files is not mistaken for a namespace of its own.
 */
const maskNestedObjects = (source) => {
  let depth = 0;

  return [...source].map((character) => {
    if (character === '{') depth += 1;

    const isMasked = depth >= 3;

    if (character === '}') depth -= 1;

    return isMasked ? ' ' : character;
  }).join('');
};

/**
 * i18next namespaces are named by the `index.ts` that assembles them, not by the file on disk —
 * the back-office serves `entity.json` as the `project` namespace, so matching filenames would
 * report every `t('project:...')` in it as an unknown namespace.
 *
 * A namespace too large for one file is split into a folder and merged back under one key
 * (`user: { ...user, ...userInbox }`), so several files can map to the same namespace.
 */
const readNamespaceNames = (localesDir, locale) => {
  const byFile = new Map();

  let index;

  try {
    index = readFileSync(join(ROOT, localesDir, locale, 'index.ts'), 'utf8');
  }
  catch {
    // no index: the namespace is the file name (this is what the server and the website do)
    return byFile;
  }

  const importsByAlias = new Map(
    [...index.matchAll(/import\s+(\w+)\s+from\s+'\.\/([\w./-]+)\.json'/g)]
      .map(([, alias, file]) => [alias, file])
  );
  const exported = index.slice(index.indexOf('export default'));
  const namespaceBySpreadAlias = new Map(
    [...maskNestedObjects(exported).matchAll(/(\w+):\s*\{([^}]*)\}/g)].flatMap(([, namespace, body]) => (
      [...body.matchAll(/\.\.\.(\w+)/g)].map(([, alias]) => [alias, namespace])
    ))
  );

  for (const [alias, file] of importsByAlias) {
    const spreadNamespace = namespaceBySpreadAlias.get(alias);

    if (spreadNamespace) {
      byFile.set(file, spreadNamespace);
      continue;
    }

    // `export default { common, project }` — an alias left out is not served as a namespace at all
    if (new RegExp(String.raw`\b${alias}\b`).test(exported)) byFile.set(file, alias);
  }

  return byFile;
};

/**
 * i18next resolves `t('key')` to `key_one`/`key_other`/… depending on the count, so a plural key
 * satisfies a lookup on its stem.
 */
const PLURAL_SUFFIXES = ['_zero', '_one', '_two', '_few', '_many', '_other'];

const stripPluralSuffix = (key) => {
  const suffix = PLURAL_SUFFIXES.find((candidate) => key.endsWith(candidate));

  return suffix ? key.slice(0, -suffix.length) : key;
};

const flattenKeys = (value, prefix = '') => {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) return [prefix];

  return Object.entries(value).flatMap(
    ([key, child]) => flattenKeys(child, prefix ? `${prefix}.${key}` : key)
  );
};

const readNamespace = (localesDir, locale, file) => {
  const raw = readFileSync(join(ROOT, localesDir, locale, file), 'utf8');

  return new Set(flattenKeys(JSON.parse(raw)));
};

// paths relative to `dir`, sub-folders included (`user/inbox.json`) — a split namespace lives in one
const listJsonFiles = (dir, prefix = '') => readdirSync(join(ROOT, dir, prefix), { withFileTypes: true })
  .flatMap((entry) => {
    const file = prefix ? `${prefix}/${entry.name}` : entry.name;

    if (entry.isDirectory()) return listJsonFiles(dir, file);

    return entry.name.endsWith('.json') ? [file] : [];
  });

const listSourceFiles = (dir) => {
  const entries = readdirSync(join(ROOT, dir), { withFileTypes: true });

  return entries.flatMap((entry) => {
    const path = join(dir, entry.name);

    if (entry.isDirectory()) {
      // generated output and dependencies hold no translation call worth checking
      if (['node_modules', 'dist', '.next', '.expo', 'storybook-static'].includes(entry.name)) return [];

      return listSourceFiles(path);
    }

    return SOURCE_EXTENSIONS.some((extension) => entry.name.endsWith(extension)) ? [path] : [];
  });
};

const errors = [];

for (const app of APPS) {
  const locales = readdirSync(join(ROOT, app.localesDir), { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name);
  const otherLocales = locales.filter((locale) => locale !== REFERENCE_LOCALE);
  const referenceKeysByNamespace = new Map();
  const namespaceByFile = readNamespaceNames(app.localesDir, REFERENCE_LOCALE);

  // ---------------------------- 1. parity ----------------------------
  for (const file of listJsonFiles(join(app.localesDir, REFERENCE_LOCALE))) {
    const fileName = file.replace(/\.json$/, '');
    const referenceKeys = readNamespace(app.localesDir, REFERENCE_LOCALE, file);
    const namespace = namespaceByFile.get(fileName);

    // a file the index does not export is not a namespace (zod.json is read directly by zod-i18n)
    if (namespace) {
      const namespaceKeys = referenceKeysByNamespace.get(namespace) ?? new Set();

      referenceKeys.forEach((key) => namespaceKeys.add(key));
      referenceKeysByNamespace.set(namespace, namespaceKeys);
    }
    if (namespaceByFile.size === 0) referenceKeysByNamespace.set(fileName, referenceKeys);

    for (const locale of otherLocales) {
      let localeKeys;

      try {
        localeKeys = readNamespace(app.localesDir, locale, file);
      }
      catch {
        errors.push(`${app.name}: ${locale}/${file} is missing entirely`);
        continue;
      }

      const missing = [...referenceKeys].filter((key) => !localeKeys.has(key));
      const extra = [...localeKeys].filter((key) => !referenceKeys.has(key));

      for (const key of missing) errors.push(`${app.name}: ${locale}/${file} is missing "${key}"`);
      for (const key of extra) errors.push(`${app.name}: ${locale}/${file} has "${key}", absent from ${REFERENCE_LOCALE}`);
    }
  }

  // ---------------------------- 2. usage ----------------------------
  if (!app.checkUsage) continue;

  for (const file of listSourceFiles(app.sourceDir)) {
    const content = readFileSync(join(ROOT, file), 'utf8');

    for (const [, namespace, key] of content.matchAll(NAMESPACED_KEY_PATTERN)) {
      // `t('vehicle:types.' + type)` — a prefix, not a key: what follows decides, so skip it
      if (key.endsWith('.')) continue;

      const referenceKeys = referenceKeysByNamespace.get(namespace);

      if (!referenceKeys) {
        errors.push(`${relative(ROOT, file)}: namespace "${namespace}" does not exist (used as "${namespace}:${key}")`);
        continue;
      }

      /*
       * a parent key is a legitimate target: `t('user:reviews')` on an object returns the object,
       * which the plural/context handling and `returnObjects` callers rely on
       */
      const isKnown = referenceKeys.has(key) ||
        [...referenceKeys].some(
          (referenceKey) => referenceKey.startsWith(`${key}.`) || stripPluralSuffix(referenceKey) === key
        );

      if (!isKnown) {
        errors.push(`${relative(ROOT, file)}: "${namespace}:${key}" is defined in no locale`);
      }
    }
  }
}

if (errors.length > 0) {
  for (const error of errors) console.error(error);
  console.error(`\n${errors.length} translation problem(s) found.`);
  process.exit(1);
}

console.log('Translations are consistent across every locale, and every key used in the code exists.');
