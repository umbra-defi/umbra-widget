import { useMutation } from '@tanstack/react-query'
import { useWidgetContext } from '@/providers/widget-context'

/** Withdraw (unshield) mutation from the shared shielding factory. */
export function useUnshieldWithdraw() {
  const { services } = useWidgetContext()
  return useMutation(services.shielding.withdrawMutation())
}
