import type { WidgetMint } from '@/types'

/**
 * Default supported tokens, mirroring `PRIVATE_MODE_MINTS` from
 * `@umbra-privacy/client`. Host can override via the `mints` prop. Symbol /
 * decimals / icon are resolved at runtime from token metadata (Helius).
 */
export const DEFAULT_MINTS: WidgetMint[] = [
  { address: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v' },
  { address: 'PRVT6TB7uss3FrUd2D9xs2zqDBsa3GbMJMwCQsgmeta' },
  { address: 'So11111111111111111111111111111111111111112' },
  { address: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB' },
  { address: 'CASHx9KJUStyftLFWGvEVf59SGeG9sh5FfcnZMVPCASH' },
  { address: 'zinc155BS4mSPk8GXQj4R5hkVDQXcW253pTYq5SGyfi' }
]
