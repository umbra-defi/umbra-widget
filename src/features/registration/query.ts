import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { address as toAddress } from '@solana/kit'
import { useWidgetContext } from '@/providers/widget-context'
import { useUmbraClientInit } from '@/providers/use-umbra-client'
import { isReceiverRegistered } from '@/client/services'

const registeredKey = (address: string) =>
  ['umbra-widget', 'registered', address] as const

/**
 * Whether this account has completed private registration. Checked **on-chain
 * via RPC** (`checkRegistrationOnChain`) — no SDK client / seed signature
 * needed — so a registered user lands straight on Home; only an unregistered
 * account sees the setup screen.
 */
export function useIsRegistered() {
  const { services, walletAddress } = useWidgetContext()
  return useQuery({
    queryKey: registeredKey(walletAddress),
    queryFn: async () => {
      const { isRegistered } =
        await services.sdkService.checkRegistrationOnChain(walletAddress)
      return isRegistered
    },
    staleTime: 30_000
  })
}

/**
 * One-time private-account registration: init the client (derives the master
 * seed via a message signature), then register the commitment + X25519 key
 * on-chain if not already done.
 */
export function useRegister() {
  const { services, runtimeDeps, walletAddress } = useWidgetContext()
  const init = useUmbraClientInit()
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ['umbra-widget', 'register', walletAddress],
    mutationFn: async () => {
      const client = runtimeDeps.getClient() ?? (await init.mutateAsync())
      const already = await isReceiverRegistered(
        client,
        toAddress(walletAddress)
      )
      if (!already) await services.sdkService.registerUser(client)
      return true
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: registeredKey(walletAddress) })
  })
}
