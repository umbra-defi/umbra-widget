import { useSolGate } from '@/features/token/hooks/use-sol-balance'
import { MIN_PUBLIC_SOL_FOR_REGISTER } from '@/constants/sol-requirements'
import { useIsRegistered, useRegister } from '../query'

/** Orchestrator for the registration screen. */
export function useRegistration() {
  const registered = useIsRegistered()
  const register = useRegister()
  const { insufficient: lowSol } = useSolGate(MIN_PUBLIC_SOL_FOR_REGISTER)

  return {
    isRegistered: registered.data === true,
    isChecking: registered.isLoading,
    register: () => {
      if (lowSol) return
      register.mutate()
    },
    lowSol,
    status: register.status,
    error: register.error
  }
}
