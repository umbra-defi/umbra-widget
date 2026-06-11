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
import {
  RELAYER_ENDPOINT,
  ZK_CDN_BASE_URL,
  ZK_CDN_MANIFEST_URL
} from '@/constants/endpoints'

const zkProver = createSnarkjsZkProver({ proveFn: proveInWorker })
const zkAssets = createZkAssetStore({
  cdnBaseUrl: ZK_CDN_BASE_URL,
  manifestUrl: ZK_CDN_MANIFEST_URL
})

const zkDeps = { zkProver, zkAssets }

export const utxoZkOps = {
  createCreateUtxoEphemeralProver: () =>
    createCreateUtxoWithEphemeralUnlockerZkProver(zkDeps),
  createCreateUtxoReceiverProver: () =>
    createCreateUtxoWithReceiverUnlockerZkProver(zkDeps),
  createClaimEphemeralProver: () => createClaimEphemeralZkProver(zkDeps),
  createClaimReceiverProver: () => createClaimReceiverZkProver(zkDeps)
}

export const getRegistrationProver = async () => {
  const { createUserRegistrationProver } =
    await import('@umbra-privacy/client/zk')
  return createUserRegistrationProver(zkDeps)
}

let relayer: ReturnType<typeof getUmbraRelayer> | null = null
export function getRelayer() {
  if (!relayer) {
    relayer = getUmbraRelayer({ apiEndpoint: RELAYER_ENDPOINT })
  }
  return relayer
}
