/// <reference lib="webworker" />
import * as snarkjs from 'snarkjs'

export interface ZkProofWorkerRequest {
  id: number
  inputs: unknown
  wasmUrl: string
  zkeyUrl: string
}

export interface ZkProofWorkerResponse {
  id: number
  proof?: { pi_a: string[]; pi_b: string[][]; pi_c: string[] }
  publicSignals?: string[]
  error?: string
}

const ZK_CACHE_NAME = 'umbra-zk-assets'

// Cache API first (warmed by the SDK's zk-asset store), then network, then hand
// the bare URL to snarkjs as a last resort.
async function resolveFile(url: string): Promise<string | Uint8Array> {
  try {
    const cache = await caches.open(ZK_CACHE_NAME)
    const cached = await cache.match(url)
    if (cached?.ok) return new Uint8Array(await cached.arrayBuffer())
    const res = await fetch(url, { signal: AbortSignal.timeout(5 * 60 * 1000) })
    if (res.ok) {
      await cache.put(url, res.clone())
      return new Uint8Array(await res.arrayBuffer())
    }
  } catch {
    /* fall through */
  }
  return url
}

self.onmessage = async (e: MessageEvent<ZkProofWorkerRequest>) => {
  const { id, inputs, wasmUrl, zkeyUrl } = e.data
  try {
    const [wasm, zkey] = await Promise.all([
      resolveFile(wasmUrl),
      resolveFile(zkeyUrl)
    ])
    const { proof, publicSignals } = await snarkjs.groth16.fullProve(
      inputs,
      wasm,
      zkey,
      undefined,
      undefined,
      { singleThread: true }
    )
    ;(self as unknown as Worker).postMessage({
      id,
      proof,
      publicSignals
    } satisfies ZkProofWorkerResponse)
  } catch (err) {
    ;(self as unknown as Worker).postMessage({
      id,
      error: err instanceof Error ? err.message : 'ZK proof generation failed'
    } satisfies ZkProofWorkerResponse)
  }
}
