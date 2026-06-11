import type {
  Address,
  MessagePartialSigner,
  TransactionModifyingSigner,
  TransactionPartialSigner,
  TransactionSendingSigner
} from '@solana/kit'

/**
 * The wallet the widget signs with. A `@solana/kit` signer that:
 *
 * 1. signs **messages** (`MessagePartialSigner` — needed once, to derive the
 *    Umbra master seed), and
 * 2. can **sign a transaction and return it** — either a `TransactionPartialSigner`
 *    (`signTransactions`, e.g. a KeyPairSigner) or a `TransactionModifyingSigner`
 *    (`modifyAndSignTransactions`, the wallet-standard `solana:signTransaction`
 *    adapter, `useWalletAccountTransactionSigner`).
 *
 * The Umbra deposit/withdraw pipeline must obtain the **signed transaction
 * bytes** (it submits them through its own relayer/MPC flow), so a
 * sign-**and-send** wallet (`TransactionSendingSigner`, which broadcasts and only
 * returns a signature) is NOT sufficient on its own — it can't hand back a
 * signed-but-unsent transaction. `signAndSendTransactions` is accepted as an
 * optional extra (used as a fast path when present).
 */
export type WidgetSigner = MessagePartialSigner &
  (TransactionModifyingSigner | TransactionPartialSigner) &
  Partial<TransactionSendingSigner>

/** A token the widget is allowed to operate on. */
export interface WidgetMint {
  /** Base58 mint address. */
  address: string
  /** Optional overrides — symbol/decimals/icon are normally resolved from
   * token metadata (Helius). Provide them only to override the on-chain data. */
  symbol?: string
  decimals?: number
  iconUrl?: string
}

/** Which flows to surface as tabs, in order. */
export type WidgetTab =
  | 'home'
  | 'shield'
  | 'transfer'
  | 'unshield'
  | 'receive'

/**
 * Theme. Every field maps to a CSS custom property scoped to the widget root,
 * so the host overrides look-and-feel at runtime without rebuilding.
 * Partial — unset fields fall back to the built-in defaults.
 */
export interface WidgetUiConfig {
  colors?: {
    bg?: string
    surface?: string
    surfaceAlt?: string
    border?: string
    text?: string
    textSecondary?: string
    textTertiary?: string
    primary?: string
    primaryFg?: string
    danger?: string
    success?: string
    /** Active tab pill background. */
    tabActive?: string
  }
  font?: {
    primary?: string
    secondary?: string
  }
  /** Corner rounding. A single value sets all three; granular overrides allowed. */
  rounding?:
    | string
    | {
        sm?: string
        md?: string
        lg?: string
      }
}

/**
 * Persistence backend — an IndexedDB-backed key/value store. The widget routes
 * the SDK's secure seed/registration store and its sharded utxo/nullifier
 * backend through this, auto-prefixing keys per subsystem so they never
 * collide. Sync returns (e.g. `localStorage`) are accepted. Defaults to a
 * `localStorage` shim for development.
 */
export interface WidgetStorage {
  getItem(key: string): string | null | Promise<string | null>
  setItem(key: string, value: string): void | Promise<void>
  removeItem(key: string): void | Promise<void>
}

/** Network the widget talks to. Derived from `rpcUrl` if omitted. */
export type WidgetNetwork = 'mainnet' | 'devnet'

/**
 * Service endpoints. Each is optional and falls back to the Umbra production
 * default. Override to point at a different deployment — or, notably, to proxy
 * the nullifier indexer through your own origin (it lacks CORS for browsers).
 */
export interface WidgetEndpoints {
  /** UTXO indexer (SDK `indexerApiEndpoint`). */
  indexer?: string
  /** Burnt-nullifier indexer (claimed-UTXO detection). */
  nullifierIndexer?: string
  /** Gasless relayer. */
  relayer?: string
  /** ZK assets CDN base (no trailing slash). */
  zkCdnUrl?: string
  /** ZK manifest URL. Defaults to `${zkCdnUrl}/v5/manifest.json`. */
  zkManifestUrl?: string
}

/** Props for the single exported `<UmbraWidget />` component. */
export interface UmbraWidgetProps {
  /** Wallet signer (see {@link WidgetSigner}). */
  signer: WidgetSigner
  /** Solana RPC HTTP endpoint. WS endpoint is derived (https→wss). */
  rpcUrl: string
  network?: WidgetNetwork
  /** Theme overrides. */
  ui?: WidgetUiConfig
  /** Supported tokens. Defaults to {@link DEFAULT_MINTS}. */
  mints?: WidgetMint[]
  /** Tabs to render, in order. Defaults to all four. */
  tabs?: WidgetTab[]
  /** Persistence backend. Defaults to IndexedDB. */
  storage?: WidgetStorage
  /** Service endpoints. Each falls back to the Umbra production default. */
  endpoints?: WidgetEndpoints

  /** Controlled open state. Omit for an always-mounted inline render. */
  open?: boolean
  onOpenChange?: (open: boolean) => void
  /** Optional trigger element. When provided, the widget renders as a modal. */
  trigger?: React.ReactNode

  /** Override the resolved current wallet address (defaults to signer.address). */
  walletAddress?: Address | string
}
