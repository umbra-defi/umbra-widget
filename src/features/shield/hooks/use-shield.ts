import { useMemo, useState } from 'react'
import { useWidgetContext } from '@/providers/widget-context'
import {
  useSupportedTokens,
  useTokenSelection
} from '@/features/token/hooks/use-tokens'
import { useSolGate } from '@/features/token/hooks/use-sol-balance'
import { usePrivateKeysReady } from '@/features/key-consistency/hooks/use-private-keys-ready'
import { MIN_PUBLIC_SOL_FOR_SHIELD } from '@/constants/sol-requirements'
import { fromBaseUnits, toBaseUnits } from '@/lib/amount'
import { useShieldDeposit } from '../query'

/** Shield = deposit public → private, so it lists PUBLIC balances of the
 *  supported (private-mode) mints. */
export function useShield() {
  const { walletAddress } = useWidgetContext()
  const { tokens, isFetching } = useSupportedTokens({
    mode: 'public',
    nonZero: true
  })
  const { token, onTokenChange } = useTokenSelection(tokens)
  const [amount, setAmount] = useState('')
  const deposit = useShieldDeposit()
  const { insufficient: lowSol } = useSolGate(MIN_PUBLIC_SOL_FOR_SHIELD)
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
      Number(amount) > 0 &&
      !lowSol &&
      !keysNotReady &&
      !deposit.isPending,
    [token, amount, lowSol, keysNotReady, deposit.isPending]
  )

  const submit = () => {
    if (!token || !canSubmit) return
    deposit.mutate({
      destinationAddress: walletAddress,
      token: { mintAddress: token.mintAddress },
      transferAmount: toBaseUnits(amount, token.decimals)
    })
  }

  return {
    token,
    tokens,
    onTokenChange,
    amount,
    setAmount,
    balanceLabel,
    balanceLoading: isFetching,
    onMax,
    canSubmit,
    lowSol,
    keysNotReady,
    submit,
    status: deposit.status,
    error: deposit.error,
    signature: deposit.data?.signature ?? null
  }
}
