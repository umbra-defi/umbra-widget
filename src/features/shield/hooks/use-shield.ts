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

const SOL_MINT = 'So11111111111111111111111111111111111111112'

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
    ? () => {
        // For native SOL, leave the deposit fee behind so the tx can pay for
        // itself — otherwise a true max would leave no SOL for fees.
        const reserve =
          token.mintAddress === SOL_MINT ? MIN_PUBLIC_SOL_FOR_SHIELD : 0n
        const maxBase =
          token.amount > reserve ? token.amount - reserve : 0n
        setAmount(fromBaseUnits(maxBase, token.decimals))
      }
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
