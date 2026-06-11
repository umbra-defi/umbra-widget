import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  claimableResultToUtxos,
  type ClaimUtxoResult,
  type Utxo
} from '@umbra-privacy/client/utxo'
import { useWidgetContext } from '@/providers/widget-context'

const TREE_INDEX = 0n

const SELF_BURNABLE: ReadonlySet<string> = new Set([
  'eta-into-self-burnable',
  'ata-into-self-burnable'
])

const POLL_ATTEMPTS = 2
const POLL_INTERVAL_MS = 2000
const delay = (ms: number) => new Promise((r) => setTimeout(r, ms))

/**
 * Private send. NOT a public SPL transfer (`@umbra-privacy/client/send`) — it
 * creates a stealth-pool UTXO addressed to the recipient via the utxo factory,
 * the same path mobile's private send uses. Returns `{ success, error?, utxoType }`.
 *
 * When the result is **self-claimable** (`utxoType: 'ephemeral'` — receiver
 * unregistered or a self-send), the note is only spendable by the sender after
 * claiming, so we claim it immediately (in the background) once it's indexed.
 */
export function usePrivateSend() {
  const { services, walletAddress } = useWidgetContext()
  const queryClient = useQueryClient()
  const base = services.utxo.createUtxoMutation(walletAddress)

  const claimFn = services.utxo.claimBatchMutation().mutationFn as (
    utxos: Utxo[]
  ) => Promise<ClaimUtxoResult[]>
  const scanOptions = services.utxo.unclaimedUtxos(TREE_INDEX)

  // Claim the self-burnable note created by THIS send: match on mint +
  // destination, and pick the most recent (the one we just created).
  const claimSelfBurnable = async (mint: string, destination: string) => {
    for (let attempt = 0; attempt < POLL_ATTEMPTS; attempt++) {
      await queryClient.invalidateQueries({ queryKey: scanOptions.queryKey })
      const data = await queryClient.fetchQuery(scanOptions)
      const latest = claimableResultToUtxos(TREE_INDEX, data)
        .filter(
          (u) =>
            SELF_BURNABLE.has(u.type) &&
            String(u.mintAddress) === mint &&
            String(u.destinationAddress) === destination
        )
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())[0]
      if (latest) {
        await claimFn([latest])
        await queryClient.invalidateQueries({ queryKey: scanOptions.queryKey })
        return
      }
      if (attempt < POLL_ATTEMPTS - 1) await delay(POLL_INTERVAL_MS)
    }
  }

  return useMutation({
    ...base,
    onSuccess: (result, variables) => {
      const utxoType = (result as { utxoType?: string })?.utxoType
      if (result?.success && utxoType === 'ephemeral') {
        const mint = String(variables.mint)
        const destination = String(variables.receiver ?? walletAddress)
        // Background — don't block the send's settled state on the claim.
        void claimSelfBurnable(mint, destination).catch((err) =>
          console.warn('[transfer] self-claim after send failed', err)
        )
      }
    }
  })
}
