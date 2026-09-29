import { AnyAction } from '@wharfkit/session'
import { useModalStore } from 'shared/store/modalStore'
import { useSessionStore } from 'shared/store/sessionStore'
import { toastErrorMessage, toastMessage } from 'shared/util/toast'
import { transact } from 'shared/wax/transact'
import { create } from 'zustand'

import { LoreFilter, LorePullRequest } from '../types/loreTypes'
import {
  fetchLorePullRequestCommitMessage,
  fetchLorePullRequests,
  fetchLoreReadMe,
} from '../utils/github'
import {
  buildClaimRewardActions,
  buildStakeActions,
  buildSubmitActions,
  buildUnstakeActions,
  buildVoteActions,
  LoreVoteInput,
  SubmitLoreInput,
} from '../utils/loreActions'

interface LoreStore {
  selectedProposalId: number | null
  selectProposal: (proposalId: number) => void
  clearSelection: () => void
  stakedInput: number
  setStakedInput: (amount: number) => void

  /** Dashboard table sort. */
  loreFilter: LoreFilter
  setLoreFilter: (loreFilter: LoreFilter) => void

  /** the-lore README as HTML, shown on the Lore tab. */
  loreReadMe: string | null
  loadLoreReadMe: () => Promise<void>
  /** Open PRs on the-lore repo, offered in `SubmitLoreModal`. */
  lorePullRequests: LorePullRequest[]
  loadLorePullRequests: () => Promise<void>
  /** Resolves the PR's first commit message, or `null` if it can't be loaded. */
  getLorePullRequestCommit: (pullNumber: number) => Promise<string | null>

  /** True while a lore.worlds transaction is being signed/broadcast. */
  isTransacting: boolean
  /** Transactions resolve `true` on success; failures are toasted and resolve `false`. */
  stakeLore: (amount: string) => Promise<boolean>
  unstakeLore: () => Promise<boolean>
  claimLoreReward: () => Promise<boolean>
  voteLore: (input: LoreVoteInput) => Promise<boolean>
  submitLore: (input: SubmitLoreInput) => Promise<boolean>
}

const closeAllModals = () => {
  useModalStore.getState().resetAllSecondaryModals()
  useModalStore.getState().resetAllPrimaryModals()
}

export const useLoreStore = create<LoreStore>((set) => {
  const runTransaction = async ({
    buildActions,
    successMessage,
    failureMessage,
    onSuccess,
  }: {
    buildActions: (walletId: string) => AnyAction[]
    successMessage: string
    failureMessage: string
    onSuccess?: () => void
  }) => {
    const walletId = useSessionStore.getState().walletId
    if (!walletId) return false

    set({ isTransacting: true })
    try {
      await transact(buildActions(walletId))
      onSuccess?.()
      toastMessage(successMessage)
      return true
    } catch (error) {
      toastErrorMessage(error?.message || error?.toString() || failureMessage)
      console.error(error)
      return false
    } finally {
      set({ isTransacting: false })
    }
  }

  return {
    selectedProposalId: null,
    selectProposal: (proposalId) => set({ selectedProposalId: proposalId }),
    clearSelection: () => set({ selectedProposalId: null }),
    stakedInput: 0,
    setStakedInput: (amount) => set({ stakedInput: Number.isNaN(amount) ? 0 : amount }),

    loreFilter: { sortBy: null, reversed: true },
    setLoreFilter: (loreFilter) => set({ loreFilter }),

    loreReadMe: null,
    loadLoreReadMe: async () => {
      try {
        set({ loreReadMe: await fetchLoreReadMe() })
      } catch (error) {
        console.error(error)
      }
    },

    lorePullRequests: [],
    loadLorePullRequests: async () => {
      try {
        set({ lorePullRequests: await fetchLorePullRequests() })
      } catch (error) {
        toastErrorMessage(error?.message ?? 'Loading lore pull requests failed.')
        console.error(error)
      }
    },

    getLorePullRequestCommit: async (pullNumber) => {
      try {
        return await fetchLorePullRequestCommitMessage(pullNumber)
      } catch (error) {
        toastErrorMessage(error?.message ?? 'Loading the pull request description failed.')
        console.error(error)
        return null
      }
    },

    isTransacting: false,

    stakeLore: (amount) =>
      runTransaction({
        buildActions: (walletId) => buildStakeActions(walletId, amount),
        successMessage: 'Staking TLM successfully.',
        failureMessage: 'Staking TLM failed.',
      }),

    unstakeLore: () =>
      runTransaction({
        buildActions: buildUnstakeActions,
        successMessage: 'Unstaked Successfully',
        failureMessage: 'Unstaking TLM failed.',
        onSuccess: closeAllModals,
      }),

    claimLoreReward: () =>
      runTransaction({
        buildActions: buildClaimRewardActions,
        successMessage: 'TLM Reward claimed successfully.',
        failureMessage: 'Claim TLM Reward failed.',
      }),

    voteLore: (input) =>
      runTransaction({
        buildActions: (walletId) => buildVoteActions(walletId, input),
        successMessage: 'Lore Vote Successful.',
        failureMessage: 'Lore vote failed.',
      }),

    submitLore: (input) =>
      runTransaction({
        buildActions: (walletId) => buildSubmitActions(walletId, input),
        successMessage: 'Lore Proposal Submitted.',
        failureMessage: 'Submitting the lore proposal failed.',
        onSuccess: closeAllModals,
      }),
  }
})
