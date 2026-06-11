import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

const __dirname = dirname(fileURLToPath(import.meta.url))
const SRC = resolve(__dirname, 'src')
const NM = resolve(__dirname, 'node_modules')

// Dev playground — mounts the widget against a throwaway signer. The umbra
// packages install as tarballs/registry deps (see package.json).
export default defineConfig({
  plugins: [
    // The @umbra-privacy/sdk graph assumes a Node-ish runtime (process, Buffer,
    // global, node builtins). Polyfill them so the widget runs in a browser.
    nodePolyfills({ globals: { Buffer: true, global: true, process: true } }),
    react()
  ],
  resolve: {
    alias: [
      // The client-platform/web barrel re-exports hardware-wallet transports
      // (ledger BLE/HID) the widget never uses. Dev Vite doesn't tree-shake, so
      // stub these optional native peers to keep the barrel resolvable.
      {
        find: /^@ledgerhq\/hw-transport-(web-ble|webhid)$/,
        replacement: `${resolve(__dirname, 'src/stubs/empty.ts')}`
      },
      // Upstream defect shim: the prebuilt @umbra-privacy/client dist imports
      // some @noble/hashes subpaths bare (`/sha2`, v1 style) while the pinned
      // @noble/hashes@^2 only exposes `*.js` subpaths. Map bare → `.js`.
      {
        find: /^@noble\/hashes\/(sha2|sha3|utils)$/,
        replacement: '@noble/hashes/$1.js'
      },
      // Vite's dev resolver doesn't honor the client's wildcard `exports`
      // (`"./*": "./dist/*/index.js"`), so map subpaths straight to the built
      // files in node_modules. Stable regardless of how the dep is installed.
      {
        find: /^@umbra-privacy\/client-platform\/(.+)$/,
        replacement: `${NM}/@umbra-privacy/client-platform/dist/$1/index.js`
      },
      {
        find: /^@umbra-privacy\/client\/(.+)$/,
        replacement: `${NM}/@umbra-privacy/client/dist/$1/index.js`
      },
      { find: /^@\/(.*)$/, replacement: `${SRC}/$1` }
    ],
    dedupe: ['react', 'react-dom', '@tanstack/react-query']
  },
  worker: { format: 'es' },
  root: '.',
  server: { port: 5180, open: true }
})
