import {
  createCreateUtxoWithEphemeralUnlockerZkProver,
  createCreateUtxoWithReceiverUnlockerZkProver,
  createClaimEphemeralZkProver,
  createClaimReceiverZkProver
} from '@umbra-privacy/client/zk'
import { getUmbraRelayer } from '@umbra-privacy/client/sdk'
import {
  createSnarkjsZkProver,
  createZkAssetStore
} from '@umbra-privacy/client-platform/web'
import { proveInWorker } from '@/workers/zk-proof-worker-client'

export interface PlatformEndpoints {
  relayer: string
  zkCdnUrl: string
  zkManifestUrl: string
}

/**
 * Per-widget platform wiring built from the resolved endpoints: the
 * worker-backed ZK prover + asset store, the bound utxo prover factories, the
 * registration prover, and the relayer. Endpoint-driven so hosts can point at
 * any deployment.
 */
export function createPlatform(endpoints: PlatformEndpoints) {
  const zkProver = createSnarkjsZkProver({ proveFn: proveInWorker })
  const zkAssets = createZkAssetStore({
    cdnBaseUrl: endpoints.zkCdnUrl,
    manifestUrl: endpoints.zkManifestUrl
  })
  const zkDeps = { zkProver, zkAssets }

  const utxoZkOps = {
    createCreateUtxoEphemeralProver: () =>
      createCreateUtxoWithEphemeralUnlockerZkProver(zkDeps),
    createCreateUtxoReceiverProver: () =>
      createCreateUtxoWithReceiverUnlockerZkProver(zkDeps),
    createClaimEphemeralProver: () => createClaimEphemeralZkProver(zkDeps),
    createClaimReceiverProver: () => createClaimReceiverZkProver(zkDeps)
  }

  const getRegistrationProver = async () => {
    const { createUserRegistrationProver } =
      await import('@umbra-privacy/client/zk')
    return createUserRegistrationProver(zkDeps)
  }

  const relayer = getUmbraRelayer({ apiEndpoint: endpoints.relayer })

  return { utxoZkOps, getRegistrationProver, relayer }
}
