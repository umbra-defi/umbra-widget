import { useMutation } from '@tanstack/react-query'
import { useWidgetContext } from '@/providers/widget-context'

/**
 * Private send. NOT a public SPL transfer (`@umbra-privacy/client/send`) — it
 * creates a stealth-pool UTXO addressed to the recipient
 * (ETA → receiver-burnable) via the utxo factory, the same path mobile's
 * private send uses. Returns `{ success, error? }`.
 */
export function usePrivateSend() {
  const { services, walletAddress } = useWidgetContext()
  return useMutation(services.utxo.createUtxoMutation(walletAddress))
}
