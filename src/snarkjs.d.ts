// snarkjs ships no type declarations. Declare the one surface the proof worker
// uses rather than suppressing the import.
declare module 'snarkjs' {
  export const groth16: {
    fullProve(
      inputs: unknown,
      wasm: string | Uint8Array,
      zkey: string | Uint8Array,
      logger?: unknown,
      ctx?: unknown,
      options?: { singleThread?: boolean }
    ): Promise<{
      proof: { pi_a: string[]; pi_b: string[][]; pi_c: string[] }
      publicSignals: string[]
    }>
  }
}
