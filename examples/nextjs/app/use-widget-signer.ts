'use client'

import { useMemo } from 'react'
import {
  useWalletAccountMessageSigner,
  useWalletAccountTransactionSendingSigner,
  useWalletAccountTransactionSigner
} from '@solana/react'
import type { UiWalletAccount } from '@wallet-standard/react'
import type { WidgetSigner } from '@umbra-privacy/widget'

/**
 * Adapt a connected Wallet Standard account into a {@link WidgetSigner}.
 *
 * The Umbra pipeline needs a signer that **returns the signed transaction** (it
 * submits the bytes through its own relayer/MPC flow), so we use
 * `useWalletAccountTransactionSigner` — a `TransactionModifyingSigner`
 * (`modifyAndSignTransactions`, backed by the wallet's `solana:signTransaction`
 * feature). The sending signer is exposed as an optional fast path. A
 * sign-and-send-only wallet would NOT be enough — see the widget README.
 */
export function useWidgetSigner(
  account: UiWalletAccount,
  chain: `solana:${string}`
): WidgetSigner {
  const signTxSigner = useWalletAccountTransactionSigner(account, chain)
  const sendingSigner = useWalletAccountTransactionSendingSigner(account, chain)
  const msgSigner = useWalletAccountMessageSigner(account)

  return useMemo<WidgetSigner>(
    () => ({
      address: signTxSigner.address,
      modifyAndSignTransactions: signTxSigner.modifyAndSignTransactions,
      signAndSendTransactions: sendingSigner.signAndSendTransactions,
      signMessages: async (messages) => {
        const signed = await msgSigner.modifyAndSignMessages(messages)
        return signed.map((m) => m.signatures)
      }
    }),
    [signTxSigner, sendingSigner, msgSigner]
  )
}
