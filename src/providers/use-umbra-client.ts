import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useWidgetContext } from '@/providers/widget-context'

const clientKey = (address: string) =>
  ['umbra-widget', 'client', address] as const

/**
 * Initialise the Umbra SDK client for the current signer via the frontend-core
 * factory (`sdkService.initPrivateMode`) and push it into the shared
 * RuntimeDeps. The first init signs a message to derive the master seed (cached
 * after, so reloads skip it).
 */
function init(ctx: ReturnType<typeof useWidgetContext>) {
  // Single-flight: the registration mutation and the ensure query may both call
  // this concurrently. `ensureClient` dedupes them to one `initPrivateMode`, so
  // the master seed is derived (and signed) exactly once.
  return ctx.runtimeDeps.ensureClient(async () => {
    const sdk = await ctx.services.getSdkService()
    return sdk.initPrivateMode({
      walletAddress: ctx.walletAddress,
      signer: ctx.walletSigner
    })
  })
}

/**
 * Auto-initialise the client once the account is registered (gate already
 * passed) so ETA balances + flows have a live client. Balance/utxo queries that
 * ran while the client was null are invalidated on success so they refetch.
 */
export function useEnsureUmbraClient(enabled: boolean) {
  const ctx = useWidgetContext()
  const queryClient = useQueryClient()
  return useQuery({
    queryKey: clientKey(ctx.walletAddress),
    queryFn: async () => {
      const client = await init(ctx)
      // Client is now live — refetch anything that depended on it (ETA
      // balances, utxo scans) but ran/short-circuited while it was null.
      void queryClient.invalidateQueries()
      return client
    },
    enabled,
    staleTime: Infinity,
    gcTime: Infinity,
    retry: false
  })
}

/** Imperative client init (used by registration). */
export function useUmbraClientInit() {
  const ctx = useWidgetContext()
  return useMutation({
    mutationKey: ['umbra-widget', 'client-init', ctx.walletAddress],
    mutationFn: () => init(ctx)
  })
}
