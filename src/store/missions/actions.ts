import { BigNumber } from 'ethers'
import { cloneDeep, forEach, replace } from 'lodash'
import { DateTime } from 'luxon'
import { catchError, debounce, pipe, wait, waitUntil } from 'overmind'
import { matchPath, matchRoutes } from 'react-router'
import { router } from 'routes'
import { config } from 'shared/util/config'
import { isMissionsRelatedPage } from 'shared/util/router'
import { executeAfter, shouldExecute } from 'store/main/helpers'
import { PagePath } from 'store/main/types'
import { bindMissionView, bindMissionViews } from 'store/missions/helpers'
import { MissionsFilter } from 'store/missions/state'
import { Explorer, Mission, MissionStatus, SortBy } from 'store/missions/types'

import { Context } from '..'
import { Constants } from '../../shared/util/constants'

export const onInitializeOvermind = async ({ state, effects }: Context) => {
  const newsletterWasShown = localStorage.getItem('alienworlds-missions-newsletter')
  if (newsletterWasShown) {
    state.missions.newsletterWasShown = true
  }

  const subscribedEmail = localStorage.getItem('alienworlds-missions-email')
  if (subscribedEmail) {
    state.missions.subscribedEmail = subscribedEmail
  }

  effects.missions.api.initialize({
    getAccount() {
      return state.web3.account
    },
  })
}

export const setSelectedMission = ({ state }: Context) => {
  if (!state.missions.selectedMissionId) {
    state.missions.selectedMission = null
    return
  }

  let selectedMission: Mission = null

  // Try find in explorer's missions
  if (state.missions.explorerMissions) {
    selectedMission = state.missions.explorerMissions.find(
      (x) => x.id === state.missions.selectedMissionId
    )
  }

  // Try find in recent missions
  if (!selectedMission && state.missions.recentMissions) {
    selectedMission = state.missions.recentMissions.find(
      (x) => x.id === state.missions.selectedMissionId
    )
  }

  if (!selectedMission) {
    state.missions.selectedMission = null
    return
  }

  selectedMission = cloneDeep(selectedMission)
  bindMissionView(selectedMission)
  state.missions.selectedMission = selectedMission
}

const calculateBscStakedTlmBalance = (explorer: Explorer) => {
  if (!explorer || !(explorer.attributes.missions?.length > 0)) {
    return 0
  }

  return explorer.attributes.missions.reduce((staked, mission) => {
    if (
      mission.attributes.investInfo?.totalStakeTLM > 0 &&
      mission.attributes.investInfo?.withdrawn === false
    ) {
      return staked + mission.attributes.investInfo.totalStakeTLM
    }

    return staked
  }, 0)
}

export const initializeOrReloadTemplatePinatas = pipe(async ({ state, effects }: Context) => {
  if (!state.missions.templatePinatas) {
    state.missions.templatePinatas = await effects.missions.api.getTemplatePinatas()
  }
})

export const initializeOrReloadRecentMissions = pipe(
  async ({ state, actions, effects }: Context) => {
    const { pathname } = router.state.location

    const isMissionsPage = isMissionsRelatedPage(pathname)

    if (!isMissionsPage && !state.main.isMainDrawerOpen) return

    if (state.main.syncAi.recentMissions.isInProgress) return

    actions.missions.setSelectedMission()
    if (!shouldExecute(state.main.syncAi.recentMissions, isMissionsPage) && state.web3.isSync) {
      return
    }

    state.main.syncAi.recentMissions.isInProgress = true

    const missions = await effects.missions.api.getRecentMissions()

    const missionsWithPinatas = await effects.missions.api.mapPinatasToMissions(
      missions,
      state.missions.templatePinatas
    )
    bindMissionViews(missionsWithPinatas)

    if (
      !state.missions.recentMissions ||
      missionsWithPinatas.some((v, i) => v.id !== state.missions.recentMissions[i]?.id)
    ) {
      if (state.missions.recentMissions) {
        state.missions.triggerFilterAndSortMissions = true
      }
      state.missions.recentMissions = null
      state.missions.recentMissions = missionsWithPinatas
    }

    actions.missions.setSelectedMission()
    state.web3.isSync = true
    executeAfter(state.main.syncAi.recentMissions, DateTime.now().plus({ minutes: 5 }))
  },
  catchError(({ state }: Context, error) => {
    console.error(error)
    state.main.syncAi.recentMissions.isInProgress = false
  })
)

export const initializeOrReloadExplorerMissions = pipe(
  async ({ state, actions, effects }: Context) => {
    const { pathname } = router.state.location

    const isMissionsPage = isMissionsRelatedPage(pathname)

    if (
      !isMissionsPage &&
      matchPath(PagePath.ProfileBalances, router.state.location.pathname) &&
      !state.main.isMainDrawerOpen
    )
      return

    // DEMO USER
    if (state.web3.userWallet === null) {
      actions.missions.setSelectedMission()
      state.main.syncAi.explorer.isInProgress = true

      const demoExplorer: Explorer = {
        id: 'demoExplorer',
        type: null,
        attributes: {
          address: null,
          missions: [],
          totalInvestInfo: { totalStakeBNB: 0, totalStakeTLM: 0 },
        },
      }

      demoExplorer.attributes.missions = state.missions.recentMissions
      state.missions.triggerFilterAndSortMissions = true
      state.missions.explorer = demoExplorer
      bindMissionViews(state.missions.explorerMissions)
      actions.missions.setSelectedMission()

      state.web3.bscStakedTlmBalance = calculateBscStakedTlmBalance(state.missions.explorer)
    }
    // CONNECTED USER
    else {
      actions.missions.setSelectedMission()
      if (!shouldExecute(state.main.syncAi.explorer, true) && state.web3.isSync) {
        return
      }
      state.main.syncAi.explorer.isInProgress = true
      const explorer: Explorer = await effects.missions.api.getExplorer(
        state.web3.userWallet.accounts[0].address
      )

      if (!explorer) return

      explorer.attributes.missions = await effects.missions.api.mapPinatasToMissions(
        explorer.attributes.missions,
        state.missions.templatePinatas
      )

      if (
        !state.missions.explorer ||
        explorer.id !== state.missions.explorer.id ||
        explorer.attributes.missions.some((v, i) => v.id !== state.missions.explorerMissions[i]?.id)
      ) {
        state.missions.triggerFilterAndSortMissions = true
        state.missions.explorer = explorer
        bindMissionViews(state.missions.explorerMissions)
      }

      actions.missions.setSelectedMission()

      state.web3.bscStakedTlmBalance = calculateBscStakedTlmBalance(state.missions.explorer)
      if (explorer) {
        state.web3.isSync = true
        executeAfter(state.main.syncAi.explorer, DateTime.now().plus({ minutes: 1 }))
      }
    }
  },
  catchError(({ state }: Context, error) => {
    console.error(error)
    state.main.syncAi.explorer.isInProgress = false
  })
)

export const initializeOrReloadNfts = pipe(
  async ({ state, effects }: Context) => {
    const { pathname } = router.state.location
    const isMissionsPage = isMissionsRelatedPage(pathname)

    if (!isMissionsPage) return

    if (!state.missions.templatePinatas) {
      state.missions.templatePinatas = await effects.missions.api.getTemplatePinatas()
    }
  },
  waitUntil((state: any) => state.missions.templatePinatas?.length > 0),
  async ({ state, actions, effects }: Context) => {
    const { pathname } = router.state.location
    const isMissionsPage = isMissionsRelatedPage(pathname)

    if (!shouldExecute(state.main.syncAi.missionNfts, isMissionsPage) && state.web3.isSync) {
      return
    }
    const provider = state?.web3.userWallet?.provider
    const account = state?.web3?.userWallet?.accounts[0].address

    state.main.syncAi.missionNfts.isInProgress = true

    // replace external IPFS gateway with our own AW IPFS gateway
    forEach(state.missions.templatePinatas, (m) => {
      m.image = replace(m.image, 'https://ipfs.io/ipfs', config.IpfsApiUrl)
    })

    if (account && provider) {
      state.missions.nfts = await effects.web3.api.getNfts(
        account,
        provider,
        state.missions.templatePinatas,
        actions.web3.updateTotalMissionsNfts,
        actions.web3.updateLoadedMissionsNfts
      )
    } else {
      if (state.missions.templatePinatas?.length > 0) {
        state.missions.nfts = [...state.missions.templatePinatas]
        state.web3.isSync = true
      }
    }

    if (state.missions.nfts) {
      state.web3.isSync = true
      executeAfter(state.main.syncAi.missionNfts, DateTime.now().plus({ minutes: 120 }))
    }
  },
  catchError(({ state }: Context, error) => {
    console.error(error)
    state.main.syncAi.missionNfts.isInProgress = false
  })
)

export const updateMissionsOnSecondTick = ({ state }: Context) => {
  const { pathname } = router.state.location

  const isMissionsPage = isMissionsRelatedPage(pathname)

  if (!isMissionsPage) {
    return
  }
  if (state.missions.recentMissions) {
    bindMissionViews(state.missions.recentMissions)
  }

  if (state.missions.explorerMissions) {
    bindMissionViews(state.missions.explorerMissions)
  }

  if (state.missions.selectedMission) {
    bindMissionView(state.missions.selectedMission)
  }

  state.missions.missionsToClaimCount = state.missions.explorerMissions?.filter(
    (x) => x.view.status === MissionStatus.Completed && x.attributes.investInfo?.withdrawn === false
  ).length
}

export const filterAndSortMissions = pipe(
  ({ state }: Context) => {
    const { pathname } = router.state.location
    const isMissionsPage = isMissionsRelatedPage(pathname)

    if (!isMissionsPage) return null

    if (
      !state.missions.triggerFilterAndSortMissions ||
      !matchRoutes([{ path: PagePath.Missions }, { path: PagePath.MissionsExplorer }], pathname)
    ) {
      return null
    }

    const missionsToFilterAndSort = matchPath(PagePath.Missions, pathname)
      ? state.missions.recentMissions
      : matchPath(PagePath.MissionsExplorer, pathname)
      ? state.missions.explorerMissions
      : null

    if (!missionsToFilterAndSort) {
      state.missions.filterredAndSortedMissions = []
      return null
    }
    state.missions.triggerFilterAndSortMissions = false

    // Just bind InvestInfo from Explorer's misions, to know how many ships joined
    if (
      matchRoutes([{ path: PagePath.Missions }, { path: PagePath.MissionsExplorer }], pathname) &&
      state.missions.explorerMissions
    ) {
      missionsToFilterAndSort.forEach((x) => {
        const explorerJoinedThatMission = state.missions.explorerMissions.find((m) => m.id === x.id)
        if (explorerJoinedThatMission) {
          x.attributes.investInfo = cloneDeep(explorerJoinedThatMission.attributes.investInfo)
        }
      })
    }

    let filterredAndSortedMissions = missionsToFilterAndSort.sort((a, b) => {
      let aValue: string = null
      let bValue: string = null

      switch (state.missions.missionsFilter.sortBy) {
        case SortBy.Type:
          aValue = a.attributes.missionType.toString()
          bValue = b.attributes.missionType.toString()
          break
        case SortBy.Id:
          aValue = a.id
          bValue = b.id
          return parseInt(aValue, 10) > parseInt(bValue, 10) ? 1 : -1
        case SortBy.Name:
          aValue = a.attributes.name
          bValue = b.attributes.name
          break
        case SortBy.Duration:
          aValue = a.attributes.duration.toString().padStart(10, '0')
          bValue = b.attributes.duration.toString().padStart(10, '0')
          break
        case SortBy.Rewards:
          aValue = a.attributes.reward.toString().padStart(10, '0')
          bValue = b.attributes.reward.toString().padStart(10, '0')
          break
        case SortBy.Series:
          aValue = a.view.series
          bValue = b.view.series
          break
        case SortBy.Rarity:
          aValue = a.view.rarity
          bValue = b.view.rarity
          break
        case SortBy.Spacecrafts:
          aValue = a.attributes.totalShips.toString().padStart(10, '0')
          bValue = b.attributes.totalShips.toString().padStart(10, '0')
          break
        case SortBy.Time:
          aValue = `${a.view.timeLabel[0]}_${a.view.time.toString().padStart(10, '0')}`
          bValue = `${b.view.timeLabel[0]}_${b.view.time.toString().padStart(10, '0')}`
          break
        case SortBy.Status:
          aValue = a.view.status
          bValue = b.view.status
          break
        default:
          aValue = ''
          bValue = ''
      }

      return aValue.localeCompare(bValue)
    })

    if (state.missions.missionsFilter.reversed) {
      filterredAndSortedMissions = filterredAndSortedMissions.reverse()
    }

    return [...filterredAndSortedMissions]
  },
  debounce(300),
  ({ state }: Context, missions: Mission[]) => {
    if (missions) {
      state.missions.filterredAndSortedMissions = missions
    }
  }
)

export const reloadMissions = pipe(
  ({ state }: Context) => {
    state.missions.recentMissions = null
    state.missions.explorer = null
    state.missions.nfts = null
    executeAfter(state.main.syncAi.bscBalance, DateTime.now())
    executeAfter(state.main.syncAi.explorer, DateTime.now())
    executeAfter(state.main.syncAi.missionNfts, DateTime.now())
    executeAfter(state.main.syncAi.recentMissions, DateTime.now())
  },
  debounce(200),
  ({ state }: Context) => {
    state.missions.triggerFilterAndSortMissions = true
  },
  catchError((_: Context, error) => {
    console.error(error)
  })
)

export const setSelectedMissionsTab = pipe(({ state }: Context, tabIndex: number) => {
  state.missions.selectedMissionsTab = tabIndex
})

export const setMissionsFilter = pipe(
  ({ state }: Context, missionsFilter: MissionsFilter) => {
    state.missions.filterredAndSortedMissions = null
    state.missions.missionsFilter = missionsFilter
    state.missions.triggerFilterAndSortMissions = true
    state.missions.account = missionsFilter?.account
  },
  catchError((_: Context, error) => {
    console.error(error)
  })
)

export const setJoinMissionStep = pipe(
  ({ state }: Context, step: number) => {
    state.missions.joinMissionStep = step
  },
  catchError((_: Context, error) => {
    console.error(error)
  })
)

export const setMissionShipsCount = pipe(
  ({ state }: Context, count: number) => {
    state.missions.missionShipsCount = count
  },
  catchError((_: Context, error) => {
    console.error(error)
  })
)

export const joinMission = pipe(
  async ({ state, effects, actions }: Context, spaceshipsCount: number) => {
    state.missions.joinMissionStep = 1
    const mission = state.missions.selectedMission
    const provider = state?.web3.userWallet?.provider
    const account = state?.web3?.userWallet?.accounts[0].address
    const allowance = await effects.web3.api.getAllowance(provider, account)
    const cost = mission.attributes.spaceshipCost * spaceshipsCount
    state.missions.missionShipsCount = spaceshipsCount
    actions.wax.collectEvent({ name: Constants.GA_MISSIONS_JOIN })

    if (BigNumber.from(cost).gt(allowance || BigNumber.from(0))) {
      await effects.web3.api.setAllowance(BigNumber.from(cost), provider)
      actions.wax.collectEvent({ name: Constants.GA_MISSIONS_SET_ALLOWANCE })
    }

    return { missionId: mission.id, spaceshipsCount }
  },
  wait(5000),
  async ({ state }: Context, payload) => {
    state.missions.joinMissionStep = 2
    return payload
  },
  async ({ state, effects }: Context, payload) => {
    if (state.web3.userWallet === null) return
    const provider = state?.web3.userWallet?.provider
    await effects.web3.api.joinMission(payload.missionId, payload.spaceshipsCount, provider)
  },
  async ({ state }: Context) => {
    state.missions.joinMissionStep = 3
  },
  wait(1000),
  async ({ actions }: Context) => {
    actions.missions.reloadMissions()
    try {
      actions.wax.collectEvent({ name: Constants.GA_MISSIONS_JOIN_SUCCESS })
    } catch (e) {
      console.log(e)
    }
    return true
  },
  catchError(({ state }: Context, error) => {
    state.missions.missionShipsCount = null
    state.missions.joinMissionStep = 4
    console.error(error)
    return false
  })
)

export const loadMissionRewards = pipe(
  async ({ state, effects }: Context, missionId: string) => {
    if (state.web3.userWallet === null) return
    const provider = state?.web3.userWallet?.provider
    state.missions.missionRewardsLoading = true
    state.missions.missionRewards = await effects.web3.api.getMissionRewards(missionId, provider)
    state.missions.missionRewardsLoading = false
  },
  catchError(({ state }: Context, error) => {
    state.missions.missionRewardsLoading = false
    console.error(error)
  })
)

export const claimMissionRewards = pipe(
  async ({ state }: Context, missionId: string) => {
    state.missions.loadingMessage = 'Claiming your Mission rewards..'
    return missionId
  },
  async ({ state, effects, actions }: Context, missionId: string) => {
    try {
      const provider = state?.web3?.userWallet?.provider
      await effects.web3.api.claimMissionRewards(missionId, provider)

      actions.wax.collectEvent({ name: Constants.GA_MISSIONS_REWARDS_CLAIMED_SUCCESS })

      return true
    } catch (error) {
      let message = 'Error has occured!'
      if (error?.message.indexOf('User denied transaction') !== -1) {
        message = 'User denied transaction'
      }

      actions.wax.collectEvent({ name: Constants.GA_MISSIONS_REWARDS_CLAIMED_ERROR })

      state.missions.loadingMessage = null
      state.missions.errorMessage = message

      return false
    }
  },
  wait(8000),
  async ({ state, actions }: Context, isSuccess: boolean) => {
    if (isSuccess) {
      actions.missions.reloadMissions()
      state.missions.loadingMessage = null
      state.missions.infoMessage = 'Your Mission reward has been claimed.'
    }

    return isSuccess
  },
  catchError(({ state }: Context, error) => {
    state.missions.loadingMessage = null
    state.missions.errorMessage = error?.message
    console.error(error)
    return false
  })
)

export const clearInfoMessage = ({ state }: Context) => {
  state.missions.infoMessage = null
}

export const clearErrorMessage = ({ state }: Context) => {
  state.missions.errorMessage = null
}

export const storeNewsletterWasShown = ({ state }: Context) => {
  localStorage.setItem('alienworlds-missions-newsletter', 'true')
  state.missions.newsletterWasShown = true
}

// #region Email subscription
export const storeSubscribedEmail = ({ state, actions }: Context, email: string) => {
  if (email) {
    localStorage.setItem('alienworlds-missions-email', email)
    actions.wax.collectEvent({ name: Constants.GA_MISSIONS_NEWSLETTER_SUB })
  } else {
    localStorage.removeItem('alienworlds-missions-email')
    actions.wax.collectEvent({ name: Constants.GA_MISSIONS_NEWSLETTER_UNSUB })
  }
  state.missions.subscribedEmail = email
}

// #endregion
