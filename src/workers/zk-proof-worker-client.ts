import { createWorkerRpc } from '@umbra-privacy/client-platform/web'
// Inline the worker (base64 blob) rather than emitting a separate asset. A
// separate file is referenced via `new URL('…', import.meta.url)`, which a host
// bundler (webpack/Next) rewrites to a `file://` URL the browser refuses to load
// as a Worker cross-origin. Inlining makes the widget self-contained — works in
// any host with zero asset-serving config.
import ZkProofWorker from './zk-proof-worker?worker&inline'
import type {
  ZkProofWorkerRequest,
  ZkProofWorkerResponse
} from './zk-proof-worker'

type RawProof = NonNullable<ZkProofWorkerResponse['proof']>

const rpc = createWorkerRpc<
  Omit<ZkProofWorkerRequest, 'id'>,
  ZkProofWorkerResponse
>(() => new ZkProofWorker())

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
