import { useSessionStore } from 'shared/store/sessionStore'
import { Constants } from 'shared/util/constants'
import { toastErrorMessage, toastMessage } from 'shared/util/toast'
import { transact } from 'shared/wax/transact'
import { create } from 'zustand'

interface CompetitionsStore {
  isClaimingReward: boolean
  /** Claims a tournament's rewards for the current wallet. Resolves `true` on success. */
  claimTournamentReward: (compId: number) => Promise<boolean>
}

export const useCompetitionsStore = create<CompetitionsStore>((set) => ({
  isClaimingReward: false,

  claimTournamentReward: async (compId) => {
    const walletId = useSessionStore.getState().walletId
    if (!walletId) return false

    set({ isClaimingReward: true })
    try {
      await transact([
        {
          account: Constants.CONTRACT_COMP_WORLDS,
          name: Constants.CONTRACT_COMP_ACTION_CLAIM,
          authorization: [{ actor: walletId, permission: 'active' }],
          data: { id: compId, player: walletId },
        },
      ])
      toastMessage('Tournament rewards claimed successfully.')
      return true
    } catch (error) {
      toastErrorMessage(
        error?.message || error?.toString() || 'Claim tournament rewards has failed.'
      )
      console.error(error)
      return false
    } finally {
      set({ isClaimingReward: false })
    }
  },
}))
