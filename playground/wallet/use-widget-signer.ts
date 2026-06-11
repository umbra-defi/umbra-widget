import { useMemo } from 'react'
import {
  useWalletAccountMessageSigner,
  useWalletAccountTransactionSendingSigner
} from '@solana/react'
import type { UiWalletAccount } from '@wallet-standard/react'
import type { WidgetSigner } from '@/index'

/**
 * Adapt a connected Wallet Standard account to the widget's {@link WidgetSigner}
 * (kit `TransactionSendingSigner & MessagePartialSigner`).
 *
 * The wallet hooks vend a `TransactionSendingSigner` (wallet owns the RPC, so it
 * signs *and* sends) and a `MessageModifyingSigner`. The widget expects a
 * `MessagePartialSigner` (`signMessages`), so we bridge `modifyAndSignMessages`
 * → `signMessages` by dropping the (unused) modified content and keeping the
 * signature dictionaries.
 */
export function useWidgetSigner(
  account: UiWalletAccount,
  chain: `solana:${string}`
): WidgetSigner {
  const txSigner = useWalletAccountTransactionSendingSigner(account, chain)
  const msgSigner = useWalletAccountMessageSigner(account)

  return useMemo<WidgetSigner>(
    () => ({
      address: txSigner.address,
      signAndSendTransactions: txSigner.signAndSendTransactions,
      signMessages: async (messages) => {
        const signed = await msgSigner.modifyAndSignMessages(messages)
        return signed.map((m) => m.signatures)
      }
    }),
    [txSigner, msgSigner]
  )
}
