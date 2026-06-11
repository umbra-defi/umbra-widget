import { useQuery } from '@tanstack/react-query'
import { address as toAddress } from '@solana/kit'
import { useWidgetContext } from '@/providers/widget-context'

/** Public (on-chain) SOL balance of the connected wallet, in lamports. */
export function usePublicSolBalance() {
  const { runtimeDeps, walletAddress } = useWidgetContext()
  return useQuery({
    queryKey: ['umbra-widget', 'public-sol', walletAddress],
    queryFn: async () => {
      const { value } = await runtimeDeps
        .getRpc()
        .getBalance(toAddress(walletAddress))
        .send()
      return BigInt(value)
    },
    staleTime: 15_000,
    refetchInterval: 30_000
  })
}

/**
 * Gate a flow on having enough public SOL for its on-chain fees. `insufficient`
 * is only true once the balance has loaded (so we don't block prematurely).
 */
export function useSolGate(required: bigint) {
  const { data: balance } = usePublicSolBalance()
  return {
    balance,
    required,
    insufficient: balance !== undefined && balance < required
  }
}
