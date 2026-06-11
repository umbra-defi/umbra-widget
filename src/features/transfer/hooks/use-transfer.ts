import { useMemo, useState } from 'react'
import { address as toAddress } from '@solana/kit'
import {
  useSupportedTokens,
  useTokenSelection
} from '@/features/token/hooks/use-tokens'
import { useSolGate } from '@/features/token/hooks/use-sol-balance'
import { usePrivateKeysReady } from '@/features/key-consistency/hooks/use-private-keys-ready'
import { MIN_PUBLIC_SOL_FOR_SEND } from '@/constants/sol-requirements'
import { fromBaseUnits, toBaseUnits } from '@/lib/amount'
import { usePrivateSend } from '../query'

/** Transfer = private send (stealth-pool UTXO to recipient), PRIVATE balances. */
export function useTransfer() {
  const { tokens } = useSupportedTokens({ mode: 'private', nonZero: true })
  const { token, onTokenChange } = useTokenSelection(tokens)
  const [amount, setAmount] = useState('')
  const [recipient, setRecipient] = useState('')
  const send = usePrivateSend()
  const { insufficient: lowSol } = useSolGate(MIN_PUBLIC_SOL_FOR_SEND)
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
      recipient.trim().length > 0 &&
      Number(amount) > 0 &&
      !lowSol &&
      !keysNotReady &&
      !send.isPending,
    [token, recipient, amount, lowSol, keysNotReady, send.isPending]
  )

  const submit = () => {
    if (!token || !canSubmit) return
    send.mutate({
      amount: toBaseUnits(amount, token.decimals),
      mint: toAddress(token.mintAddress),
      receiver: toAddress(recipient.trim())
    })
  }

  // createUtxo resolves to { success, error? } — surface a failed result as an error.
  const resultError =
    send.data && !send.data.success ? new Error(send.data.error) : null

  return {
    token,
    tokens,
    onTokenChange,
    amount,
    setAmount,
    lowSol,
    keysNotReady,
    recipient,
    setRecipient,
    balanceLabel,
    onMax,
    canSubmit,
    submit,
    status: send.status,
    error: send.error ?? resultError,
    signature: null
  }
}
