import { createContext, useContext } from 'react'
import type { WidgetMint, WidgetNetwork, WidgetStorage } from '@/types'
import type { WalletSigner } from '@umbra-privacy/client/lib'
import type { RuntimeDepsHandle } from '@/client/runtime-deps'
import type { WidgetServices } from '@/client/services'

/** Everything the feature hooks need, assembled once by WidgetProvider. */
export interface WidgetContextValue {
  rpcUrl: string
  network: WidgetNetwork
  walletAddress: string
  mints: WidgetMint[]
  storage: WidgetStorage
  runtimeDeps: RuntimeDepsHandle
  walletSigner: WalletSigner
  services: WidgetServices
}

export const WidgetContext = createContext<WidgetContextValue | null>(null)

export function useWidgetContext(): WidgetContextValue {
  const ctx = useContext(WidgetContext)
  if (!ctx)
    throw new Error('useWidgetContext must be used inside <UmbraWidget />')
  return ctx
}

/** Resolve a mint from the configured list by address. */
export function useMint(address: string | null): WidgetMint | null {
  const { mints } = useWidgetContext()
  if (!address) return null
  return mints.find((m) => m.address === address) ?? null
}
