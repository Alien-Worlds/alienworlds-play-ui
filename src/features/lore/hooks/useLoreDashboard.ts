import { useCallback, useMemo } from 'react'

import { LoreProposal } from 'graphql/types'
import { useAppState } from 'store'

import { useLoreData } from '../data/LoreDataProvider'
import { useLoreStore } from '../store/loreStore'
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
  const selectedProposalId = useLoreStore((state) => state.selectedProposalId)
  const selectProposal = useLoreStore((state) => state.selectProposal)
  const clearSelectionInStore = useLoreStore((state) => state.clearSelection)

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

  const handleSelectLore = useCallback(
    (proposalId: number) => {
      selectProposal(proposalId)
    },
    [selectProposal]
  )

  const clearSelection = useCallback(() => {
    clearSelectionInStore()
  }, [clearSelectionInStore])

  return {
    isLoading: loadingLores,
    sortedLores,
    selectedLore,
    selectedProposalId,
    handleSelectLore,
    clearSelection,
  }
}
