import { useCallback, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  aggregatePortfolio,
  useEtaBalances,
  type Token
} from '@umbra-privacy/client/token'
import { useWidgetContext } from '@/providers/widget-context'

const SOL_MINT = 'So11111111111111111111111111111111111111112'

const usdConverter = (usd: number) => usd

export interface UseTokensResult {
  tokens: Token[]
  totalValue: number | null
  isLoading: boolean
  /** True whenever balances/prices are refetching, even with cached data shown. */
  isFetching: boolean
  refetch: () => void
}

interface UseTokensOptions {
  mode?: 'private' | 'public'
  enabled?: boolean
  /** Drop zero-balance tokens (e.g. for the send/shield selection list). */
  nonZero?: boolean
}

export function useTokens({
  mode = 'private',
  enabled = true
}: UseTokensOptions = {}): UseTokensResult {
  const { services, walletAddress } = useWidgetContext()
  const isPrivate = mode === 'private'

  const publicBalances = useQuery(
    services.token.balances(walletAddress, enabled && !isPrivate)
  )
  const etaBalances = useEtaBalances(
    services.token,
    walletAddress,
    enabled && isPrivate
  )
  const balances = isPrivate ? etaBalances : publicBalances

  const priceMints = useMemo(() => {
    const tokens = balances.data?.tokens ?? []
    const spl = tokens
      .filter((t) => t.type === 'spl-token' && t.mintAddress)
      .map((t) => t.mintAddress as string)
    const hasSol = tokens.some((t) => t.type === 'native' && t.amount > 0n)
    return hasSol ? [SOL_MINT, ...spl] : spl
  }, [balances.data])

  const prices = useQuery(services.token.prices(priceMints, enabled))

  const aggregate = useMemo(
    () =>
      aggregatePortfolio(
        balances.data,
        prices.data?.prices ?? {},
        usdConverter
      ),
    [balances.data, prices.data]
  )

  return {
    tokens: aggregate.tokens,
    totalValue: aggregate.totalValue,
    isLoading:
      balances.isLoading || (priceMints.length > 0 && prices.isLoading),
    isFetching:
      balances.isFetching || (priceMints.length > 0 && prices.isFetching),
    refetch: () => {
      void balances.refetch()
      void prices.refetch()
    }
  }
}

/**
 * Supported-mint metadata (symbol / name / icon / decimals). Cached forever —
 * persisted to storage and never marked stale — so after the first fetch the
 * token list renders instantly without a skeleton.
 */
export function useMintMetadataMap() {
  const { services } = useWidgetContext()
  const query = useQuery({
    ...services.token.privateModeMintsMetadataMap(),
    staleTime: Infinity,
    gcTime: Infinity
  })
  return {
    metadataMap: query.data ?? {},
    isLoading: query.isLoading,
    isFetched: query.isFetched
  }
}

export function useSupportedTokens(
  opts: UseTokensOptions = {}
): UseTokensResult {
  const { mints } = useWidgetContext()
  const result = useTokens(opts)
  const supported = useMemo(() => new Set(mints.map((m) => m.address)), [mints])
  const tokens = useMemo(
    () =>
      result.tokens.filter(
        (t) =>
          supported.has(t.mintAddress) && (!opts.nonZero || t.amount > 0n)
      ),
    [result.tokens, supported, opts.nonZero]
  )
  return { ...result, tokens }
}

/** Track a selected token by mint address (stable across list refreshes). */
export function useTokenSelection(tokens: Token[]) {
  const [address, setAddress] = useState<string | null>(null)
  const token = useMemo(
    () => tokens.find((t) => t.mintAddress === address) ?? tokens[0] ?? null,
    [tokens, address]
  )
  const onTokenChange = useCallback((t: Token) => setAddress(t.mintAddress), [])
  return { token, onTokenChange }
}
