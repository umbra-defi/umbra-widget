import { useMemo } from 'react'
import { formatUsdValue } from '@umbra-privacy/client/lib'
import { fromBaseUnits } from '@/lib/amount'
import { useWidgetContext } from '@/providers/widget-context'
import {
  useMintMetadataMap,
  useSupportedTokens
} from '@/features/token/hooks/use-tokens'

export interface HomeRow {
  mintAddress: string
  symbol: string
  name: string
  iconUrl?: string
  /** Null while the balance is still loading — render a skeleton. */
  balance: string | null
  usd: string | null
}

/**
 * Home tab: the configured mints (list + metadata available immediately, so
 * the row list never disappears) with their private (ETA) balance overlaid.
 * Only the balance/USD numbers are gated on the balances fetch.
 */
export function useHome() {
  const { mints } = useWidgetContext()
  const { metadataMap, isLoading: metaLoading } = useMintMetadataMap()
  const { tokens, isLoading, isFetching, refetch } = useSupportedTokens({
    mode: 'private'
  })

  // Balances ready once the query has data; skeleton until then (or while a
  // refetch is in flight with no cached data).
  const balanceLoading = isLoading

  const byMint = useMemo(
    () => new Map(tokens.map((t) => [t.mintAddress, t])),
    [tokens]
  )

  const rows = useMemo<HomeRow[]>(
    () =>
      mints.map((m) => {
        const meta = metadataMap[m.address]
        const tok = byMint.get(m.address)
        const decimals = meta?.decimals ?? m.decimals ?? tok?.decimals ?? 0
        const symbol = meta?.symbol ?? m.symbol ?? tok?.symbol ?? ''
        return {
          mintAddress: m.address,
          symbol,
          name: meta?.name ?? tok?.name ?? symbol,
          iconUrl: meta?.iconUrl ?? m.iconUrl ?? tok?.iconUrl,
          balance: balanceLoading
            ? null
            : fromBaseUnits(tok?.amount ?? 0n, decimals),
          usd: balanceLoading ? null : formatUsdValue(tok?.value ?? 0)
        }
      }),
    [mints, metadataMap, byMint, balanceLoading]
  )

  // Total private balance across supported tokens (USD).
  const totalUsd = useMemo(
    () => formatUsdValue(tokens.reduce((sum, t) => sum + (t.value ?? 0), 0)),
    [tokens]
  )

  // First-ever load (no cached metadata): render full skeleton rows.
  return {
    rows,
    isLoading,
    isFetching,
    refetch,
    metaLoading,
    totalUsd,
    totalLoading: balanceLoading
  }
}
