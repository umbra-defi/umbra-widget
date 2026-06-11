/**
 * Service endpoints. Defaults target Umbra production; override at build time
 * via Vite env vars when embedding against a different deployment.
 */
const env =
  (import.meta as { env?: Record<string, string | undefined> }).env ?? {}

export const RELAYER_ENDPOINT =
  env.VITE_UMBRA_RELAYER_URL ?? 'https://relayer.api.umbraprivacy.com'

export const NULLIFIER_INDEXER_ENDPOINT =
  env.VITE_NULLIFIER_INDEXER_URL ??
  'https://nullifier-indexer.api.umbraprivacy.com'

export const INDEXER_ENDPOINT =
  env.VITE_INDEXER_URL ?? 'https://utxo-indexer.api.umbraprivacy.com'

export const ZK_CDN_BASE_URL =
  env.VITE_ZK_CDN_URL ?? 'https://zk.api.umbraprivacy.com'
export const ZK_CDN_MANIFEST_URL = `${ZK_CDN_BASE_URL}/v5/manifest.json`
