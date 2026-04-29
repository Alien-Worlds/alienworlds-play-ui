import { filter, forEach, orderBy } from 'lodash'
import { derived } from 'overmind'
import { MissionRewards } from 'store/web3/types'

import { Explorer, Mission, MissionStatus, PinataNft, SortBy } from './types'

export type MissionsFilter = {
  account: string
  sortBy: SortBy
  reversed: boolean
}

export type MissionsState = {
  recentMissions: Mission[]
  explorer: Explorer
  explorerMissions: Mission[]
  nfts: PinataNft[]
  missionsFilter: MissionsFilter
  filterredAndSortedMissions: Mission[]
  triggerFilterAndSortMissions: boolean
  selectedMissionId: string
  selectedMission: Mission
  missionsToClaimCount: number
  missionShipsCount: number
  missionRewards: MissionRewards
  missionRewardsLoading: boolean
  loadingMessage: string
  infoMessage: string
  errorMessage: string
  subscribedEmail: string
  newsletterWasShown: boolean
  newsletterOnboardingWasShown: boolean
  account: string
  templatePinatas: PinataNft[]
  currentMissions: Mission[]
  availableMissions: Mission[]
  totalMissionsRewards: number
  selectedMissionsTab: number
  joinMissionStep: number
}

export const defaultState: MissionsState = {
  explorer: undefined,
  explorerMissions: derived((state: MissionsState) =>
    !state.explorer ? null : state.explorer.attributes.missions
  ),
  nfts: null,
  missionsFilter: {
    account: null,
    sortBy: SortBy.Id,
    reversed: true,
  },
  filterredAndSortedMissions: null,
  triggerFilterAndSortMissions: false,
  selectedMissionId: null,
  selectedMission: null,
  missionShipsCount: null,
  missionsToClaimCount: null,
  missionRewards: null,
  missionRewardsLoading: false,
  loadingMessage: null,
  infoMessage: null,
  errorMessage: null,
  subscribedEmail: null,
  newsletterWasShown: false,
  newsletterOnboardingWasShown: false,
  account: null,
  templatePinatas: null,
  recentMissions: null,
  currentMissions: derived((state: MissionsState) =>
    orderBy(
      filter(
        state?.explorer?.attributes?.missions,
        (m: Mission) => m.view.status === MissionStatus.Departed
      ),
      [(item: Mission) => item?.view?.time ?? 0],
      'asc'
    )
  ),
  availableMissions: derived((state: MissionsState) =>
    filter(state?.recentMissions, (m: Mission) => m.view.status === MissionStatus.Boarding)
  ),
  totalMissionsRewards: derived((state: MissionsState) => {
    let totalMissionsRewards: number = 0
    forEach(state.currentMissions, (m: Mission) => {
      const shipsSent: number = m.attributes.investInfo?.numberOfShips || 0
      const missionReward: number = m.attributes.reward / m.attributes.totalShips
      totalMissionsRewards += (missionReward * shipsSent) / 10000
    })
    return totalMissionsRewards
  }),
  selectedMissionsTab: null,
  joinMissionStep: null,
}

export const state: MissionsState = {
  ...defaultState,
}
