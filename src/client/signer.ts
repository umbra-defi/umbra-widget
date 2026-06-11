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
  // kit's TransactionPartialSigner: returns SIGNATURE DICTIONARIES, not signed
  // transactions. The signed tx is the original + these signatures merged in.
  signTransactions?: (
    txs: readonly Transaction[]
  ) => Promise<readonly SignatureDictionary[]>
  signAndSendTransactions?: (
    txs: readonly Transaction[]
  ) => Promise<Uint8Array[]>
}

/** Partial-sign a tx with a kit signer → a signed Transaction (keeps
 *  `messageBytes`, merges signatures). */
async function partialSign(
  s: SignOnly,
  transaction: Transaction
): Promise<Transaction> {
  if (!s.signTransactions) throw new Error('signer cannot sign transactions')
  const [sigs] = await s.signTransactions([transaction])
  return {
    ...transaction,
    signatures: { ...transaction.signatures, ...sigs }
  } as Transaction
}

/**
 * Adapt a `@solana/kit` signer to the client's `WalletSigner` port.
 *
 * Sending: a wallet-standard signer exposes `signAndSendTransactions` (it owns
 * the RPC). A bare keypair signer does NOT — it can only sign — so we sign with
 * `signTransactions` and submit through the widget's own `rpc`. This is why the
 * adapter needs an `rpc`.
 */
export function makeWalletSigner(
  signer: WidgetSigner,
  rpc: Rpc<SolanaRpcApi>
): WalletSigner {
  const s = signer as unknown as SignOnly

  return {
    signMessage: async (message) => {
      const [dict] = await signer.signMessages([
        { content: message, signatures: {} } as never
      ])
      const sig = (dict as Record<string, Uint8Array>)[signer.address]
      if (!sig) throw new Error('signer returned no signature for its address')
      return b58.decode(sig)
    },
    signTransaction: (transaction) => partialSign(s, transaction),
    signAndSendTransaction: async (transaction) => {
      // Wallet signer that can send itself.
      if (typeof s.signAndSendTransactions === 'function') {
        const [sig] = await s.signAndSendTransactions([transaction])
        return b58.decode(sig)
      }
      // Sign-only signer (e.g. a keypair): sign, then submit via the RPC.
      const signed = await partialSign(s, transaction)
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
