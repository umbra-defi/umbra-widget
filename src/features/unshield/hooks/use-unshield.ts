import { useMemo, useState } from 'react'
import { useWidgetContext } from '@/providers/widget-context'
import {
  useSupportedTokens,
  useTokenSelection
} from '@/features/token/hooks/use-tokens'
import { useSolGate } from '@/features/token/hooks/use-sol-balance'
import { usePrivateKeysReady } from '@/features/key-consistency/hooks/use-private-keys-ready'
import { MIN_PUBLIC_SOL_FOR_UNSHIELD } from '@/constants/sol-requirements'
import { fromBaseUnits, toBaseUnits } from '@/lib/amount'
import { useUnshieldWithdraw } from '../query'

/** Unshield = withdraw private → public, lists PRIVATE (ETA) balances. */
export function useUnshield() {
  const { walletAddress } = useWidgetContext()
  const { tokens } = useSupportedTokens({ mode: 'private', nonZero: true })
  const { token, onTokenChange } = useTokenSelection(tokens)
  const [amount, setAmount] = useState('')
  const [destination, setDestination] = useState(walletAddress)
  const withdraw = useUnshieldWithdraw()
  const { insufficient: lowSol } = useSolGate(MIN_PUBLIC_SOL_FOR_UNSHIELD)
  const { keysNotReady } = usePrivateKeysReady()

  const balanceLabel = token
    ? fromBaseUnits(token.amount, token.decimals)
    : '—'
  const onMax = token
    ? () => setAmount(fromBaseUnits(token.amount, token.decimals))
    : undefined

  const canSubmit = useMemo(
    () =>
      !!token &&
      destination.trim().length > 0 &&
      Number(amount) > 0 &&
      !lowSol &&
      !keysNotReady &&
      !withdraw.isPending,
    [token, destination, amount, lowSol, keysNotReady, withdraw.isPending]
  )

  const submit = () => {
    if (!token || !canSubmit) return
    withdraw.mutate({
      destinationAddress: destination.trim(),
      token: { mintAddress: token.mintAddress },
      withdrawalAmount: toBaseUnits(amount, token.decimals)
    })
  }

  return {
    token,
    tokens,
    onTokenChange,
    amount,
    setAmount,
    destination,
    setDestination,
    balanceLabel,
    onMax,
    canSubmit,
    lowSol,
    keysNotReady,
    submit,
    status: withdraw.status,
    error: withdraw.error,
    signature: withdraw.data?.signature ?? null
  }
}
