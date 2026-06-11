import type { WidgetEndpoints } from '@/types'

/**
 * Fully-resolved endpoint set the services consume. Build-time env vars provide
 * the defaults; the `endpoints` prop overrides per-instance at runtime.
 */
export interface ResolvedEndpoints {
  indexer: string
  nullifierIndexer: string
  relayer: string
  zkCdnUrl: string
  zkManifestUrl: string
}

const env =
  (import.meta as { env?: Record<string, string | undefined> }).env ?? {}

const ZK_CDN = env.VITE_ZK_CDN_URL ?? 'https://zk.api.umbraprivacy.com'

export const DEFAULT_ENDPOINTS: ResolvedEndpoints = {
  indexer: env.VITE_INDEXER_URL ?? 'https://utxo-indexer.api.umbraprivacy.com',
  nullifierIndexer:
    env.VITE_NULLIFIER_INDEXER_URL ??
    'https://nullifier-indexer.api.umbraprivacy.com',
  relayer: env.VITE_UMBRA_RELAYER_URL ?? 'https://relayer.api.umbraprivacy.com',
  zkCdnUrl: ZK_CDN,
  zkManifestUrl: `${ZK_CDN}/v5/manifest.json`
}

/** Merge the `endpoints` prop over the defaults. */
export function resolveEndpoints(e?: WidgetEndpoints): ResolvedEndpoints {
  const zkCdnUrl = e?.zkCdnUrl ?? DEFAULT_ENDPOINTS.zkCdnUrl
  return {
    indexer: e?.indexer ?? DEFAULT_ENDPOINTS.indexer,
    nullifierIndexer: e?.nullifierIndexer ?? DEFAULT_ENDPOINTS.nullifierIndexer,
    relayer: e?.relayer ?? DEFAULT_ENDPOINTS.relayer,
    zkCdnUrl,
    zkManifestUrl: e?.zkManifestUrl ?? `${zkCdnUrl}/v5/manifest.json`
  }
}
