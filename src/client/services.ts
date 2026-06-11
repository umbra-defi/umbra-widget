import {
  createShieldingService,
  shieldingQueries
} from '@umbra-privacy/client/shielding'
import { getTokenProgramAddressFromChain } from '@umbra-privacy/client/send'
import { createSolanaService } from '@umbra-privacy/client/solana'
import { createTokenService, tokenQueries } from '@umbra-privacy/client/token'
import {
  createUtxoService,
  utxoQueries,
  type ClaimSyncStore
} from '@umbra-privacy/client/utxo'
import {
  address as toAddress,
  createSolanaRpc,
  type Address,
  type Rpc,
  type SolanaRpcApi
} from '@solana/kit'
import {
  createSdkService,
  isReceiverRegistered,
  decodeSolanaErrorMessage,
  isRegisteredOnChain
} from '@umbra-privacy/client/sdk'
import type { SecureKeyValueStore } from '@umbra-privacy/client/ports'
import type { RuntimeDepsHandle } from './runtime-deps'
import type { SignerResolver } from './signer'
import type { StorageBackend } from './storage'
import { createPlatform } from './platform'
import { legacyMasterSeedScheme } from './legacy-master-seed'
import type { ResolvedEndpoints } from '@/constants/endpoints'

/** Bump to invalidate cached seed/registration entries under a new scheme. */
const STORAGE_VERSION = 'widget-v1'

// No-op concurrent-op tracker the shielding factory expects.
const ops = { startOp() {}, endOp() {} }

export interface BuildServicesDeps {
  runtimeDeps: RuntimeDepsHandle
  signerResolver: SignerResolver
  secureStorage: SecureKeyValueStore
  storageBackend: StorageBackend
  /** Persistent claim-status/cursor cache for the utxo scan. */
  claimSyncStore: ClaimSyncStore
  /** Supported mint addresses — drives the token-metadata batch fetch. */
  mintAddresses: string[]
  /** Resolved service endpoints. */
  endpoints: ResolvedEndpoints
}

export type WidgetServices = ReturnType<typeof buildServices>

/**
 * Assemble every `@umbra-privacy/client` service + query factory for one widget
 * instance. Mirrors mobile's per-feature `core.ts` wiring, collapsed into one
 * place since the widget has a single account context.
 */
export function buildServices(deps: BuildServicesDeps) {
  const {
    runtimeDeps: ctx,
    signerResolver,
    secureStorage,
    storageBackend,
    claimSyncStore,
    mintAddresses,
    endpoints
  } = deps

  const platform = createPlatform(endpoints)

  const sdkService = createSdkService({
    ctx,
    getRegistrationProver: platform.getRegistrationProver,
    secureStorage,
    indexerEndpoint: endpoints.indexer,
    storageVersion: STORAGE_VERSION,
    storageBackend,
    legacyMasterSeedSchemes: [legacyMasterSeedScheme],
    // Sign current + legacy scheme messages once at client init (get-started)
    // and cache both seeds — otherwise the legacy seed is derived lazily on the
    // first UTXO scan, re-prompting a signature when the Receive tab opens.
    signSchemeMessages: 'eager'
  })

  const shielding = shieldingQueries(createShieldingService({ ctx }), {
    getSigner: signerResolver,
    ops
  })

  // Token metadata uses the DAS method `getAssetBatch`, which only Helius-class
  // RPCs implement — so it runs against `endpoints.das` (Helius), NOT the
  // possibly-non-DAS `rpcUrl`. A second solana service pointed at the DAS
  // endpoint; everything else stays on the tx `rpcUrl` via `ctx`.
  const dasRpc = createSolanaRpc(endpoints.das) as Rpc<SolanaRpcApi>
  const dasSolanaService = createSolanaService({
    ...ctx,
    getRpc: () => dasRpc,
    getRpcUrl: () => endpoints.das
  })

  const utxoService = createUtxoService({
    getClient: ctx.getClient,
    zkOps: platform.utxoZkOps,
    relayer: platform.relayer,
    sdk: { isReceiverRegistered, decodeSolanaErrorMessage },
    nullifierIndexerEndpoint: endpoints.nullifierIndexer,
    // Persistent claim-status/cursor cache so claimed-detection doesn't
    // re-derive hashes + refetch burnt nullifiers from 0 each scan.
    claimSyncStore
    // aesDecryptor omitted — SDK falls back to WebCrypto. Wire the AES worker
    // here (cast to AesDecryptorFunction) to move bulk decrypt off-thread.
  })

  const utxo = utxoQueries(utxoService, {
    getWalletAddress: ctx.getCurrentAddress,
    isPrivateMode: () => true,
    areKeysReady: () => ctx.getClient() != null,
    getRpc: ctx.getRpc,
    getClient: ctx.getClient
  })

  // Token metadata (image / name / ticker / decimals) via Helius getAssetBatch.
  const tokenService = createTokenService({
    getSolanaService: () => dasSolanaService,
    getClient: ctx.getClient,
    solana: {
      getTokenProgramAddress: (mint: Address) =>
        getTokenProgramAddressFromChain(ctx, mint)
    },
    privateModeMints: mintAddresses.map((a) => toAddress(a))
  })
  const token = tokenQueries(tokenService)

  return {
    sdkService,
    shielding,
    utxo,
    token,
    /** ZK registration prover (also used by key-consistency restore). */
    getRegistrationProver: platform.getRegistrationProver
  }
}

export { isReceiverRegistered, isRegisteredOnChain }
