import { BigNumber } from 'ethers'
import { getBscAddress, useBscWalletStore } from 'features/missions/store/bscWalletStore'
import {
  Explorer,
  Mission,
  MissionRewards,
  MissionsFilter,
  MissionStatus,
  PinataNft,
  SortBy,
} from 'features/missions/types/missionsTypes'
import * as bscContracts from 'features/missions/utils/bscContracts'
import { withMissionView } from 'features/missions/utils/missionHelpers'
import {
  getExplorer,
  getRecentMissions,
  getTemplatePinatas,
  matchMissionsToTemplates,
} from 'features/missions/utils/missionsApi'
import { cloneDeep, filter, orderBy } from 'lodash'
import { matchPath } from 'react-router-dom'
import { useModalStore } from 'shared/store/modalStore'
import { useOverlayMessagesStore } from 'shared/store/overlayMessagesStore'
import { collectEvent } from 'shared/util/analytics'
import { Constants } from 'shared/util/constants'
import { isMissionsRelatedPage } from 'shared/util/router'
import { PagePath } from 'store/main/types'
import { create } from 'zustand'

// Missions: the recent missions, the player's explorer (the missions their BSC wallet joined),
// mission NFTs, the Missions Centre / My Missions list, and joining and claiming. Formerly
// Overmind's missions namespace. The loaders used to run on Overmind's 1s updateWorld tick with
// main.syncAi schedules; MissionsSync now calls `sync` every second and the schedules live here.
// The BSC wallet and balances are in bscWalletStore; the overlay messages in shared/store.

export type MissionsSyncKey = 'recentMissions' | 'explorer' | 'missionNfts' | 'bscBalance'

export type SyncInfo = {
  isInProgress: boolean
  /** Epoch ms; the loader runs again from then. */
  executeAfter: number
}

export interface MissionsState {
  /** The 100 most recent missions (Missions Centre). */
  recentMissions: Mission[] | null
  /** The BSC wallet's missions, or a demo explorer of the recent missions without a wallet. */
  explorer: Explorer | null
  /** explorer's missions (My Missions). */
  explorerMissions: Mission[] | null
  /** The explorer's departed missions, soonest to finish first. */
  currentMissions: Mission[]
  /** The recent missions still boarding. */
  availableMissions: Mission[]
  /** TLM the current missions will pay for the spacecrafts sent. */
  totalMissionsRewards: number
  /** The explorer's completed missions not yet claimed. */
  missionsToClaimCount: number | null
  selectedMissionId: string | null
  /** The mission open on the details or join page, from the explorer if it joined it. */
  selectedMission: Mission | null
  /** Every mission's template NFT, from IPFS. */
  templatePinatas: PinataNft[] | null
  /** The wallet's mission NFTs (the templates without a wallet). */
  nfts: PinataNft[] | null
  missionsFilter: MissionsFilter
  /** The Missions Centre or My Missions list, sorted. Empty while its missions load. */
  filteredAndSortedMissions: Mission[] | null
  /** Sort the list on the next sync (the missions or filter changed). */
  triggerFilterAndSortMissions: boolean
  selectedMissionsTab: number | null
  /** 1 approving TLM, 2 sending spacecrafts, 3 joined, 4 failed. */
  joinMissionStep: number | null
  missionShipsCount: number | null
  missionRewards: MissionRewards | null
  missionRewardsLoading: boolean
  newsletterWasShown: boolean
  subscribedEmail: string | null
  syncs: Record<MissionsSyncKey, SyncInfo>
}

export interface MissionsStore extends MissionsState {
  /** Runs everything due for the page: the loaders, the list sort and the timers. */
  sync: (pathname: string) => void
  loadTemplatePinatas: () => Promise<PinataNft[]>
  loadRecentMissions: (pathname: string) => Promise<void>
  loadExplorer: (pathname: string) => Promise<void>
  loadNfts: (pathname: string) => Promise<void>
  loadBscBalance: (pathname: string) => Promise<void>
  filterAndSortMissions: (pathname: string) => void
  /** Brings the missions' times and statuses up to date (missions pages only). */
  refreshMissionViews: (pathname: string) => void
  /** Clears the missions and loads them all again on the next sync. */
  reloadMissions: () => void
  /** Makes the loaders run on the next sync. */
  markSyncDue: (keys: MissionsSyncKey[]) => void
  selectMission: (id: string | null) => void
  setSelectedMissionsTab: (tab: number | null) => void
  setMissionsFilter: (missionsFilter: MissionsFilter) => void
  /** Clears the list and sorts it again with the current filter. */
  resortMissions: () => void
  setJoinMissionStep: (step: number | null) => void
  setMissionShipsCount: (count: number | null) => void
  /** Approves the TLM if needed, then sends the spacecrafts on the selected mission. */
  joinMission: (spaceshipsCount: number) => Promise<boolean>
  loadMissionRewards: (missionId: string) => Promise<void>
  claimMissionRewards: (missionId: string) => Promise<boolean>
  storeNewsletterWasShown: () => void
  storeSubscribedEmail: (email: string | null) => void
}

const SECOND = 1000
const MINUTE = 60 * SECOND

/** How soon a loader tries again after the missions API fails. */
export const RETRY_AFTER_FAILURE_MS = 10 * SECOND

const NEWSLETTER_SHOWN_KEY = 'alienworlds-missions-newsletter'
const SUBSCRIBED_EMAIL_KEY = 'alienworlds-missions-email'

export const DEMO_EXPLORER_ID = 'demoExplorer'

const readStorage = (key: string) => {
  try {
    return localStorage.getItem(key)
  } catch (e) {
    return null
  }
}

const delay = (ms: number) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms)
  })

// The loaders run while something shows their data: the missions pages and the main drawer
// show missions; Profile → Balances also shows the BSC balances, including the staked TLM from
// the explorer.
const isShowingMissions = (pathname: string) =>
  isMissionsRelatedPage(pathname) || useModalStore.getState().isMainDrawerOpen

const isShowingBscBalances = (pathname: string) =>
  isShowingMissions(pathname) || !!matchPath(PagePath.ProfileBalances, pathname)

const hasDifferentIds = (next: Mission[], current: Mission[]) =>
  next.length !== current.length || next.some((mission, i) => mission.id !== current[i]?.id)

const isSameList = (a: Mission[] | null, b: Mission[] | null) =>
  a === b || (!!a && !!b && !hasDifferentIds(a, b))

// TLM still locked on the explorer's missions (not yet claimed).
const calculateBscStakedTlmBalance = (explorer: Explorer | null) => {
  if (!explorer || !(explorer.attributes.missions?.length > 0)) return 0

  return explorer.attributes.missions.reduce((staked, mission) => {
    const investInfo = mission.attributes.investInfo
    if (investInfo?.totalStakeTLM > 0 && investInfo?.withdrawn === false) {
      return staked + investInfo.totalStakeTLM
    }
    return staked
  }, 0)
}

const sortValue = (mission: Mission, sortBy: SortBy): string => {
  switch (sortBy) {
    case SortBy.Type:
      return mission.attributes.missionType.toString()
    case SortBy.Name:
      return mission.attributes.name
    case SortBy.Duration:
      return mission.attributes.duration.toString().padStart(10, '0')
    case SortBy.Rewards:
      return mission.attributes.reward.toString().padStart(10, '0')
    case SortBy.Series:
      return mission.view.series
    case SortBy.Rarity:
      return mission.view.rarity
    case SortBy.Spacecrafts:
      return mission.attributes.totalShips.toString().padStart(10, '0')
    case SortBy.Time:
      return `${mission.view.timeLabel[0]}_${mission.view.time.toString().padStart(10, '0')}`
    case SortBy.Status:
      return mission.view.status
    default:
      return ''
  }
}

const sortMissions = (missions: Mission[], { sortBy, reversed }: MissionsFilter) => {
  const sorted = [...missions].sort((a, b) => {
    if (sortBy === SortBy.Id) return parseInt(a.id, 10) > parseInt(b.id, 10) ? 1 : -1
    return (sortValue(a, sortBy) ?? '').localeCompare(sortValue(b, sortBy) ?? '')
  })
  return reversed ? sorted.reverse() : sorted
}

// Fields recomputed whenever the missions or the selection change.
const derive = ({
  explorer,
  recentMissions,
  selectedMissionId,
}: Pick<MissionsState, 'explorer' | 'recentMissions' | 'selectedMissionId'>) => {
  const explorerMissions = explorer ? explorer.attributes.missions ?? null : null
  const currentMissions: Mission[] = orderBy(
    filter(explorerMissions, (m) => m.view?.status === MissionStatus.Departed),
    [(m: Mission) => m.view?.time ?? 0],
    'asc'
  )
  const totalMissionsRewards = currentMissions.reduce((total, m) => {
    const shipsSent = m.attributes.investInfo?.numberOfShips || 0
    const missionReward = m.attributes.reward / m.attributes.totalShips
    return total + (missionReward * shipsSent) / 10000
  }, 0)

  return {
    explorerMissions,
    currentMissions,
    availableMissions: filter(recentMissions, (m) => m.view?.status === MissionStatus.Boarding),
    totalMissionsRewards,
    missionsToClaimCount: explorerMissions
      ? explorerMissions.filter(
          (m) =>
            m.view?.status === MissionStatus.Completed &&
            m.attributes.investInfo?.withdrawn === false
        ).length
      : null,
    // The explorer's copy has the player's invest info.
    selectedMission: selectedMissionId
      ? explorerMissions?.find((m) => m.id === selectedMissionId) ??
        recentMissions?.find((m) => m.id === selectedMissionId) ??
        null
      : null,
  }
}

const getInitialSyncs = (): Record<MissionsSyncKey, SyncInfo> => ({
  recentMissions: { isInProgress: false, executeAfter: 0 },
  explorer: { isInProgress: false, executeAfter: 0 },
  missionNfts: { isInProgress: false, executeAfter: 0 },
  bscBalance: { isInProgress: false, executeAfter: 0 },
})

const initialMissions = { explorer: null, recentMissions: null, selectedMissionId: null }

export const getInitialMissionsState = (): MissionsState => ({
  ...initialMissions,
  ...derive(initialMissions),
  templatePinatas: null,
  nfts: null,
  missionsFilter: { sortBy: SortBy.Id, reversed: true },
  filteredAndSortedMissions: null,
  triggerFilterAndSortMissions: false,
  selectedMissionsTab: null,
  joinMissionStep: null,
  missionShipsCount: null,
  missionRewards: null,
  missionRewardsLoading: false,
  newsletterWasShown: !!readStorage(NEWSLETTER_SHOWN_KEY),
  subscribedEmail: readStorage(SUBSCRIBED_EMAIL_KEY) || null,
  syncs: getInitialSyncs(),
})

// One template request at a time; the loaders wait for it so missions get their NFTs.
let pendingTemplatePinatas: Promise<PinataNft[]> | null = null

export const useMissionsStore = create<MissionsStore>((set, get) => {
  const update = (patch: Partial<MissionsState>) => {
    const next = { ...get(), ...patch }
    set({ ...patch, ...derive(next) })
  }

  const setSync = (key: MissionsSyncKey, info: Partial<SyncInfo>) =>
    set((state) => ({ syncs: { ...state.syncs, [key]: { ...state.syncs[key], ...info } } }))

  const startSync = (key: MissionsSyncKey) => setSync(key, { isInProgress: true })
  const freeSync = (key: MissionsSyncKey) => setSync(key, { isInProgress: false })
  const scheduleSync = (key: MissionsSyncKey, inMs: number) =>
    setSync(key, { isInProgress: false, executeAfter: Date.now() + inMs })

  const isDue = (key: MissionsSyncKey) => {
    const { isInProgress, executeAfter } = get().syncs[key]
    return !isInProgress && executeAfter <= Date.now()
  }

  // Until anything has synced, load whenever not already loading.
  const shouldLoad = (key: MissionsSyncKey) =>
    !get().syncs[key].isInProgress && (isDue(key) || !useBscWalletStore.getState().isSync)

  return {
    ...getInitialMissionsState(),

    sync: (pathname) => {
      const store = get()
      store.loadTemplatePinatas().catch((error) => console.error(error))
      store.loadRecentMissions(pathname)
      store.loadExplorer(pathname)
      store.loadNfts(pathname)
      store.loadBscBalance(pathname)
      store.filterAndSortMissions(pathname)
      store.refreshMissionViews(pathname)
    },

    loadTemplatePinatas: () => {
      const { templatePinatas } = get()
      if (templatePinatas) return Promise.resolve(templatePinatas)

      if (!pendingTemplatePinatas) {
        pendingTemplatePinatas = getTemplatePinatas()
          .then((loaded) => {
            set({ templatePinatas: loaded })
            return loaded
          })
          .finally(() => {
            pendingTemplatePinatas = null
          })
      }
      return pendingTemplatePinatas
    },

    loadRecentMissions: async (pathname) => {
      if (!isShowingMissions(pathname) || !shouldLoad('recentMissions')) return

      startSync('recentMissions')
      try {
        const missions = await getRecentMissions()
        if (!missions) {
          scheduleSync('recentMissions', RETRY_AFTER_FAILURE_MS)
          return
        }

        const templates = await get().loadTemplatePinatas()
        const loaded = matchMissionsToTemplates(missions, templates)
        const current = get().recentMissions

        // An unchanged list is kept, so the sorted list isn't redone.
        if (!current || hasDifferentIds(loaded, current)) {
          update({
            recentMissions: loaded,
            ...(current ? { triggerFilterAndSortMissions: true } : {}),
          })
        }

        useBscWalletStore.getState().setIsSync(true)
        scheduleSync('recentMissions', 5 * MINUTE)
      } catch (error) {
        console.error(error)
        freeSync('recentMissions')
      }
    },

    loadExplorer: async (pathname) => {
      if (!isShowingBscBalances(pathname)) return

      const { userWallet } = useBscWalletStore.getState()

      // Without a BSC wallet, show the recent missions as the player's.
      if (userWallet === null) {
        const { explorer, recentMissions } = get()
        if (
          explorer?.id === DEMO_EXPLORER_ID &&
          isSameList(explorer.attributes.missions, recentMissions)
        ) {
          return
        }

        const demoExplorer: Explorer = {
          id: DEMO_EXPLORER_ID,
          type: null,
          attributes: {
            address: null,
            missions: recentMissions,
            totalInvestInfo: { totalStakeBNB: 0, totalStakeTLM: 0 },
          },
        }
        update({ explorer: demoExplorer, triggerFilterAndSortMissions: true })
        useBscWalletStore
          .getState()
          .setBscStakedTlmBalance(calculateBscStakedTlmBalance(demoExplorer))
        return
      }

      if (!shouldLoad('explorer')) return

      startSync('explorer')
      try {
        const explorer = await getExplorer(getBscAddress(userWallet))
        // The API gives null when the request fails: keep what's loaded and try again shortly.
        if (!explorer) {
          scheduleSync('explorer', RETRY_AFTER_FAILURE_MS)
          return
        }

        const templates = await get().loadTemplatePinatas()
        const loaded: Explorer = {
          ...explorer,
          attributes: {
            ...explorer.attributes,
            missions: matchMissionsToTemplates(explorer.attributes.missions, templates),
          },
        }
        const current = get().explorer

        if (
          !current ||
          loaded.id !== current.id ||
          hasDifferentIds(loaded.attributes.missions ?? [], current.attributes.missions ?? [])
        ) {
          update({ explorer: loaded, triggerFilterAndSortMissions: true })
        }

        const wallet = useBscWalletStore.getState()
        wallet.setBscStakedTlmBalance(calculateBscStakedTlmBalance(get().explorer))
        wallet.setIsSync(true)
        scheduleSync('explorer', MINUTE)
      } catch (error) {
        console.error(error)
        freeSync('explorer')
      }
    },

    loadNfts: async (pathname) => {
      if (!isMissionsRelatedPage(pathname)) return

      // The templates load on start; the NFTs are shown as them.
      const templates = get().templatePinatas
      if (!(templates?.length > 0) || !shouldLoad('missionNfts')) return

      startSync('missionNfts')
      try {
        const wallet = useBscWalletStore.getState()
        const account = getBscAddress(wallet.userWallet)
        const provider = wallet.userWallet?.provider

        // Without a BSC wallet, show every mission NFT.
        const nfts =
          account && provider
            ? await bscContracts.getNfts(
                account,
                provider,
                templates,
                wallet.setTotalMissionsNfts,
                wallet.setLoadedMissionsNfts
              )
            : [...templates]

        set({ nfts })
        if (nfts) useBscWalletStore.getState().setIsSync(true)
        scheduleSync('missionNfts', 120 * MINUTE)
      } catch (error) {
        console.error(error)
        freeSync('missionNfts')
      }
    },

    loadBscBalance: async (pathname) => {
      const wallet = useBscWalletStore.getState()
      if (wallet.userWallet === null) {
        if (wallet.bscTlmBalance !== null) wallet.setBscTlmBalance(null)
        return
      }
      if (!isShowingBscBalances(pathname) || !isDue('bscBalance')) return

      startSync('bscBalance')
      try {
        const balance = await bscContracts.getBscTlmBalance(
          wallet.userWallet.provider,
          getBscAddress(wallet.userWallet),
          () => get().markSyncDue(['bscBalance', 'explorer'])
        )
        useBscWalletStore.getState().setBscTlmBalance(balance)
        scheduleSync('bscBalance', MINUTE)
      } catch (error) {
        console.error(error)
        freeSync('bscBalance')
      }
    },

    filterAndSortMissions: (pathname) => {
      const isCentre = !!matchPath(PagePath.Missions, pathname)
      const isMyMissions = !!matchPath(PagePath.MissionsExplorer, pathname)
      const {
        triggerFilterAndSortMissions,
        recentMissions,
        explorerMissions,
        missionsFilter,
        filteredAndSortedMissions,
      } = get()

      if (!triggerFilterAndSortMissions || (!isCentre && !isMyMissions)) return

      const missions = isCentre ? recentMissions : explorerMissions
      // Keep the trigger so the list sorts once the missions arrive.
      if (!missions) {
        if (filteredAndSortedMissions?.length !== 0) set({ filteredAndSortedMissions: [] })
        return
      }

      // Show how many spacecrafts the player sent on the missions they joined.
      const withInvestInfo = explorerMissions
        ? missions.map((mission) => {
            const joined = explorerMissions.find((m) => m.id === mission.id)
            if (!joined) return mission
            return {
              ...mission,
              attributes: {
                ...mission.attributes,
                investInfo: cloneDeep(joined.attributes.investInfo),
              },
            }
          })
        : missions

      set({
        filteredAndSortedMissions: sortMissions(withInvestInfo, missionsFilter),
        triggerFilterAndSortMissions: false,
      })
    },

    refreshMissionViews: (pathname) => {
      if (!isMissionsRelatedPage(pathname)) return

      const { recentMissions, explorer, filteredAndSortedMissions } = get()
      update({
        recentMissions: recentMissions ? recentMissions.map(withMissionView) : recentMissions,
        explorer: explorer?.attributes.missions
          ? {
              ...explorer,
              attributes: {
                ...explorer.attributes,
                missions: explorer.attributes.missions.map(withMissionView),
              },
            }
          : explorer,
        filteredAndSortedMissions: filteredAndSortedMissions
          ? filteredAndSortedMissions.map(withMissionView)
          : filteredAndSortedMissions,
      })
    },

    reloadMissions: () => {
      update({
        recentMissions: null,
        explorer: null,
        nfts: null,
        triggerFilterAndSortMissions: true,
      })
      get().markSyncDue(['bscBalance', 'explorer', 'missionNfts', 'recentMissions'])
    },

    markSyncDue: (keys) => {
      keys.forEach((key) => setSync(key, { isInProgress: false, executeAfter: Date.now() }))
    },

    selectMission: (selectedMissionId) => update({ selectedMissionId }),

    setSelectedMissionsTab: (selectedMissionsTab) => set({ selectedMissionsTab }),

    setMissionsFilter: (missionsFilter) =>
      set({ filteredAndSortedMissions: null, missionsFilter, triggerFilterAndSortMissions: true }),

    resortMissions: () =>
      set({ filteredAndSortedMissions: null, triggerFilterAndSortMissions: true }),

    setJoinMissionStep: (joinMissionStep) => set({ joinMissionStep }),

    setMissionShipsCount: (missionShipsCount) => set({ missionShipsCount }),

    joinMission: async (spaceshipsCount) => {
      set({ joinMissionStep: 1 })
      try {
        const mission = get().selectedMission
        const { userWallet } = useBscWalletStore.getState()
        const provider = userWallet?.provider
        const allowance = await bscContracts.getAllowance(provider, getBscAddress(userWallet))
        const cost = BigNumber.from(mission.attributes.spaceshipCost * spaceshipsCount)
        set({ missionShipsCount: spaceshipsCount })
        collectEvent({ name: Constants.GA_MISSIONS_JOIN })

        if (cost.gt(allowance || BigNumber.from(0))) {
          await bscContracts.setAllowance(cost, provider)
          collectEvent({ name: Constants.GA_MISSIONS_SET_ALLOWANCE })
        }

        await delay(5000)
        set({ joinMissionStep: 2 })

        const wallet = useBscWalletStore.getState().userWallet
        if (wallet !== null) {
          await bscContracts.joinMission(mission.id, spaceshipsCount, wallet.provider)
        }

        set({ joinMissionStep: 3 })
        await delay(1000)
        get().reloadMissions()
        collectEvent({ name: Constants.GA_MISSIONS_JOIN_SUCCESS })
        return true
      } catch (error) {
        console.error(error)
        set({ missionShipsCount: null, joinMissionStep: 4 })
        return false
      }
    },

    loadMissionRewards: async (missionId) => {
      const { userWallet } = useBscWalletStore.getState()
      if (userWallet === null) return

      set({ missionRewardsLoading: true })
      try {
        const missionRewards = await bscContracts.getMissionRewards(missionId, userWallet.provider)
        set({ missionRewards, missionRewardsLoading: false })
      } catch (error) {
        console.error(error)
        set({ missionRewardsLoading: false })
      }
    },

    claimMissionRewards: async (missionId) => {
      const messages = useOverlayMessagesStore.getState()
      messages.setLoadingMessage('Claiming your Mission rewards..')

      let isSuccess = false
      try {
        const provider = useBscWalletStore.getState().userWallet?.provider
        await bscContracts.claimMissionRewards(missionId, provider)
        collectEvent({ name: Constants.GA_MISSIONS_REWARDS_CLAIMED_SUCCESS })
        isSuccess = true
      } catch (error) {
        console.error(error)
        collectEvent({ name: Constants.GA_MISSIONS_REWARDS_CLAIMED_ERROR })
        messages.setLoadingMessage(null)
        messages.setErrorMessage(
          error?.message?.includes('User denied transaction')
            ? 'User denied transaction'
            : 'Error has occured!'
        )
      }

      // Give the missions API time to see the claim.
      await delay(8000)

      if (isSuccess) {
        get().reloadMissions()
        messages.setLoadingMessage(null)
        messages.setInfoMessage('Your Mission reward has been claimed.')
      }
      return isSuccess
    },

    storeNewsletterWasShown: () => {
      localStorage.setItem(NEWSLETTER_SHOWN_KEY, 'true')
      set({ newsletterWasShown: true })
    },

    storeSubscribedEmail: (email) => {
      if (email) {
        localStorage.setItem(SUBSCRIBED_EMAIL_KEY, email)
        collectEvent({ name: Constants.GA_MISSIONS_NEWSLETTER_SUB })
      } else {
        localStorage.removeItem(SUBSCRIBED_EMAIL_KEY)
        collectEvent({ name: Constants.GA_MISSIONS_NEWSLETTER_UNSUB })
      }
      set({ subscribedEmail: email })
    },
  }
})

// A different BSC account has a different balance and explorer: load them on the next sync.
useBscWalletStore.subscribe((state, previous) => {
  if (getBscAddress(state.userWallet) !== getBscAddress(previous.userWallet)) {
    useMissionsStore.getState().markSyncDue(['bscBalance', 'explorer'])
  }
})
