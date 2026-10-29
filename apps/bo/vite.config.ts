import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'

import { nodePolyfills } from 'vite-plugin-node-polyfills'

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: {
        // parse: path.resolve(__dirname, './node_modules/parse/dist/parse.min.js'),
        // "parse": new URL('./node_modules/parse/dist/parse.min.js', import.meta.url).pathname,
        "@/": new URL('./src', import.meta.url).pathname,
        "assets": new URL('./public', import.meta.url).pathname,
        },
      },
      optimizeDeps: {
        include: ['@emotion/react', '@emotion/styled'],
      },
      define: {
        'process.env': {},
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
        // Polyfill Node.js core modules in the browser
        // To fix the "Emitter" constructor error from parse sdk
        nodePolyfills(),
        tsconfigPaths(),
      ],
      build: {
        // Controls the warning threshold for chunk sizes
        chunkSizeWarningLimit: 1200,
        rollupOptions: {
          output: {
            // Code splitting for Parse SDK
            manualChunks: (id: any) => {
              if (id.includes('node_modules/parse')) return 'parse'
            },
          },
          // ← Magic line that suppresses the eval warning
          onwarn(warning, handler) {
            // Specifically suppresses the eval warning from vm-browserify
            if (warning.code === 'EVAL' && (warning.id as any)?.includes('vm-browserify')) {
              return; // ignore
            }
            // Lets other warnings pass through as usual
        handler(warning);
      },
    },
  },
})
