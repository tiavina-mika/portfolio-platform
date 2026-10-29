import { readFileSync } from 'node:fs'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

// read rather than imported: a JSON import here would need an import attribute the TS config doesn't allow
const { version } = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf-8'))

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
    // the build the admin is looking at
    'import.meta.env.VITE_APP_VERSION': JSON.stringify(version),
  },
  server: {
    open: true,
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
     * bundled crypto-browserify into the parse chunk for nothing.
     */
    nodePolyfills({ include: ['events'] }),
  ],
  build: {
    chunkSizeWarningLimit: 500,
    rollupOptions: {
      output: {
        // the libraries get chunks of their own: they change far less often than the app code
        manualChunks: (id: string) => {
          if (!id.includes('node_modules')) return undefined
          if (id.includes('node_modules/parse/')) return 'parse'
          if (/node_modules\/(react|react-dom|scheduler)\//.test(id)) return 'react'
          if (/node_modules\/(@mui\/(material|system|utils|styled-engine|private-theming)|@emotion)\//.test(id)) {
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
