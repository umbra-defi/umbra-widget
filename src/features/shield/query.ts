import { useMutation } from '@tanstack/react-query'
import { useWidgetContext } from '@/providers/widget-context'

export interface ShieldDepositVars {
  destinationAddress: string
  token: { mintAddress: string }
  transferAmount: bigint
}

/** Deposit (shield) mutation from the shared shielding factory. */
export function useShieldDeposit() {
  const { services } = useWidgetContext()
  return useMutation(services.shielding.depositMutation())
}
