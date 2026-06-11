import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'
import tsconfigPaths from 'vite-tsconfig-paths'

const __dirname = dirname(fileURLToPath(import.meta.url))

// Library build. Outputs ESM + CJS + a single styles.css. Workers are bundled
// inline (`worker.format: 'es'`). `@umbra-privacy/client` + `client-platform`
// are BUNDLED in (self-contained widget) — only react / @solana/kit /
// react-query / @umbra-privacy/sdk stay external as peers.
//
// resolve.alias holds exactly one entry, and it's not ours to remove: the
// @metaplex-foundation/* deps (pulled by client/solana) import bare @noble/hashes
// subpaths (v1 style), but pnpm hands them the hoisted v2 — whose `exports` only
// expose `*.js`. This rewrites `@noble/hashes/sha3` → `…/sha3.js` so v2 resolves.
// Scoped to sha2/sha3/utils so it never touches v1-only specifiers like /crypto.
// (The `@/*` source alias is handled by the tsconfigPaths plugin, not here.)
export default defineConfig({
  plugins: [
    tsconfigPaths(),
    react(),
    dts({ rollupTypes: true, tsconfigPath: './tsconfig.build.json' })
  ],
  // Relative base so the emitted ZK-worker asset is referenced as a RELATIVE
  // `new URL('./assets/…', import.meta.url)` instead of a root-absolute
  // `/assets/…` — the latter is unresolvable by host bundlers and would require
  // the host to serve the file from its origin root.
  base: './',
  resolve: {
    // Browser-first resolution. This is a browser-only widget, but the lib
    // build otherwise picks Node entries of isomorphic deps — e.g.
    // @solana/web3.js@1.x's `fetch-impl` and cross-fetch both pull in
    // `node-fetch` (→ Node `stream`, absent in the browser → throws at import).
    // Preferring the `browser` field/condition makes them resolve to native
    // `fetch` instead.
    mainFields: ['browser', 'module', 'jsnext:main', 'jsnext', 'main'],
    conditions: ['browser', 'import', 'module', 'default'],
    alias: [
      {
        find: /^@noble\/hashes\/(sha2|sha3|utils)$/,
        replacement: '@noble/hashes/$1.js'
      },
      // node-fetch is dead in the browser (native fetch exists) but gets pulled
      // in two ways — directly by @solana/web3.js@1.x's `fetch-impl`
      // (`import * as nodeFetch from 'node-fetch'`) and via cross-fetch's Node
      // entry. Its Node `stream` dep gets stubbed to an empty object → throws at
      // import (`Wa.Readable.prototype`). Map both to cross-fetch's browser
      // ponyfill (default/fetch/Headers/Request/Response over native fetch).
      {
        find: /^cross-fetch$/,
        replacement: 'cross-fetch/dist/browser-ponyfill.js'
      },
      {
        find: /^node-fetch$/,
        replacement: 'cross-fetch/dist/browser-ponyfill.js'
      }
    ]
  },
  worker: {
    format: 'es'
  },
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'UmbraWidget',
      fileName: (format) =>
        format === 'es' ? 'umbra-widget.js' : 'umbra-widget.cjs',
      formats: ['es', 'cjs']
    },
    rollupOptions: {
      external: [
        'react',
        'react-dom',
        'react/jsx-runtime',
        /^@solana\/kit/,
        '@tanstack/react-query',
        /^@umbra-privacy\/sdk/
      ],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          '@tanstack/react-query': 'ReactQuery'
        },
        assetFileNames: 'umbra-widget.[ext]'
      }
    }
  }
})
