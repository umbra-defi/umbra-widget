import type {
  Address,
  MessagePartialSigner,
  TransactionSendingSigner
} from '@solana/kit'

/**
 * The wallet the widget signs with. A `@solana/kit` signer that can both sign
 * messages (needed once, to derive the Umbra master seed) and sign+send
 * transactions (every shield / transfer / unshield / claim).
 *
 * Any kit signer that satisfies both interfaces works — KeyPairSigner from a
 * loaded keypair, a wallet-standard adapter, etc.
 */
export type WidgetSigner = TransactionSendingSigner & MessagePartialSigner

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
  /** Persistence backend. Defaults to `localStorage`. */
  storage?: WidgetStorage

  /** Controlled open state. Omit for an always-mounted inline render. */
  open?: boolean
  onOpenChange?: (open: boolean) => void
  /** Optional trigger element. When provided, the widget renders as a modal. */
  trigger?: React.ReactNode

  /** Override the resolved current wallet address (defaults to signer.address). */
  walletAddress?: Address | string
}
