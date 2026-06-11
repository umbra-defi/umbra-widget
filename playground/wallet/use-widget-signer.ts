import { useMemo } from 'react'
import {
  useWalletAccountMessageSigner,
  useWalletAccountTransactionSendingSigner,
  useWalletAccountTransactionSigner
} from '@solana/react'
import type { UiWalletAccount } from '@wallet-standard/react'
import type { WidgetSigner } from '@/index'

/**
 * Adapt a connected Wallet Standard account to the widget's {@link WidgetSigner}.
 *
 * The Umbra deposit/withdraw pipeline needs a signer that returns the SIGNED
 * transaction (it submits the bytes itself), so we use
 * `useWalletAccountTransactionSigner` — a `TransactionModifyingSigner`
 * (`modifyAndSignTransactions`, backed by the wallet's `solana:signTransaction`
 * feature). The sending signer is exposed too as an optional fast path for
 * flows that just sign-and-broadcast. `signMessages` is bridged from the
 * wallet's `modifyAndSignMessages` (drop the unused modified content).
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
