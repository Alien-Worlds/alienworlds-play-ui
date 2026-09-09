import { create } from 'zustand'

interface LoreStore {
  selectedProposalId: number | null
  selectProposal: (proposalId: number) => void
  clearSelection: () => void
  stakedInput: number
  setStakedInput: (amount: number) => void
}

export const useLoreStore = create<LoreStore>((set) => ({
  selectedProposalId: null,
  selectProposal: (proposalId) => set({ selectedProposalId: proposalId }),
  clearSelection: () => set({ selectedProposalId: null }),
  stakedInput: 0,
  setStakedInput: (amount) => set({ stakedInput: Number.isNaN(amount) ? 0 : amount }),
}))
