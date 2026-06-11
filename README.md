# @umbra-privacy/widget

Embeddable **Umbra privacy wallet** in one React component — shield, private
send, unshield, receive/claim, and a private-balance home, with one-time
on-chain registration. Logic comes from `@umbra-privacy/client` (frontend-core),
**bundled in** so the widget is self-contained; heavy ZK proving runs in a Web
Worker.

> **Integrating with an AI agent?** This README is structured for copy-paste
> correctness: every snippet is complete and runnable, deps are version-pinned,
> and known gotchas are called out inline. The single hardest part is the
> **[signer](#signer-the-one-thing-to-get-right)** — read that section first. A
> condensed machine-readable index lives in [`llms.txt`](llms.txt).

---

## Table of contents

- [What it does](#what-it-does)
- [Quickstart (60 seconds)](#quickstart-60-seconds)
- [Install](#install)
- [Concepts](#concepts) — flows, registration, SOL gate, privacy model
- [Signer: the one thing to get right](#signer-the-one-thing-to-get-right)
- [Recipes](#recipes) — wallet-standard, Vite, Next.js, theming, custom config
- [Props reference](#props-reference)
- [Defaults reference](#defaults-reference) — mints, endpoints, SOL minimums
- [Troubleshooting](#troubleshooting)
- [Architecture](#architecture)
- [Develop / build / publish](#develop)

---

## What it does

`<UmbraWidget />` drops a complete private-wallet UI into any React app. The user
shields public Solana tokens into a private balance, sends privately through a
stealth UTXO pool, unshields back to public, and claims incoming private notes —
all from one component you mount with a `signer` and an `rpcUrl`.

- **Self-contained** — `@umbra-privacy/client` + `client-platform` are bundled
  into `dist`. Consumers do **not** install them. No aliases to configure.
- **Two render modes** — modal (pass a `trigger` or control `open`) or inline.
- **Themed at runtime** — `ui` prop maps to scoped CSS vars, no rebuild.
- **Browser-only** — uses Web Worker (ZK), WebCrypto, and IndexedDB.

---

## Quickstart (60 seconds)

```bash
npm i @umbra-privacy/widget
```

```tsx
import { UmbraWidget } from '@umbra-privacy/widget'
import '@umbra-privacy/widget/styles.css'

export function GoPrivate({ signer }) {
  return (
    <UmbraWidget
      signer={signer}                // a @solana/kit signer — see "Signer" below
      rpcUrl="https://your-rpc.example.com"
      trigger={<button>Go Private</button>}
    />
  )
}
```

That's the whole API surface. Everything else (`network`, `mints`, `tabs`, `ui`,
`storage`, `endpoints`) is optional and defaults to Umbra production.

Two app-level requirements that the bundle can't satisfy for you — set them up
once: **Node globals polyfill** and **Web Worker support**. See
[Bundler setup](#bundler-setup). If you skip them the widget fails to init.

---

## Install

```bash
npm i @umbra-privacy/widget
# or: pnpm add / yarn add
```

**Peer dependencies** (the host app provides these — they are not bundled):

| Peer                      | Range            |
| ------------------------- | ---------------- |
| `react`                   | `>=18`           |
| `react-dom`               | `>=18`           |
| `@solana/kit`             | `>=6`            |
| `@tanstack/react-query`   | `>=5`            |
| `@umbra-privacy/sdk`      | `5.0.0-rc.4`     |

`@umbra-privacy/client` and `@umbra-privacy/client-platform` are **bundled at
build time** — do not add them to your app.

Exports:

```ts
import {
  UmbraWidget,        // modal-or-inline component
  UmbraWidgetInline,  // always-inline component
  DEFAULT_MINTS       // the default token list
} from '@umbra-privacy/widget'
import '@umbra-privacy/widget/styles.css'   // required — ships the scoped styles
```

Public types: `UmbraWidgetProps`, `WidgetSigner`, `WidgetMint`, `WidgetTab`,
`WidgetUiConfig`, `WidgetStorage`, `WidgetNetwork`, `WidgetEndpoints`.

---

## Concepts

**Flows (tabs).** Each tab is one privacy operation:

| Tab        | Direction          | What happens                                                            |
| ---------- | ------------------ | ----------------------------------------------------------------------- |
| `home`     | —                  | Private balances + USD value, live prices.                              |
| `shield`   | public → private   | Deposit public tokens into your private balance.                        |
| `transfer` | private → private  | Send privately to another address via the stealth-pool UTXO.            |
| `unshield` | private → public   | Withdraw private balance back to a public account.                      |
| `receive`  | inbound            | Claim incoming private notes addressed to you.                          |

**Registration gate.** On mount the widget checks on-chain registration
(`checkRegistrationOnChain`). Registered users land on Home; everyone else sees
a one-time sign-to-register screen. After registering, the SDK client
auto-initializes; until it's ready the widget shows only the app icon.

**SOL gate.** Shield/transfer/unshield/register all pay on-chain fees, so the
widget blocks them when **public SOL** is below the flow's minimum (button reads
"Not enough SOL"). Claim is relayer-funded and exempt. Minimums in
[Defaults reference](#defaults-reference).

**Key consistency.** The widget verifies that locally-derived keys match what's
on-chain and exposes a restore mutation when they diverge.

**Claimed-UTXO filtering.** A burnt-nullifier indexer plus local hash derivation
filters already-claimed UTXOs (cached in IndexedDB). The nullifier indexer needs
CORS for browsers — see the note in [Defaults reference](#defaults-reference).

---

## Signer: the one thing to get right

`signer` must be a `@solana/kit` signer that can do **both** of these:

1. **Sign messages** (`MessagePartialSigner`) — used once to derive the Umbra
   master seed.
2. **Sign a transaction and return it** — either a `TransactionPartialSigner`
   (`signTransactions`, e.g. a `KeyPairSigner`) **or** a
   `TransactionModifyingSigner` (`modifyAndSignTransactions`, the wallet-standard
   `solana:signTransaction` adapter).

The TypeScript shape ([src/types.ts](src/types.ts#L26-L28)):

```ts
type WidgetSigner = MessagePartialSigner
  & (TransactionModifyingSigner | TransactionPartialSigner)
  & Partial<TransactionSendingSigner>
```

> ⚠️ **A sign-and-send-only wallet is NOT enough.** A `TransactionSendingSigner`
> (`signAndSendTransactions` alone) broadcasts the tx and returns only a
> signature. The Umbra deposit/withdraw pipeline must get the **signed
> transaction bytes back** to submit them through its own relayer/MPC flow.
> `signAndSendTransactions` is accepted as an *optional* fast path when also
> present, but it cannot stand in for a returning signer.

The wallet-standard adapter recipe is in [Recipes → Wallet Standard](#wallet-standard-recommended).

---

## Recipes

### Wallet Standard (recommended)

Adapt a connected Wallet Standard account into a `WidgetSigner` with
`@solana/react`. This is the production path for browser wallets (Phantom,
Solflare, …). Full reference: [playground/wallet/use-widget-signer.ts](playground/wallet/use-widget-signer.ts).

```tsx
import { useMemo } from 'react'
import {
  useWalletAccountMessageSigner,
  useWalletAccountTransactionSigner,
  useWalletAccountTransactionSendingSigner
} from '@solana/react'
import type { UiWalletAccount } from '@wallet-standard/react'
import type { WidgetSigner } from '@umbra-privacy/widget'

export function useWidgetSigner(
  account: UiWalletAccount,
  chain: `solana:${string}`   // e.g. 'solana:mainnet'
): WidgetSigner {
  const signTx = useWalletAccountTransactionSigner(account, chain)
  const sending = useWalletAccountTransactionSendingSigner(account, chain)
  const msg = useWalletAccountMessageSigner(account)

  return useMemo<WidgetSigner>(
    () => ({
      address: signTx.address,
      modifyAndSignTransactions: signTx.modifyAndSignTransactions,
      signAndSendTransactions: sending.signAndSendTransactions, // optional fast path
      signMessages: async (messages) => {
        const signed = await msg.modifyAndSignMessages(messages)
        return signed.map((m) => m.signatures)
      }
    }),
    [signTx, sending, msg]
  )
}
```

Then mount:

```tsx
function Wallet({ account }: { account: UiWalletAccount }) {
  const signer = useWidgetSigner(account, 'solana:mainnet')
  return (
    <UmbraWidget
      signer={signer}
      rpcUrl={RPC_URL}
      network="mainnet"
      trigger={<button>Go Private</button>}
    />
  )
}
```

### KeyPair signer (scripts / tests)

Any `KeyPairSigner` from `@solana/kit` already satisfies `WidgetSigner`
(it's a `MessagePartialSigner` + `TransactionPartialSigner`), so you can pass it
directly.

### Modal vs inline

```tsx
// Modal — controlled
const [open, setOpen] = useState(false)
<UmbraWidget signer={signer} rpcUrl={RPC_URL} open={open} onOpenChange={setOpen} />

// Modal — uncontrolled, opened by its own trigger
<UmbraWidget signer={signer} rpcUrl={RPC_URL} trigger={<button>Go Private</button>} />

// Inline — no trigger and no `open` → renders in place
<UmbraWidgetInline signer={signer} rpcUrl={RPC_URL} className="w-full max-w-md" />
```

Rule: `UmbraWidget` renders as a **modal** when `trigger` or `open` is provided,
otherwise it renders **inline** (identical to `UmbraWidgetInline`).

### Theming

`ui` is partial — unset fields fall back to the built-in light theme. Each field
maps to a scoped CSS variable, re-themable at runtime.

```tsx
<UmbraWidget
  signer={signer}
  rpcUrl={RPC_URL}
  ui={{
    colors: {
      bg: '#0b0d12',
      surface: '#11141b',
      text: '#eef1f6',
      primary: '#3b9dff',
      primaryFg: '#ffffff',
      tabActive: '#1a1f2b'
    },
    font: { primary: 'Inter, system-ui, sans-serif' },
    rounding: '14px'   // single value sets sm/md/lg; or pass { sm, md, lg }
  }}
/>
```

Full color/font/rounding fields: [`WidgetUiConfig`](src/types.ts#L54-L82).

### Custom tokens, tabs, endpoints, storage

```tsx
<UmbraWidget
  signer={signer}
  rpcUrl={RPC_URL}

  // Restrict the supported token set (symbol/decimals/icon auto-resolved from
  // Helius metadata unless you override them here).
  mints={[{ address: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v' }]}

  // Restrict & order the visible tabs.
  tabs={['home', 'shield', 'unshield']}

  // Point at a different deployment, or proxy the nullifier indexer (CORS).
  endpoints={{ nullifierIndexer: 'https://your-origin.example.com/null-proxy' }}

  // Bring your own persistence (defaults to IndexedDB).
  storage={window.localStorage}
/>
```

### Bundler setup

The dist is pre-bundled — **no aliases** needed. Two browser-runtime
requirements carry through to the host app:

**1. Node globals.** The SDK/crypto graph references `Buffer`, `process`, and
`global`. Inject them once:

```ts
// Vite — vite.config.ts
import { nodePolyfills } from 'vite-plugin-node-polyfills'
export default {
  plugins: [nodePolyfills({ globals: { Buffer: true, process: true, global: true } })]
}
```

**2. Web Workers.** ZK proving runs in an ES-module Web Worker the widget spawns
itself. Vite, webpack 5, and Next handle the emitted worker chunk with no
config — just don't strip `import.meta.url` / worker support from your build.

No `@noble/hashes` alias is needed in the host; that's an internal build-time
concern already resolved inside the shipped bundle.

### Next.js (App Router)

The widget is **browser-only** — render it client-side, never on the server.

```bash
npm i buffer process   # polyfill sources for the webpack config
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
  return <UmbraWidget signer={signer} rpcUrl={rpcUrl} trigger={<button>Go Private</button>} />
}
```

> On Turbopack (`next dev --turbo`), the `webpack` field is ignored — run dev on
> webpack, or provide the globals via a `<script>` shim until Turbopack polyfill
> config lands.

---

## Props reference

All props live on [`UmbraWidgetProps`](src/types.ts#L119-L144). `*` = required.

| Prop            | Type                              | Default                  | Notes                                                                 |
| --------------- | --------------------------------- | ------------------------ | --------------------------------------------------------------------- |
| `signer` \*     | `WidgetSigner`                    | —                        | `@solana/kit` signer. See [Signer](#signer-the-one-thing-to-get-right). |
| `rpcUrl` \*     | `string`                          | —                        | Solana RPC HTTP endpoint. WS is derived (`https`→`wss`).              |
| `network`       | `'mainnet' \| 'devnet'`           | inferred from `rpcUrl`   | Override only if inference is wrong.                                  |
| `mints`         | `WidgetMint[]`                    | `DEFAULT_MINTS`          | Supported tokens; metadata auto-resolved unless overridden.          |
| `tabs`          | `WidgetTab[]`                     | all five, in order       | Subset & order of `home`/`shield`/`transfer`/`unshield`/`receive`.   |
| `ui`            | `WidgetUiConfig`                  | light theme              | Partial theme overrides → scoped CSS vars.                           |
| `storage`       | `WidgetStorage`                   | IndexedDB                | KV store; sync (`localStorage`) returns accepted.                    |
| `endpoints`     | `WidgetEndpoints`                 | Umbra production         | Per-field override; each falls back to default.                      |
| `walletAddress` | `Address \| string`               | `signer.address`         | Override the resolved current address.                               |
| `open`          | `boolean`                         | —                        | Controlled modal open state.                                         |
| `onOpenChange`  | `(open: boolean) => void`         | —                        | Modal open-change callback.                                          |
| `trigger`       | `React.ReactNode`                 | —                        | Element that opens the modal. Presence → modal mode.                 |
| `className`     | `string` (inline only)            | standalone card chrome   | `UmbraWidgetInline` only — size/position the inline card.            |

### Type shapes

```ts
interface WidgetMint {
  address: string        // base58 mint
  symbol?: string        // override auto-resolved metadata
  decimals?: number
  iconUrl?: string
}

type WidgetTab = 'home' | 'shield' | 'transfer' | 'unshield' | 'receive'

interface WidgetStorage {                       // IndexedDB-backed KV by default
  getItem(key: string): string | null | Promise<string | null>
  setItem(key: string, value: string): void | Promise<void>
  removeItem(key: string): void | Promise<void>
}

interface WidgetEndpoints {                      // each falls back to prod
  indexer?: string          // UTXO indexer (SDK indexerApiEndpoint)
  nullifierIndexer?: string // burnt-nullifier indexer (claimed-UTXO detection)
  relayer?: string          // gasless relayer
  zkCdnUrl?: string         // ZK assets CDN base (no trailing slash)
  zkManifestUrl?: string    // defaults to `${zkCdnUrl}/v5/manifest.json`
}
```

---

## Defaults reference

**Default mints** ([src/constants/mints.ts](src/constants/mints.ts)) — mirrors
`PRIVATE_MODE_MINTS` from `@umbra-privacy/client`:

```
EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v   (USDC)
PRVT6TB7uss3FrUd2D9xs2zqDBsa3GbMJMwCQsgmeta
So11111111111111111111111111111111111111112    (wSOL)
Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB    (USDT)
CASHx9KJUStyftLFWGvEVf59SGeG9sh5FfcnZMVPCASH
zinc155BS4mSPk8GXQj4R5hkVDQXcW253pTYq5SGyfi
```

**Default endpoints** ([src/constants/endpoints.ts](src/constants/endpoints.ts)):

| Endpoint           | Default                                          |
| ------------------ | ------------------------------------------------ |
| `indexer`          | `https://utxo-indexer.api.umbraprivacy.com`      |
| `nullifierIndexer` | `https://nullifier-indexer.api.umbraprivacy.com` |
| `relayer`          | `https://relayer.api.umbraprivacy.com`           |
| `zkCdnUrl`         | `https://zk.api.umbraprivacy.com`                |
| `zkManifestUrl`    | `${zkCdnUrl}/v5/manifest.json`                   |

> **CORS note:** the nullifier indexer must allow your browser origin. If it
> doesn't, claimed UTXOs won't be filtered — proxy it through your own origin
> and set `endpoints.nullifierIndexer` to the proxy URL.

**Minimum public SOL per flow** (lamports,
[src/constants/sol-requirements.ts](src/constants/sol-requirements.ts)):

| Flow     | Lamports     | ≈ SOL   |
| -------- | ------------ | ------- |
| shield   | `13_000_000` | 0.013   |
| unshield | `13_000_000` | 0.013   |
| transfer | `20_000_000` | 0.020   |
| register | `13_000_000` | 0.013   |
| claim    | —            | relayer-funded (exempt) |

---

## Troubleshooting

| Symptom                                            | Cause                                                 | Fix                                                                                  |
| -------------------------------------------------- | ----------------------------------------------------- | ------------------------------------------------------------------------------------ |
| `Buffer is not defined` / `process is not defined` | Node globals not polyfilled in the host bundler       | Add the polyfill — [Bundler setup](#bundler-setup).                                  |
| Widget never leaves the app-icon screen            | Client init blocked (worker failed, or RPC/registration error) | Verify worker support and a working `rpcUrl`; check console for the init error.      |
| Button reads "Not enough SOL"                      | Public SOL below the flow minimum                     | Fund the wallet — see [SOL minimums](#defaults-reference).                           |
| Type error: signer not assignable to `WidgetSigner`| Sign-and-send-only wallet                             | Provide a returning signer — [Signer](#signer-the-one-thing-to-get-right).          |
| Claimed UTXOs still shown as available             | Nullifier indexer lacks CORS for your origin          | Proxy it and set `endpoints.nullifierIndexer` — [CORS note](#defaults-reference).   |
| SSR crash / `window is not defined` (Next)         | Rendered on the server                                | `dynamic(..., { ssr: false })` + `'use client'` — [Next.js](#nextjs-app-router).    |
| Styles missing / unstyled widget                   | Stylesheet not imported                               | `import '@umbra-privacy/widget/styles.css'`.                                         |

---

## Architecture

```
src/
  UmbraWidget.tsx        # public component (modal + inline)
  widget-body.tsx        # registration / client-init gate → tabs
  types.ts               # all public prop types
  providers/             # WidgetProvider (QueryClient + service graph + signer)
  client/                # services.ts (buildServices), signer, runtime-deps,
                         #   platform (zk/relayer), storage (IndexedDB), legacy seed
  features/<flow>/       # query.ts (RQ) → hooks/use-*.ts → components/*Tab.tsx
  workers/               # zk-proof worker (+ generic worker-rpc in client-platform)
  ui/                    # shadcn-style primitives (Dialog, Tabs, AmountField…)
  constants/             # mints, endpoints, sol-requirements
```

**Data flow.** Balances/prices come from `@umbra-privacy/client/token`
(`useTokens` + `aggregatePortfolio`); privacy flows go through the client's
`shielding` / `utxo` factories. Per-feature convention: `query.ts` (React Query)
→ orchestrator `hooks/use-*.ts` → thin presentational components.

**Legacy seed.** `legacyMasterSeedScheme` is registered so old-scheme accounts
and their UTXOs stay viewable/claimable.

---

## Develop

```bash
pnpm install
pnpm dev        # playground at http://localhost:5180
pnpm build      # dist/ (ESM + CJS + types + styles.css), client bundled in
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
  The lib build omits it on purpose; the host app provides them (see
  [Bundler setup](#bundler-setup)).
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
(set the registry via `.npmrc`). `client` / `client-platform` are bundled at
build time (devDep `file:` tarballs), so consumers don't install them.
