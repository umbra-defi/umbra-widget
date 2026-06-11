import { createWorkerRpc } from '@umbra-privacy/client-platform/web'
import type {
  ZkProofWorkerRequest,
  ZkProofWorkerResponse
} from './zk-proof-worker'

type RawProof = NonNullable<ZkProofWorkerResponse['proof']>

const rpc = createWorkerRpc<
  Omit<ZkProofWorkerRequest, 'id'>,
  ZkProofWorkerResponse
>(
  () =>
    new Worker(new URL('./zk-proof-worker.ts', import.meta.url), {
      type: 'module'
    })
)

/**
 * Off-thread groth16 proving, shaped as the `proveFn` that
 * `createSnarkjsZkProver` expects. Wired in client/platform.ts.
 */
export async function proveInWorker(
  inputs: unknown,
  wasmUrl: string,
  zkeyUrl: string
): Promise<{ proof: RawProof; publicSignals: string[] }> {
  const res = await rpc.call({ inputs, wasmUrl, zkeyUrl })
  if (!res.proof) throw new Error('ZK proof worker returned no proof')
  return { proof: res.proof, publicSignals: res.publicSignals ?? [] }
}
