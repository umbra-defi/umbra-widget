import {
  createShieldingService,
  shieldingQueries
} from '@umbra-privacy/client/shielding'
import { getTokenProgramAddressFromChain } from '@umbra-privacy/client/send'
import { createSolanaService } from '@umbra-privacy/client/solana'
import { createTokenService, tokenQueries } from '@umbra-privacy/client/token'
import { createUtxoService, utxoQueries } from '@umbra-privacy/client/utxo'
import { address as toAddress, type Address } from '@solana/kit'
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
import { utxoZkOps, getRegistrationProver, getRelayer } from './platform'
import { legacyMasterSeedScheme } from './legacy-master-seed'
import {
  INDEXER_ENDPOINT,
  NULLIFIER_INDEXER_ENDPOINT
} from '@/constants/endpoints'

/** Bump to invalidate cached seed/registration entries under a new scheme. */
const STORAGE_VERSION = 'widget-v1'

// No-op concurrent-op tracker the shielding factory expects.
const ops = { startOp() {}, endOp() {} }

export interface BuildServicesDeps {
  runtimeDeps: RuntimeDepsHandle
  signerResolver: SignerResolver
  secureStorage: SecureKeyValueStore
  storageBackend: StorageBackend
  /** Supported mint addresses — drives the token-metadata batch fetch. */
  mintAddresses: string[]
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
    mintAddresses
  } = deps

  const sdkService = createSdkService({
    ctx,
    getRegistrationProver,
    secureStorage,
    indexerEndpoint: INDEXER_ENDPOINT,
    storageVersion: STORAGE_VERSION,
    storageBackend,
    legacyMasterSeedSchemes: [legacyMasterSeedScheme]
  })

  const shielding = shieldingQueries(createShieldingService({ ctx }), {
    getSigner: signerResolver,
    ops
  })

  const solanaService = createSolanaService(ctx)

  const utxoService = createUtxoService({
    getClient: ctx.getClient,
    zkOps: utxoZkOps,
    relayer: getRelayer(),
    sdk: { isReceiverRegistered, decodeSolanaErrorMessage },
    nullifierIndexerEndpoint: NULLIFIER_INDEXER_ENDPOINT
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
    getSolanaService: () => solanaService,
    getClient: ctx.getClient,
    solana: {
      getTokenProgramAddress: (mint: Address) =>
        getTokenProgramAddressFromChain(ctx, mint)
    },
    privateModeMints: mintAddresses.map((a) => toAddress(a))
  })
  const token = tokenQueries(tokenService)

  return { sdkService, shielding, utxo, token }
}

export { isReceiverRegistered, isRegisteredOnChain }
