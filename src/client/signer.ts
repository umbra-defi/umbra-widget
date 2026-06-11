import {
  getBase58Decoder,
  getBase64EncodedWireTransaction,
  type Rpc,
  type SolanaRpcApi,
  type Transaction
} from '@solana/kit'
import type { WalletSigner } from '@umbra-privacy/client/lib'
import type { WidgetSigner } from '@/types'

const b58 = getBase58Decoder()

type SignatureDictionary = Record<string, Uint8Array>

type SignOnly = {
  // kit TransactionModifyingSigner (wallet-standard `solana:signTransaction`):
  // returns a fully SIGNED transaction. This is the primary path for wallet
  // adapters — they sign and hand the tx back without broadcasting.
  modifyAndSignTransactions?: (
    txs: readonly Transaction[],
    config?: unknown
  ) => Promise<readonly Transaction[]>
  // kit TransactionPartialSigner (e.g. a KeyPairSigner): returns SIGNATURE
  // DICTIONARIES, not signed transactions. The signed tx is the original + these
  // signatures merged in.
  signTransactions?: (
    txs: readonly Transaction[]
  ) => Promise<readonly SignatureDictionary[]>
  signAndSendTransactions?: (
    txs: readonly Transaction[]
  ) => Promise<Uint8Array[]>
}

/** Sign a tx with a kit signer → a SIGNED Transaction (does NOT broadcast).
 *  The Umbra deposit/withdraw pipeline needs the signed bytes to submit itself,
 *  so this must return the signed transaction, not a tx signature. */
async function signTx(
  s: SignOnly,
  transaction: Transaction
): Promise<Transaction> {
  // Modifying signer → already-signed transaction.
  if (typeof s.modifyAndSignTransactions === 'function') {
    const [signed] = await s.modifyAndSignTransactions([transaction])
    if (!signed) throw new Error('signer returned no signed transaction')
    return signed as Transaction
  }
  // Partial signer → merge returned signature dict into the tx.
  if (typeof s.signTransactions === 'function') {
    const [sigs] = await s.signTransactions([transaction])
    return {
      ...transaction,
      signatures: { ...transaction.signatures, ...sigs }
    } as Transaction
  }
  throw new Error(
    'signer cannot sign transactions: needs a TransactionPartialSigner ' +
      '(signTransactions) or TransactionModifyingSigner (modifyAndSignTransactions). ' +
      'A send-only wallet (signAndSendTransactions) cannot return signed tx bytes.'
  )
}

/**
 * Adapt a `@solana/kit` signer to the client's `WalletSigner` port.
 *
 * `signTransaction` returns a SIGNED (not sent) tx — the Umbra pipeline submits
 * it itself. For sending: a wallet that owns the RPC exposes
 * `signAndSendTransactions` (fast path); otherwise we sign and submit through
 * the widget's own `rpc` (why the adapter needs it).
 */
export function makeWalletSigner(
  signer: WidgetSigner,
  rpc: Rpc<SolanaRpcApi>
): WalletSigner {
  const s = signer as unknown as SignOnly

  return {
    signMessage: async (message) => {
      console.log(
        '[uw signer] signMessage called — msg:',
        new TextDecoder().decode(message).slice(0, 120)
      )
      console.trace('[uw signer] signMessage caller')
      const [dict] = await signer.signMessages([
        { content: message, signatures: {} } as never
      ])
      const sig = (dict as Record<string, Uint8Array>)[signer.address]
      if (!sig) throw new Error('signer returned no signature for its address')
      return b58.decode(sig)
    },
    signTransaction: (transaction) => signTx(s, transaction),
    signAndSendTransaction: async (transaction) => {
      // Wallet that owns the RPC: let it sign + broadcast.
      if (typeof s.signAndSendTransactions === 'function') {
        const [sig] = await s.signAndSendTransactions([transaction])
        return b58.decode(sig)
      }
      // Otherwise sign, then submit via the widget's RPC.
      const signed = await signTx(s, transaction)
      const wire = getBase64EncodedWireTransaction(signed)
      return rpc.sendTransaction(wire, { encoding: 'base64' }).send()
    }
  }
}

/** Lazy resolver shape the shielding/send/wrap query factories expect. */
export interface ResolvedSigner {
  address: string
  signTransaction: (tx: Transaction) => Promise<Transaction>
  signAndSendTransaction: (tx: Transaction) => Promise<{ signature: string }>
}

export type SignerResolver = () => Promise<ResolvedSigner>

export function makeSignerResolver(
  signer: WidgetSigner,
  rpc: Rpc<SolanaRpcApi>
): SignerResolver {
  const wallet = makeWalletSigner(signer, rpc)
  return async () => ({
    address: signer.address,
    signTransaction: (tx) => wallet.signTransaction(tx),
    signAndSendTransaction: async (tx) => ({
      signature: await wallet.signAndSendTransaction(tx)
    })
  })
}
