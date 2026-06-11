# Umbra Widget — Next.js example

Minimal Next.js **App Router** app embedding [`@umbra-privacy/widget`](../../)
with a Wallet Standard signer.

## Run

```bash
# 1. Build the widget first (this example consumes its dist via file:../..)
cd ../.. && pnpm install && pnpm build

# 2. Install + run the example
cd examples/nextjs
pnpm install
NEXT_PUBLIC_RPC_URL="https://your-rpc.example.com" pnpm dev
# open http://localhost:3000, connect a Solana wallet, click "Go Private"
```

> Use `pnpm dev` (webpack), **not** `next dev --turbo` — the Node-globals
> polyfill is configured via the `webpack` hook, which Turbopack ignores.

## What this shows

The three things a host app must get right:

1. **Node-globals polyfill** ([`next.config.js`](./next.config.js)) — the bundled
   SDK references `Buffer`/`process`; webpack `ProvidePlugin` + `resolve.fallback`
   provide them. Requires the `buffer` + `process` deps.
2. **Client-only render** ([`wallet-section.tsx`](./app/wallet-section.tsx)) — the
   widget uses Web Worker / WebCrypto / IndexedDB, so it's loaded with
   `dynamic(() => import('./private-widget'), { ssr: false })`. The rest of the
   page SSRs normally.
3. **A returning signer** ([`use-widget-signer.ts`](./app/use-widget-signer.ts)) —
   built from `useWalletAccountTransactionSigner` (`modifyAndSignTransactions`),
   **not** the sending-only signer. The Umbra pipeline needs the signed
   transaction back. See the widget README's *Signer* section.

Styles are imported once in [`app/layout.tsx`](./app/layout.tsx)
(`import '@umbra-privacy/widget/styles.css'`).

## File map

```
next.config.js              # Buffer/process polyfill (webpack)
app/
  layout.tsx                # imports widget styles.css
  page.tsx                  # host page (server component)
  wallet-section.tsx        # 'use client' — connect state + dynamic(ssr:false) widget
  private-widget.tsx        # 'use client' — builds signer + mounts <UmbraWidget/>
  use-widget-signer.ts      # wallet-standard account -> WidgetSigner
  wallet-ui.tsx             # connect button / account badge
```
