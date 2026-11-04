import { execSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import { sentryVitePlugin } from '@sentry/vite-plugin'
import { visualizer } from 'rollup-plugin-visualizer'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

/*
 * by path rather than through `@shared/constants`: the config runs in Node, which cannot load that
 * package's TypeScript entry by name — these two files import nothing, so they bundle on their own
 */
import { PERSISTED_STATE_KEY } from '../../libs/shared-constants/src/app.constants'
import { DEFAULT_COUNTRY } from '../../libs/shared-constants/src/country.constants'
import { detectLocale } from './src/config/i18n/locale-detection'

// read rather than imported: a JSON import here would need an import attribute the TS config doesn't allow
const { version } = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf-8'))

/*
 * what Sentry calls this build: the commit it was made from, so every deploy has its own release and an
 * error can be traced to the code that shipped it. The package version is the fallback for a build made
 * outside a git checkout. Sent to `Sentry.init` and to the source map upload, which must agree.
 */
const getRelease = (): string => {
  try {
    return execSync('git rev-parse --short HEAD', { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim()
  } catch {
    return version
  }
}
const release = getRelease()

const LOCALE_CHUNK_PATTERN = /[\/]config[\/]i18n[\/]locales[\/]([a-z]+)[\/]index\.ts$/

/**
 * A build with no Sentry setting succeeds and simply reports nothing, which nobody notices on a host where
 * the build log is never read. Say it loudly instead, for each missing piece: the DSN (no error reaches
 * Sentry), the environment (the app stays silent) and the token (readable stack traces are lost).
 */
const warnAboutMissingSentrySettings = (): Plugin => ({
  name: 'warn-missing-sentry-settings',
  apply: 'build',
  buildStart() {
    const missing: string[] = []

    if (!process.env.VITE_SENTRY_DSN) missing.push('VITE_SENTRY_DSN: this build will report NO error to Sentry')
    if (!['preProduction', 'production'].includes(process.env.VITE_SENTRY_ENVIRONMENT ?? '')) {
      missing.push('VITE_SENTRY_ENVIRONMENT (preProduction | production): the reporting stays off')
    }
    if (!process.env.SENTRY_AUTH_TOKEN) {
      missing.push('SENTRY_AUTH_TOKEN: no source map is uploaded, production stack traces stay minified')
    }

    if (missing.length) {
      this.warn(`Sentry is not fully set up for this build:\n  - ${missing.join('\n  - ')}`)
    }
  },
})

/**
 * Only the displayed language is downloaded, and the app waits for it before running (labels are
 * translated as modules load). Left to the app, that download would only start once every chunk
 * is in and running — one more round-trip before anything shows. This injects a small script at
 * the top of `index.html` that picks the language the same way the app does (the very same
 * function, serialized) and preloads that language's chunk alongside the app chunks.
 */
const preloadActiveLocale = (): Plugin => {
  let base = '/'

  return {
    name: 'preload-active-locale',
    apply: 'build',
    configResolved: (config) => {
      base = config.base
    },
    transformIndexHtml: {
      order: 'post',
      handler: (html, context) => {
        const localeChunks: Record<string, string> = {}

        Object.values(context.bundle ?? {}).forEach((output) => {
          const match = output.type === 'chunk' && output.facadeModuleId?.match(LOCALE_CHUNK_PATTERN)

          if (match) localeChunks[match[1]] = `${base}${output.fileName}`
        })

        if (Object.keys(localeChunks).length === 0) return html

        const detectArgs = [
          JSON.stringify(PERSISTED_STATE_KEY),
          'Object.keys(localeChunks)',
          JSON.stringify(DEFAULT_COUNTRY.locale),
        ].join(', ')
        const script = `(() => {
  const localeChunks = ${JSON.stringify(localeChunks)};
  const detectLocale = ${detectLocale.toString()};
  const locale = detectLocale(${detectArgs});
  const link = document.createElement('link');
  link.rel = 'modulepreload';
  link.href = localeChunks[locale];
  document.head.appendChild(link);
})();`

        return { html, tags: [{ tag: 'script', children: script, injectTo: 'head-prepend' }] }
      },
    },
  }
}

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    tsconfigPaths: true,
    alias: {
      "@/": new URL('./src', import.meta.url).pathname,
      "assets": new URL('./public', import.meta.url).pathname,
    },
  },
  optimizeDeps: {
    include: ['@emotion/react', '@emotion/styled'],
  },
  define: {
    'process.env': {},
    // the build the admin is looking at, shown in the page footer
    'import.meta.env.VITE_APP_VERSION': JSON.stringify(version),
    // the release reported to Sentry (see `getRelease`)
    'import.meta.env.VITE_APP_RELEASE': JSON.stringify(release),
    // when this build was made, shown on the about page as the last update
    'import.meta.env.VITE_APP_BUILD_TIME': JSON.stringify(new Date().toISOString()),
  },
  server: {
    open: true,
    port: 5174
  },
  plugins: [
    react({
      jsxImportSource: '@emotion/react',
      babel: {
        plugins: ['@emotion/babel-plugin'],
      },
    }),
    /*
     * The Parse SDK's browser build needs exactly one Node module: `events` (its EventEmitter —
     * without it, the "Emitter" constructor error). Polyfilling every module by default also
     * bundled crypto-browserify (elliptic, asn1, bn.js, vm-browserify…) into the parse chunk,
     * for crypto-js's `require('crypto')`, a fallback it only reaches when `window.crypto` is
     * missing — never in a browser the back-office supports. That was ~470 KB raw of dead code
     * loaded on every start.
     */
    nodePolyfills({ include: ['events'] }),
    preloadActiveLocale(),
    warnAboutMissingSentrySettings(),
    // `ANALYZE=1 pnpm build:preprod` writes stats.html next to the build: a treemap of every chunk
    process.env.ANALYZE && visualizer({ filename: 'dist/stats.html', gzipSize: true }),
    /*
     * Uploads the source maps so production stack traces show the real files and lines. Last in the
     * list, so it sees the final bundle; off without the token (local and CI builds send nothing).
     * Its release must match the one given to `Sentry.init`, or Sentry cannot pair the maps. The
     * `.map` files are deleted once uploaded: Express serves the whole build folder.
     */
    process.env.SENTRY_AUTH_TOKEN
      ? sentryVitePlugin({
          authToken: process.env.SENTRY_AUTH_TOKEN,
          org: process.env.SENTRY_ORG,
          project: process.env.SENTRY_PROJECT,
          release: { name: release },
        // the plugin otherwise reports its own usage to Sentry: a build sends the maps and nothing else
        telemetry: false,
          sourcemaps: { filesToDeleteAfterUpload: ['dist/**/*.map'] },
        // by default a failed upload is only logged and the maps stay in `dist/`: fail the build instead
        errorHandler: (error) => {
          throw error
        },
        })
      : undefined,
  ],
  build: {
    // 'hidden' emits the maps without the `sourceMappingURL` comment, so browsers never fetch them
    sourcemap: process.env.SENTRY_AUTH_TOKEN ? 'hidden' : false,
    /*
     * back to Vite's default: every chunk loaded on start stays under it. The one known exception is
     * the rich-text editor chunk, only fetched when an edit page opens; any other chunk named in
     * the warning means something heavy has crept in again
     */
    chunkSizeWarningLimit: 500,
    rollupOptions: {
      output: {
        /*
         * the libraries get chunks of their own, apart from the app code: they change far less often,
         * so a deploy only invalidates the app chunks and returning admins keep React/MUI/Parse cached
         */
        manualChunks: (id: string) => {
          if (!id.includes('node_modules')) return undefined
          if (id.includes('node_modules/parse/')) return 'parse'
          if (/node_modules\/(react|react-dom|scheduler)\//.test(id)) return 'react'
          if (/node_modules\/(@mui\/(material|system|utils|styled-engine|private-theming)|@emotion)\//
            .test(id)) {
            return 'mui'
          }
          if (/node_modules\/@tanstack\/(react-router|router-core|history|react-store|store)\//.test(id)) {
            return 'router'
          }
          return undefined
        },
      },
    },
  },
})
