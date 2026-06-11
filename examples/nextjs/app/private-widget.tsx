'use client'

import { UmbraWidget } from '@umbra-privacy/widget'
import type { UiWalletAccount } from '@wallet-standard/react'
import { useWidgetSigner } from './use-widget-signer'

// Helius mainnet RPC (DAS-capable) for the demo — override with NEXT_PUBLIC_RPC_URL.
const RPC_URL =
  process.env.NEXT_PUBLIC_RPC_URL ??
  'https://jacklin-n6jvhy-fast-mainnet.helius-rpc.com'

/**
 * Loaded only on the client (via `dynamic(..., { ssr: false })` in
 * wallet-section). Builds a `WidgetSigner` from the connected wallet account and
 * mounts the widget in modal mode (controlled by `open` / `onOpenChange`).
 */
export function PrivateWidget({
  account,
  chain,
  open,
  onOpenChange
}: {
  account: UiWalletAccount
  chain: `solana:${string}`
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const signer = useWidgetSigner(account, chain)

  return (
    <UmbraWidget
      signer={signer}
      rpcUrl={RPC_URL}
      network="mainnet"
      open={open}
      onOpenChange={onOpenChange}
    />
  )
}
