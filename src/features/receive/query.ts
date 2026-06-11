import { useMutation, useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { claimableResultToUtxos, type Utxo } from '@umbra-privacy/client/utxo'
import { useWidgetContext } from '@/providers/widget-context'

const TREE_INDEX = 0n

export function useClaimableUtxos(): {
  utxos: Utxo[]
  isLoading: boolean
  isFetching: boolean
  refetch: () => void
} {
  const { services } = useWidgetContext()
  const scan = useQuery(services.utxo.unclaimedUtxos(TREE_INDEX))
  const utxos = useMemo(() => {
    if (!scan.data) return []
    return claimableResultToUtxos(TREE_INDEX, scan.data).sort(
      (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
    )
  }, [scan.data])
  return {
    utxos,
    isLoading: scan.isLoading,
    isFetching: scan.isFetching,
    refetch: () => {
      void scan.refetch()
    }
  }
}

/** Claim every pending UTXO in one batch. */
export function useClaimAll() {
  const { services } = useWidgetContext()
  return useMutation(services.utxo.claimBatchMutation())
}

/** Claim a single UTXO. `variables` holds the in-flight UTXO (for per-row state). */
export function useClaimUtxo() {
  const { services } = useWidgetContext()
  return useMutation(services.utxo.claimSingleMutation())
}
