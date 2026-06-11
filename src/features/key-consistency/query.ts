import {
  useIsMutating,
  useMutation,
  useQuery,
  useQueryClient
} from '@tanstack/react-query'
import { address as toAddress } from '@solana/kit'
import {
  verifyKeyConsistency,
  getRestoreKeyConsistencyFunction
} from '@umbra-privacy/sdk/validation'
import type { IUmbraClient } from '@umbra-privacy/client/sdk'
import { useWidgetContext } from '@/providers/widget-context'
import { useIsRegistered } from '@/features/registration/query'
import { getRegistrationProver } from '@/client/platform'

export const keyConsistencyQueryKeys = {
  verify: (address: string) =>
    ['umbra-widget', 'key-consistency', 'verify', address] as const,
  restore: (address: string) =>
    ['umbra-widget', 'key-consistency', 'restore', address] as const,
  restorePrefix: ['umbra-widget', 'key-consistency', 'restore'] as const
}

export function useIsRestoringKeyConsistency(): boolean {
  return useIsMutating({ mutationKey: keyConsistencyQueryKeys.restorePrefix }) > 0
}

/**
 * Verify the locally-derived private keys match what's registered on-chain
 * (`verifyKeyConsistency` from the SDK). Mirrors mobile main. Runs once the
 * client is live + the account is registered.
 */
export function useKeyConsistencyQuery() {
  const { runtimeDeps, walletAddress, mints } = useWidgetContext()
  const registered = useIsRegistered()
  const client = runtimeDeps.getClient() as IUmbraClient | null

  return useQuery({
    queryKey: keyConsistencyQueryKeys.verify(walletAddress),
    queryFn: () =>
      verifyKeyConsistency({
        client: client!,
        additionalMints: mints.map((m) => toAddress(m.address)),
        includeUserCommitment: true
      }),
    enabled: !!client && registered.data === true,
    staleTime: 0,
    refetchOnMount: 'always'
  })
}

/** Restore on-chain key consistency (re-registers the inconsistent keys). */
export function useRestoreKeyConsistencyMutation() {
  const { runtimeDeps, walletAddress, mints } = useWidgetContext()
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: keyConsistencyQueryKeys.restore(walletAddress),
    mutationFn: async () => {
      const client = runtimeDeps.getClient() as IUmbraClient | null
      if (!client) throw new Error('Umbra client not initialized')
      const zkProver = await getRegistrationProver()
      const restore = getRestoreKeyConsistencyFunction({ client }, { zkProver })
      return restore({
        additionalMints: mints.map((m) => toAddress(m.address)),
        includeUserCommitment: true
      })
    },
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: keyConsistencyQueryKeys.verify(walletAddress)
      })
  })
}
