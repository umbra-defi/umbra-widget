import {
  useIsRestoringKeyConsistency,
  useKeyConsistencyQuery
} from '../query'

export interface PrivateKeysReadyState {
  keysReady: boolean
  keysNotReady: boolean
  isVerificationPending: boolean
  isRestoring: boolean
}

/**
 * Whether the account's private keys are verified consistent on-chain — the
 * gate every shielded flow (except claim) checks before allowing a tx. Mirrors
 * mobile main's `usePrivateKeysReady`.
 */
export function usePrivateKeysReady(): PrivateKeysReadyState {
  const { data: verification, isPending } = useKeyConsistencyQuery()
  const isRestoring = useIsRestoringKeyConsistency()

  const keysReady = verification?.allConsistent === true && !isRestoring
  return {
    keysReady,
    keysNotReady: !keysReady || isPending,
    isVerificationPending: isPending,
    isRestoring
  }
}
