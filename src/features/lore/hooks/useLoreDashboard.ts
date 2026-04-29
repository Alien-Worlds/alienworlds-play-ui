import { useCallback, useMemo, useState } from 'react'

import { LoreProposal } from 'graphql/types'
import { useAppState } from 'store'

import { useLoreData } from '../data/LoreDataProvider'
import { sortLores } from '../utils/utils'

type UseLoreDashboardResult = {
  isLoading: boolean
  sortedLores: LoreProposal[]
  selectedLore: LoreProposal | null
  selectedProposalId: number | null
  handleSelectLore: (proposalId: number) => void
  clearSelection: () => void
}

export function useLoreDashboard(): UseLoreDashboardResult {
  const { proposals, loadingLores } = useLoreData()
  const {
    wax: { loreFilter },
  } = useAppState()
  const [selectedProposalId, setSelectedProposalId] = useState<number | null>(null)

  const sortedLores = useMemo(
    () =>
      sortLores({
        lores: proposals,
        sortBy: loreFilter.sortBy,
        reversed: loreFilter.reversed,
      }),
    [proposals, loreFilter]
  )

  const selectedLore = useMemo(
    () => sortedLores.find((lore) => lore.proposal_id === selectedProposalId) ?? null,
    [selectedProposalId, sortedLores]
  )

  const handleSelectLore = useCallback((proposalId: number) => {
    setSelectedProposalId(proposalId)
  }, [])

  const clearSelection = useCallback(() => {
    setSelectedProposalId(null)
  }, [])

  return {
    isLoading: loadingLores,
    sortedLores,
    selectedLore,
    selectedProposalId,
    handleSelectLore,
    clearSelection,
  }
}
