import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { nodePolyfills } from 'vite-plugin-node-polyfills'
import tsconfigPaths from 'vite-tsconfig-paths'

// Dev playground — mounts the widget against a throwaway signer. The umbra
// packages install as tarballs/registry deps (see package.json).
export default defineConfig({
  plugins: [
    // nodePolyfills: the @umbra-privacy/sdk graph (+ its solana/crypto deps) was
    // written for Node — it touches `Buffer`, `process`, and `global`, none of
    // which exist in the browser. This injects browser shims for them so the
    // bundle runs in the playground. Required in dev AND for any host app; the
    // library build inherits the host's polyfills, so it's only set here.
    nodePolyfills({ globals: { Buffer: true, global: true, process: true } }),
    // Resolves the widget's own `@/*` imports from tsconfig `paths` — no manual
    // alias needed.
    tsconfigPaths(),
    react()
  ],
  resolve: {
    alias: [
      // The lone alias, and not ours to drop: the @metaplex-foundation/* deps
      // (via client/solana) import bare @noble/hashes subpaths (v1 style) but
      // pnpm hands them the hoisted v2, whose `exports` only expose `*.js`. This
      // rewrites `@noble/hashes/sha3` → `…/sha3.js`. Scoped to sha2/sha3/utils so
      // it never touches v1-only specifiers like /crypto.
      {
        find: /^@noble\/hashes\/(sha2|sha3|utils)$/,
        replacement: '@noble/hashes/$1.js'
      }
    ]
  },
  worker: { format: 'es' },
  root: '.',
  server: { port: 5180, open: true }
})
