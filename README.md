# @umbra-privacy/widget

Embeddable **Umbra privacy wallet** in one React component — shield, private
send, unshield, receive/claim, and a private-balance home, with one-time
on-chain registration. Logic comes from `@umbra-privacy/client` (frontend-core),
**bundled in** so the widget is self-contained; heavy ZK proving runs in a Web
Worker.

## Install

```bash
npm i @umbra-privacy/widget
```

Peer deps the host provides: `react`, `react-dom`, `@solana/kit` (>=6),
`@tanstack/react-query` (>=5), `@umbra-privacy/sdk` (`5.0.0-rc.4`).

## Usage

```tsx
import { UmbraWidget,UmbraWidgetInline } from '@umbra-privacy/widget'
import '@umbra-privacy/widget/styles.css'

// Modal — pass a `trigger` (or control via `open`/`onOpenChange`)
<UmbraWidget signer={signer} rpcUrl={RPC_URL} trigger={<button>Go Private</button>} />

// Inline — no trigger/open → renders in place (or import UmbraWidgetInline)
<UmbraWidgetInline signer={signer} rpcUrl={RPC_URL} />
```

`signer` is a `@solana/kit` signer that can **sign messages** and **return a
signed transaction** — i.e. a `TransactionPartialSigner` (`signTransactions`,
e.g. a `KeyPairSigner`) or a `TransactionModifyingSigner`
(`modifyAndSignTransactions`, the wallet-standard `solana:signTransaction`
adapter via `useWalletAccountTransactionSigner`). The widget submits the signed
bytes via `rpcUrl`.

> A **sign-and-send-only** wallet (`TransactionSendingSigner` /
> `signAndSendTransactions` alone) is **not enough**: the Umbra deposit/withdraw
> pipeline needs the signed transaction back to submit through its own
> relayer/MPC flow, and a sending signer only broadcasts + returns a signature.
> `signAndSendTransactions` is accepted as an optional fast path when also
> present.

### Bundler setup

The dist is pre-bundled (client + client-platform are baked in), so there are
**no aliases to configure** — but two browser-runtime requirements carry through
to the host app:

- **Node globals** — the underlying SDK/crypto graph references `Buffer`,
  `process`, and `global`. Most browser bundlers don't provide these. Inject
  them once at the app level:

  ```ts
  // Vite — vite.config.ts
  import { nodePolyfills } from 'vite-plugin-node-polyfills'
  export default { plugins: [nodePolyfills({ globals: { Buffer: true, process: true, global: true } })] }
  ```

  (webpack 5: add `ProvidePlugin` for `Buffer`/`process` + `resolve.fallback`.)

- **Web Workers** — ZK proving runs in an ES-module Web Worker that the widget
  spawns itself. Any modern bundler (Vite, webpack 5, Next) handles the emitted
  worker chunk with no config; just don't strip `import.meta.url` / worker
  support from your build.

No `@noble/hashes` alias is needed in the host — that's an internal build-time
concern, already resolved inside the shipped bundle.

#### Next.js (App Router)

The widget is browser-only (Web Worker, WebCrypto, IndexedDB) — render it client
side, never on the server.

```bash
npm i buffer process   # polyfill sources for the webpack config below
```

```js
// next.config.js
const webpack = require('webpack')

module.exports = {
  webpack: (config) => {
    config.plugins.push(
      new webpack.ProvidePlugin({
        Buffer: ['buffer', 'Buffer'],
        process: 'process/browser'
      })
    )
    config.resolve.fallback = {
      ...config.resolve.fallback,
      buffer: require.resolve('buffer'),
      process: require.resolve('process/browser')
    }
    return config
  }
}
```

```tsx
// app/wallet.tsx
'use client'

import dynamic from 'next/dynamic'
import '@umbra-privacy/widget/styles.css'

// ssr: false — the widget touches browser-only APIs at import time.
const UmbraWidget = dynamic(
  () => import('@umbra-privacy/widget').then((m) => m.UmbraWidget),
  { ssr: false }
)

export function Wallet({ signer, rpcUrl }) {
  return (
    <UmbraWidget signer={signer} rpcUrl={rpcUrl} trigger={<button>Go Private</button>} />
  )
}
```

On Turbopack (`next dev --turbo`), the `webpack` field is ignored — run dev on
webpack, or provide the globals via a `<script>` shim until Turbopack polyfill
config lands.

### Props

| Prop                                | Type                           | Default                |
| ----------------------------------- | ------------------------------ | ---------------------- |
| `signer`\*                          | `WidgetSigner` (`@solana/kit`) | —                      |
| `rpcUrl`\*                          | `string`                       | —                      |
| `network`                           | `'mainnet' \| 'devnet'`        | inferred from `rpcUrl` |
| `mints`                             | `WidgetMint[]`                 | `DEFAULT_MINTS`        |
| `tabs`                              | `WidgetTab[]`                  | all (`home`…`receive`) |
| `ui`                                | `WidgetUiConfig`               | light theme            |
| `storage`                           | `WidgetStorage`                | IndexedDB              |
| `endpoints`                         | `WidgetEndpoints`              | Umbra production       |
| `trigger` / `open` / `onOpenChange` | modal control                  | inline                 |
| `walletAddress`                     | `string`                       | `signer.address`       |

## Features

- **Tabs**: `home` (private balances + USD), `shield` (public→private),
  `transfer` (private send via stealth-pool UTXO), `unshield` (private→public),
  `receive` (claim incoming notes).
- **Registration gate** — on-chain check (`checkRegistrationOnChain`); registered
  users land on Home, others see the one-time sign-to-register screen. The SDK
  client auto-inits after; until ready the widget shows only the app icon.
- **SOL gate** — blocks shield/transfer/unshield/register when public SOL is
  below the flow's fee minimum (button shows "Not enough SOL").
- **Key consistency** — verifies local keys match on-chain; exposes a restore
  mutation when they don't.
- **Claimed-UTXO filtering** — burnt-nullifier indexer + local hash derivation
  (not the SDK nullifier store), cached in IndexedDB.
- **Legacy seed** — `legacyMasterSeedScheme` registered so old-scheme accounts
  and their UTXOs stay viewable/claimable.
- **Live prices + USD input** — token prices refetch on interval; the ↓↑ control
  flips the amount input between token and `$`.
- **Theming** — `ui` (colors/font/rounding) maps to scoped CSS vars; re-themable
  at runtime, no rebuild.

## Endpoints

`endpoints` overrides any of `indexer`, `nullifierIndexer`, `relayer`,
`zkCdnUrl`, `zkManifestUrl` (defaults → Umbra production). **Note:** the
nullifier indexer needs CORS for browsers — if it lacks it, proxy it through
your origin and set `endpoints.nullifierIndexer` to the proxy, else claimed
UTXOs won't be filtered.

## Architecture (for contributors/agents)

```
src/
  UmbraWidget.tsx        # public component (modal + inline)
  widget-body.tsx        # registration/client-init gate → tabs
  types.ts               # all public prop types
  providers/             # WidgetProvider (QueryClient + service graph + signer)
  client/                # services.ts (buildServices), signer, runtime-deps,
                         #   platform (zk/relayer), storage (IndexedDB), legacy seed
  features/<flow>/       # query.ts (RQ) → hooks/use-*.ts → components/*Tab.tsx
  workers/               # zk-proof worker (+ generic worker-rpc in client-platform)
  ui/                    # shadcn-style primitives (Dialog, Tabs, AmountField…)
```

Data: balances/prices via `@umbra-privacy/client/token` (`useTokens` +
`aggregatePortfolio`); flows via the client's `shielding`/`utxo` factories.
Conventions (per repo): `query.ts` → orchestrator `hooks/` → thin components.

## Develop

```bash
pnpm install
pnpm dev        # playground at :5180
pnpm build      # dist/ (ESM+CJS+types+styles.css), client bundled in
pnpm typecheck
```

### Build-config notes (`vite.config.ts` / `vite.playground.config.ts`)

The build configs are deliberately minimal. What remains and why:

- **`@noble/hashes` alias** (the one `resolve.alias` entry) — `@metaplex-foundation/*`
  deps (pulled by `client/solana`) bare-import noble v1 subpaths, but pnpm hands
  them the hoisted v2, whose `exports` only expose `*.js`. The alias rewrites
  `@noble/hashes/sha3` → `…/sha3.js`. Scoped to `sha2|sha3|utils` so it never
  touches v1-only specifiers (`/crypto`). Irreducible: client needs v2, mpl needs
  v1, and pnpm won't give mpl its own v1 for a peer dep.
- **`nodePolyfills` (playground only)** — Buffer/process/global for the SDK graph.
  The lib build omits it on purpose; the host app provides them (see Bundler
  setup). 
- **`worker: { format: 'es' }`** — the ZK worker is an ES module (top-level
  `import` of snarkjs), so it must be emitted as ESM, not the legacy IIFE.
- **`vite-tsconfig-paths`** — resolves the widget's own `@/*` imports from
  tsconfig, so no manual `@` alias.

Client subpaths resolve with no alias because `@umbra-privacy/client` /
`client-platform` ship **explicit (non-wildcard) `exports`**; the ledger
transports load via dynamic `import()`, so no stub is needed.

## Publishing

Prepped, not auto-published — see `publishConfig` (`restricted`). Bump `version`,
`pnpm build`, `npm pack --dry-run` (ships `dist/` only), then `npm publish`
(set the registry via `.npmrc`). `client`/`client-platform` are bundled at
build time (devDep `file:` tarballs), so consumers don't install them.
