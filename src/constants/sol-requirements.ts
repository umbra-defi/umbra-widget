/**
 * Minimum PUBLIC SOL (lamports) each private flow needs to cover on-chain tx
 * fees. Mirrors mobile main's `private/constants/sol-requirements.ts`. Claim
 * is intentionally excluded (relayer-funded).
 */
export const MIN_PUBLIC_SOL_FOR_SHIELD = 13_000_000n
export const MIN_PUBLIC_SOL_FOR_UNSHIELD = 13_000_000n
export const MIN_PUBLIC_SOL_FOR_SEND = 20_000_000n
export const MIN_PUBLIC_SOL_FOR_REGISTER = 13_000_000n
