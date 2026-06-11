import { useState } from 'react'
import type { Utxo } from '@umbra-privacy/client/utxo'
import { useWidgetContext } from '@/providers/widget-context'
import { useMintMetadataMap } from '@/features/token/hooks/use-tokens'
import { useClaimAll, useClaimUtxo, useClaimableUtxos } from '../query'

/** Orchestrator for the Receive (vault) tab. */
export function useReceive() {
  const { walletAddress } = useWidgetContext()
  const { utxos, isLoading, isFetching, refetch } = useClaimableUtxos()
  const { metadataMap } = useMintMetadataMap()
  const claimAllM = useClaimAll()
  const claimOneM = useClaimUtxo()

  // Claims run concurrently, so track in-flight ids ourselves — the single
  // mutation instance only exposes the latest call's state.
  const [claimingIds, setClaimingIds] = useState<Set<string>>(new Set())

  const claimOne = (utxo: Utxo) => {
    setClaimingIds((s) => new Set(s).add(utxo.id))
    claimOneM
      .mutateAsync(utxo)
      .then(() => refetch())
      .catch(() => {})
      .finally(() =>
        setClaimingIds((s) => {
          const next = new Set(s)
          next.delete(utxo.id)
          return next
        })
      )
  }

  return {
    address: walletAddress,
    utxos,
    metadataMap,
    isLoading,
    isFetching,
    refetch,
    claimAll: () => claimAllM.mutate(utxos, { onSuccess: () => refetch() }),
    claimAllStatus: claimAllM.status,
    claimOne,
    /** ids of UTXOs currently being claimed individually. */
    claimingIds,
    claimError: claimAllM.error ?? claimOneM.error
  }
}
