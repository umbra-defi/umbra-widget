# @umbra-privacy/widget

Embeddable Umbra privacy widget. One React component, four flows — **Shield**,
**Transfer**, **Unshield**, **Receive (vault)** — plus a one-time **registration**
screen. Logic comes from `@umbra-privacy/client` (frontend-core); heavy SDK ops
(groth16 proving, bulk AES decrypt) run in Web Workers.

## Install

```bash
pnpm add @umbra-privacy/widget @umbra-privacy/client @umbra-privacy/sdk \
  @solana/kit @tanstack/react-query react react-dom
```

`@umbra-privacy/client` and `@umbra-privacy/sdk` are peer deps so the host
controls the protocol version.

## Usage

```tsx
import { UmbraWidget } from "@umbra-privacy/widget";
import "@umbra-privacy/widget/styles.css";

<UmbraWidget
  signer={signer}                 // @solana/kit signer (sign messages + send txns)
  rpcUrl="https://…"
  tabs={["shield", "transfer", "unshield", "receive"]}
  ui={{
    colors: { primary: "#3b9dff", bg: "#fff", text: "#0b0d12" },
    font: { primary: "Inter, sans-serif" },
    rounding: "16px",
  }}
/>;
```

Render as a modal by passing a `trigger` (or controlling `open` / `onOpenChange`).

### Props

| Prop            | Type                       | Default            |
| --------------- | -------------------------- | ------------------ |
| `signer`        | `WidgetSigner` (@solana/kit) | —                  |
| `rpcUrl`        | `string`                   | —                  |
| `network`       | `"mainnet" \| "devnet"`    | inferred from rpc  |
| `ui`            | `WidgetUiConfig`           | built-in light     |
| `mints`         | `WidgetMint[]`             | `DEFAULT_MINTS`    |
| `tabs`          | `WidgetTab[]`              | all four           |
| `storage`       | `WidgetStorage`            | `localStorage`     |
| `trigger`/`open`| modal control              | inline             |

## Theming

The `ui` object maps to CSS custom properties scoped to a `.uw-root` element,
so the host can re-theme at runtime without a rebuild. See
[`src/theme/apply-theme.ts`](src/theme/apply-theme.ts).

## Architecture

```
UmbraWidget
 └─ WidgetProvider          QueryClient + RuntimeDeps + signer resolver + workers
     └─ WidgetBody          registration gate → tabs
         ├─ ShieldTab       features/shield   → @umbra-privacy/client/shielding
         ├─ TransferTab     features/transfer → @umbra-privacy/client/send
         ├─ UnshieldTab     features/unshield → @umbra-privacy/client/shielding
         └─ ReceiveTab      features/receive  → @umbra-privacy/client/utxo
```

Each feature follows the repo convention: `query.ts` (React Query wiring) →
`hooks/use-*.ts` (orchestrator) → `components/*Tab.tsx` (thin, render-only).

## Develop

```bash
pnpm install
pnpm dev        # playground at http://localhost:5180
pnpm build      # dist/ (ESM + CJS + types + styles.css)
pnpm typecheck
```

## Dependencies

`@umbra-privacy/client` and `client-platform` install as **tarballs**
(`tarballs/*.tgz`, see `package.json`) — not workspace links — so the widget
never depends on building frontend-core locally. `@umbra-privacy/sdk` and the
codama packages come from the registry, pinned via `pnpm.overrides` to the
**main-branch** versions:

| Package                       | Version       |
| ----------------------------- | ------------- |
| `@umbra-privacy/sdk`          | `5.0.0-rc.4`  |
| `@umbra-privacy/arcium-codama`| `2.0.1`       |
| `@umbra-privacy/umbra-codama` | `3.0.0-rc.4`  |

Nothing of the client is bundled into the published widget — the lib build
(`vite.config.ts`) marks `@umbra-privacy/*` **external** (peer deps), and
`src/index.ts` only re-exports `UmbraWidget` + types, so unused client features
are never exposed.

## frontend-core changes this widget required

Getting the client tarball web-buildable needed two source fixes in
`frontend-core/packages/client` (both shipped in the repacked tarball here):

1. **`src/lib/index.ts`** — re-export `toU256/toU64/toU32/toTransactionSignature`
   from `./sdk-brands`. `utxo` imported `toU256` from `@/lib` but the barrel
   never exported it → dead import.
2. **`tsup.config.ts`** — exclude the `bridge` feature from the build. It's
   mid-refactor (its `lib/` imports `@/zk` + `@/encrypted-db` at runtime, which
   the cross-feature rule rejects) and nothing else imports it. Re-include once
   bridge wires those deps through its factory.

## Standing config notes

- **`@solana/kit` 6.x** — `@solana-program/*` peer-require `^6.4.0` (they import
  `@solana/kit/program-client-core`). Pinned via `pnpm.overrides`. Don't drop to
  2.x.
- **Vite wildcard exports** — Vite's dev resolver doesn't honor the client's
  `"./*": "./dist/*/index.js"` exports, so `vite.playground.config.ts` aliases
  the subpaths to `node_modules/.../dist/*/index.js`.
- **@noble/hashes shim** — the client dist mixes bare (`/sha2`) and `.js`
  noble imports while pinning v2; the playground maps bare → `.js`. Remove once
  frontend-core ships consistent imports.

## Publishing

Deferred. The widget is set up for npm publish (`files: ["dist"]`, `exports`),
but is not wired to any registry yet.
