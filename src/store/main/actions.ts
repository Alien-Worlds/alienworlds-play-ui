import { JsonRpc } from '@eoscafe/hyperion'
import SessionKit, { Session } from '@wharfkit/session'
import { WalletPluginAnchor } from '@wharfkit/wallet-plugin-anchor'
import { WalletPluginCloudWallet } from '@wharfkit/wallet-plugin-cloudwallet'
import { WalletPluginWombat } from '@wharfkit/wallet-plugin-wombat'
import { IAsset } from 'atomicassets/build/API/Explorer/Objects'
import { ProposalsSortBy } from 'features/syndicates/types/governanceTypes'
import { filter, find, get, isNil } from 'lodash'
import { DateTime, Duration } from 'luxon'
import { catchError, parallel, pipe, wait, filter as overmindFilter, waitUntil } from 'overmind'
import { toast } from 'react-hot-toast'
import { matchPath } from 'react-router'
import { router } from 'routes'
import { config } from 'shared/util/config'
import { padZero, isValidDacId, getUserRankInfo, sessionKitWallets } from 'shared/util/helpers'
import { isMissionsRelatedPage } from 'shared/util/router'
import {
  validateAccount,
  filterAndSortAssets,
  initializeOrReloadBag,
  initializeOrReloadAssets,
  initializeOrReloadMiningLand,
  initializeOrReloadTagAndAvatar,
} from 'store/atomic/actions'
import { getDefaultAssetsFilter } from 'store/atomic/helpers'
import { AssetSchema, SortBy } from 'store/atomic/types'
import {
  setSelectedMission,
  filterAndSortMissions,
  initializeOrReloadNfts,
  updateMissionsOnSecondTick,
  initializeOrReloadRecentMissions,
  initializeOrReloadTemplatePinatas,
  initializeOrReloadExplorerMissions,
} from 'store/missions/actions'
import {
  filterAndSortProposals,
  initializeOrReloadTerms,
  initializeOrReloadResources,
  initializeOrReloadNftsToClaim,
  loadManagingLandDetailsAndBoosts,
  initializeOrReloadRefundsInProgress,
} from 'store/wax/actions'
import { initializeOrReloadBscBalance } from 'store/web3/actions'

import { Context } from '..'
import {
  executeAfter,
  getDefaultSyncAi,
  calculateMineDelay,
  mapBagToMiningParams,
  mapLandToMiningParams,
  showOnboardingNewsletter,
} from './helpers'
import { LandOwnerDrawerType, PagePath, PullRequest, WalletType } from './types'
import { Constants } from '../../shared/util/constants'

export const redirectAfterLoginOrLogout = pipe(
  overmindFilter(({ state }: Context) => {
    const { isLoggedIn } = state.wax
    const {
      state: {
        location: { pathname },
      },
      navigate,
    } = router

    const isMissionsPage = isMissionsRelatedPage(pathname)

    if (!isLoggedIn && !pathname.startsWith(PagePath.Missions)) {
      if (
        pathname !== PagePath.SignUp &&
        pathname !== PagePath.NewsletterJoin &&
        pathname !== PagePath.Home
      ) {
        navigate(PagePath.Home)
      } else if (pathname !== PagePath.Home && !isMissionsPage) {
        // Not logged in on some url => remember that url and redirect to login page
        state.main.loginRedirectTo = window.location.pathname
        navigate(PagePath.Home)
      }
    }
    return isLoggedIn || isMissionsPage
  }),
  async ({ state, effects }: Context): Promise<string> => {
    const redirectTo = state.main.loginRedirectTo
    const { pathname } = router.state.location

    let targetPage = pathname

    if (!pathname.startsWith(PagePath.Missions)) {
      if (!state.wax.miner) {
        state.wax.miner = await effects.wax.api.getMiner()
      }

      if (!state.wax.terms) {
        state.wax.terms = await effects.wax.api.getTerms()
      }

      // Show Onboarding page if user is not onboarded and Terms are not accepted yet
      const showOnboarding = !state.wax.isOnboarded && !state.wax.termsAccepted
      // const userHasSubscribed = await effects.main.api.hasSubscribedWithEmail(state.wax.walletId)

      if (showOnboardingNewsletter()) {
        // Show Newsletter page
        targetPage = PagePath.NewsletterJoin
      } else if (showOnboarding && pathname !== PagePath.Onboarding) {
        // Show Onboarding page
        // targetPage = PagePath.Onboarding
      } else if (redirectTo !== null) {
        state.main.loginRedirectTo = null
        targetPage = redirectTo
      } else if (pathname === '/') {
        // Logged in without remembered url => redirect to default if still on login page
        targetPage = PagePath.Inventory
      }

      return targetPage
    }
    return targetPage
  },
  (_context, url: PagePath) => {
    const { navigate } = router

    navigate(url)
  },
  catchError((_: Context, error) => {
    console.error(error)
  })
)

export const tryAutoLogin = pipe(
  async ({ state, effects }: Context) => {
    if ((!state.wax.isLoggedIn || state.main.isSwitchingWallets) && !state.wax.isAuthenticating) {
      state.wax.isAuthenticating = true
      state.main.currentWallet = localStorage.getItem('aw_currentWallet')
      state.wax.walletId = await effects.wax.api.tryAutoLogin()
      state.wax.miner = await effects.wax.api.getMiner()

      if (state.wax.miner === null) {
        router.navigate(PagePath.NewsletterJoin)
      }
      state.wax.isAuthenticating = false
    }
  },
  waitUntil((state: any) => state.wax.walletId?.length > 0),
  redirectAfterLoginOrLogout,
  initializeOrReloadBag,
  catchError((_: Context, error) => {
    console.error(error)
  })
)

export const signUp = pipe(
  async ({ state, effects }: Context) => {
    state.wax.isAuthenticating = true
    const result = await effects.wax.api.loginWax()
    if (result) state.main.isWaxLoggedIn = true
    state.wax.walletId = result
    state.wax.miner = await effects.wax.api.getMiner()
    if (state.wax.miner === null) {
      router.navigate(PagePath.NewsletterJoin)
    }
    state.main.syncAi = getDefaultSyncAi()
    state.wax.isAuthenticating = false
  },
  catchError((_: Context, error) => {
    console.error(error)
  })
)

export const setSessionKit = pipe(({ state }, payload: SessionKit) => {
  state.main.sessionKit = payload
})

export const setCurrentSession = pipe(({ state }, payload: Session) => {
  state.main.currentSession = payload
})

export const loginWombat = pipe(
  async ({ state, actions, effects }: Context) => {
    state.wax.isAuthenticating = true

    state.wax.walletId = await effects.wax.api.loginWombat()
    state.main.syncAi = getDefaultSyncAi()
    state.wax.isAuthenticating = false
    state.wax.miner = await effects.wax.api.getMiner()
    if (state.wax.miner === null) {
      router.navigate(PagePath.NewsletterJoin)
    }
    localStorage.setItem('aw_wallet', state.wax.walletId)
    actions.wax.collectEvent({ name: Constants.GA_AW_LOGIN })
  },
  redirectAfterLoginOrLogout,
  catchError((_: Context, error) => {
    console.error(error)
  })
)

export const login = pipe(
  async ({ state, effects, actions }: Context) => {
    if (!state.wax.isDemoUser) {
      state.wax.isAuthenticating = true
    }
    state.wax.walletId = await effects.wax.api.login()
    state.main.syncAi = getDefaultSyncAi()
    state.wax.isAuthenticating = false
    state.wax.miner = await effects.wax.api.getMiner()

    if (state.wax.miner === null) {
      router.navigate(PagePath.NewsletterJoin)
    }
    localStorage.setItem('aw_wallet', state.wax.walletId)
    actions.wax.collectEvent({ name: Constants.GA_AW_LOGIN })
  },
  redirectAfterLoginOrLogout,
  catchError((_: Context, error) => {
    console.error(error)
  })
)

export const getLorePullRequests = pipe(
  async ({ state, effects }: Context) => {
    const result: Array<PullRequest> = await effects.main.getLorePullRequests()
    state.main.lorePullRequests = result
    return result
  },
  catchError((_: Context, error) => {
    toastErrorMessage(error?.message ?? 'Load Unstake Release Time Failed')
    console.error(error)
    return null
  })
)
export const getLoreReadMe = pipe(
  async ({ state, effects }: Context) => {
    const result: string = await effects.main.getLoreReadMe()
    //state.main.lorePullRequests = result

    state.main.loreReadMe = result
    return result
  },
  catchError((_: Context, error) => {
    toastErrorMessage(error?.message ?? 'Load Unstake Release Time Failed')
    console.error(error)
    return null
  })
)
export const getLorePullRequestCommit = pipe(
  async ({ state, effects }: Context, id: number) => {
    const result: string = await effects.main.getLorePullCommit({ pullNumber: id })
    //state.main.lorePullRequests = result

    state.main.loreDescription = result
    return result
  },
  catchError((_: Context, error) => {
    toastErrorMessage(error?.message ?? 'Load Unstake Release Time Failed')
    console.error(error)
    return null
  })
)
export const loginAnchor = pipe(
  async ({ state, actions, effects }: Context) => {
    state.wax.isAuthenticating = true

    state.wax.walletId = await effects.wax.api.loginAnchor()
    state.main.syncAi = getDefaultSyncAi()
    state.wax.isAuthenticating = false
    state.wax.miner = await effects.wax.api.getMiner()
    if (state.wax.miner === null) {
      router.navigate(PagePath.NewsletterJoin)
    }
    localStorage.setItem('aw_wallet', state.wax.walletId)
    actions.wax.collectEvent({ name: Constants.GA_AW_LOGIN })
  },
  redirectAfterLoginOrLogout,
  catchError((_: Context, error) => {
    console.error(error)
  })
)

export const loginWax = pipe(
  async ({ state, effects, actions }: Context) => {
    if (!state.wax.isDemoUser) {
      state.wax.isAuthenticating = true
    }

    const copyKit: any = state.main.sessionKit
    copyKit.walletPlugins = [new WalletPluginCloudWallet()]

    // login to Wombat
    state.main.currentSession = await copyKit.login()
    const result = await effects.wax.api.loginWax()
    if (result) state.main.isWaxLoggedIn = true
    state.wax.walletId = result
    state.main.syncAi = getDefaultSyncAi()
    state.wax.isAuthenticating = false
    state.wax.miner = await effects.wax.api.getMiner()
    if (state.wax.miner === null) {
      router.navigate(PagePath.NewsletterJoin)
    }
    localStorage.setItem('aw_wallet', state.wax.walletId)
    actions.wax.collectEvent({ name: Constants.GA_AW_LOGIN })
  },
  redirectAfterLoginOrLogout,
  catchError((_: Context, error) => {
    console.error(error)
  })
)

export const loginWombatInit = pipe(async ({ state, actions }: Context) => {
  try {
    if (state.main.sessionKit) {
      // remove all other plugins to avoid showing the WebRendererUI
      // and to automatically trigger login with Wombat
      const copyKit: any = state.main.sessionKit
      copyKit.walletPlugins = [new WalletPluginWombat()]

      // login to Wombat
      state.main.currentSession = await copyKit.login()
      await actions.main.loginWombat()

      state.main.currentWallet = WalletType.WOMBAT
    } else {
      toastErrorMessage('Wombat Wallet not available.')
    }
  } catch {
    // swallow the exception as WharfKit handles it in the UI.
  }
})

export const loginAnchorInit = pipe(async ({ state, actions }: Context) => {
  try {
    if (state.main.sessionKit) {
      // remove all other plugins to avoid showing the WebRendererUI
      // and to automatically trigger login with Anchor
      const copyKit: any = state.main.sessionKit
      copyKit.walletPlugins = [new WalletPluginAnchor()]

      // login to Anchor
      state.main.currentSession = await copyKit.login()
      await actions.main.loginAnchor()

      state.main.currentWallet = WalletType.ANCHOR
    } else {
      toastErrorMessage('Anchor Wallet not available.')
    }
  } catch {
    // swallow the exception as WharfKit handles it in the UI.
  }
})

export const loginWaxInit = pipe(async ({ state, actions }: Context) => {
  await actions.main.loginWax()
  state.main.currentWallet = WalletType.WAX
})

export const selectWallet = pipe(async ({ actions }: Context, wallet: string) => {
  switch (wallet) {
    case WalletType.WAX:
      await actions.main.loginWaxInit()
      localStorage.setItem('aw_currentWallet', WalletType.WAX)
      break
    case WalletType.ANCHOR:
      await actions.main.loginAnchorInit()
      localStorage.setItem('aw_currentWallet', WalletType.ANCHOR)
      break
    case WalletType.WOMBAT:
      await actions.main.loginWombatInit()
      localStorage.setItem('aw_currentWallet', WalletType.WOMBAT)
      break
    default:
      break
  }
})

export const switchWallet = pipe(
  async ({ state, actions }: Context, newWallet: string) => {
    if (newWallet === WalletType.WAX) {
      if (state.main.isWaxLoggedIn) {
        localStorage.setItem('aw_currentWallet', WalletType.WAX)
        state.main.isSwitchingWallets = true
        await actions.main.tryAutoLogin()
        state.main.isSwitchingWallets = false
      } else {
        await actions.main.loginWaxInit()
      }
      state.main.currentSession = null
      state.main.currentWallet = WalletType.WAX
      setTimeout(() => {
        toastMessage(`Active Wallet: WAX Cloud Wallet`, 3000)
      }, 1000)
    } else {
      // Release #2
      // restore existing session
      // const sessions = await state.main.sessionKit.getSessions()
      // const existingSession = find(sessions, (s) => s.walletPlugin.id === newWallet)

      // if (existingSession) {
      //   const session = await state.main.sessionKit.restore(existingSession)
      //   state.main.currentSession = session
      //   state.main.currentWallet = newWallet

      //   const fullTitleWallet = find(sessionKitWallets, (sw) => sw.type === newWallet)?.fullTitle
      //   toastMessage(`Active Wallet: ${fullTitleWallet}`)
      //   localStorage.setItem('aw_currentWallet', newWallet)
      // } else {
      // start new session
      await actions.main.selectWallet(newWallet)

      const fullTitleWallet = find(sessionKitWallets, (sw) => sw.type === newWallet)?.fullTitle
      setTimeout(() => {
        toastMessage(`Active Wallet: ${fullTitleWallet}`, 3000)
      }, 1000)
      // }
    }
    state.main.syncAi = getDefaultSyncAi()
  },

  catchError((_: Context, error) => {
    console.error(error)
  })
)

export const logout = pipe(
  async ({ state, effects }: Context) => {
    await state.main.sessionKit.logout()
    await effects.wax.api.logout()

    state.wax.isAuthenticating = true
    state.main.currentWallet = 'demo'
    state.wax.walletId = await effects.wax.api.tryAutoLogin()
    state.wax.isAuthenticating = false
    state.main.syncAi = getDefaultSyncAi()
  },

  catchError((_: Context, error) => {
    console.error(error)
  })
)

export const toastMessage = (message: string, duration?: number) => {
  const wallet = JSON.parse(localStorage.getItem('aw'))
  const isDemoUser = wallet?.userAccount === config.DemoUserWaxAccount

  toast.success(message, {
    duration: duration ?? 5000,
    position: 'top-center',
    style: { marginTop: isDemoUser ? '60px' : '0px' },
  })
}

export const toastErrorMessage = (message: string) => {
  toast.error(message, {
    duration: 5000,
    position: 'bottom-right',
  })
}

export const getTransaction = async (transactionId: string) => {
  if (!transactionId) return null
  const rpc = new JsonRpc(config.HyperionApiUrl)
  const response = await rpc.get_transaction(transactionId)

  return response
}

export const setMineDelay = pipe(
  ({ state }: Context) => {
    if (
      !state.atomic.bagAssets ||
      !state.atomic.landAsset ||
      !state.wax.miner ||
      !state.wax.isLoggedIn
    ) {
      state.main.mineDelay = null
      return
    }

    const bagParams = mapBagToMiningParams(state.atomic.bagAssets)
    const landParams = mapLandToMiningParams(state.atomic.landAsset)

    const newMineDelay = calculateMineDelay(
      state.wax.miner.last_mine_tx,
      state.wax.miner.last_mine,
      bagParams,
      landParams
    )

    state.main.mineDelay = Duration.fromMillis(newMineDelay)
  },
  catchError(({ state }: Context, error) => {
    state.main.mineDelay = null
    console.error(error)
  })
)

export const notifyBountyFromLastMiningTransaction = pipe(
  async ({ state }: Context) => {
    if (!state.wax.isLoggedIn) return

    if (state.wax.walletId === config.DemoUserWaxAccount) {
      toastMessage(`Mined: 0.0000 TLM`)
    }

    if (state.main.lastMiningTransactionId && !state.main.bountyNotificationInProgress) {
      state.main.bountyNotificationInProgress = true

      const transaction = await getTransaction(state.main.lastMiningTransactionId)

      if (!transaction?.actions || transaction.actions.length === 0) {
        state.main.bountyNotificationInProgress = false
        return
      }

      let bounty = null

      transaction.actions.forEach((x) => {
        const action: any = x?.act?.data

        if (action?.miner && action?.bounty && action?.bounty?.length > 0) {
          bounty = action?.bounty
        }
      })

      if (bounty) {
        state.main.lastMiningTransactionId = null
        toastMessage(`Mined: ${bounty}`)

        const time = state.main.mineDelay
          ?.shiftTo('hours', 'minutes', 'seconds', 'milliseconds')
          .toObject()
        const cooldown = `${padZero(time?.hours)}h:${padZero(time?.minutes)}m:${padZero(
          time?.seconds
        )}s`

        state.main.lastMineBounty = bounty
        state.main.lastMineCountdown = cooldown
      }

      state.main.bountyNotificationInProgress = false
    }
  },
  catchError((_: Context, error) => {
    console.error(error)
  })
)

export const presetAssetsFilter = ({ state, actions }: Context) => {
  if (!state.atomic.assetsFilter) {
    actions.atomic.setAssetsFilter(getDefaultAssetsFilter(router.state.location.pathname))
    return
  }

  // Inventory
  if (matchPath(PagePath.Inventory, router.state.location.pathname)) {
    actions.atomic.setAssetsFilter({
      sortBy: SortBy.NAME,
      groupByTemplate: true,
      reversed: false,
      assetSchema: null,
      view: null,
    })
    return
  }

  // Mining - Tools
  if (matchPath(PagePath.Tools, router.state.location.pathname)) {
    actions.atomic.setAssetsFilter({
      sortBy: SortBy.RARITY,
      groupByTemplate: true,
      reversed: false,
      assetSchema: AssetSchema.TOOL,
      view: null,
    })
    return
  }

  // Shining
  if (matchPath(PagePath.Shining, router.state.location.pathname)) {
    actions.atomic.setAssetsFilter({
      sortBy: SortBy.NAME,
      groupByTemplate: true,
      reversed: false,
      assetSchema: null,
      view: null,
    })
    return
  }

  actions.atomic.setAssetsFilter({
    ...state.atomic.assetsFilter,
  })
}

export const toggleMainDrawer = pipe(({ state }: Context, forceState: boolean | null = null) => {
  const newState = forceState !== null ? forceState : !state.main.isMainDrawerOpen

  state.main.isMainDrawerOpen = newState
})

export const setShiningUrl = pipe(({ state }: Context, url: string) => {
  state.main.shiningUrl = url
})

export const showOnboardingPage = pipe(
  ({ actions }: Context) => {
    actions.wax.collectEvent({
      name: Constants.GA_PAGE_VISIT,
      fields: { location: PagePath.Onboarding },
    })
  },
  catchError((_: Context, error) => {
    console.error(error)
  })
)

export const showHomePage = pipe(
  ({ actions }: Context) => {
    actions.wax.collectEvent({
      name: Constants.GA_PAGE_VISIT,
      fields: { location: PagePath.Home },
    })
  },
  catchError((_: Context, error) => {
    console.error(error)
  })
)
export const showInventoryPage = pipe(
  ({ actions }: Context) => {
    actions.main.toggleMainDrawer(false)
    actions.main.presetAssetsFilter()
    actions.wax.collectEvent({
      name: Constants.GA_PAGE_VISIT,
      fields: { location: PagePath.Inventory },
    })
  },
  catchError((_: Context, error) => {
    console.error(error)
  })
)

export const showShiningPage = pipe(
  ({ actions }: Context) => {
    actions.main.toggleMainDrawer(false)
    actions.main.presetAssetsFilter()
    actions.wax.collectEvent({
      name: Constants.GA_PAGE_VISIT,
      fields: { location: PagePath.Shining },
    })
  },
  catchError((_: Context, error) => {
    console.error(error)
  })
)

export const showArenaPortalPage = pipe(
  ({ actions }: Context) => {
    actions.main.toggleMainDrawer(false)
    actions.wax.collectEvent({
      name: Constants.GA_PAGE_VISIT,
      fields: { location: PagePath.ArenaPortal },
    })
  },
  catchError((_: Context, error) => {
    console.error(error)
  })
)

export const showGovernancePage = pipe(
  ({ state, actions }: Context) => {
    actions.main.toggleMainDrawer(false)
    actions.wax.collectEvent({
      name: Constants.GA_PAGE_VISIT,
      fields: {
        location: PagePath.GovernanceSelect,

        planet: state.wax.selectedDacId,
      },
    })
  },

  catchError((_: Context, error) => {
    console.error(error)
  })
)

export const showGovernanceDetailsPage = pipe(
  ({ state, actions }: Context, id: string) => {
    const { navigate } = router
    actions.main.toggleMainDrawer(false)

    if (isValidDacId(id)) {
      state.wax.selectedDacId = id
    } else {
      navigate(PagePath.GovernanceSelect)
      actions.main.showGovernancePage()
    }
    actions.wax.collectEvent({
      name: Constants.GA_PAGE_VISIT,
      fields: {
        location: PagePath.GovernanceDetails,

        planet: state.wax.selectedDacId,
        stakedTokens: state.wax.userStakedDAOTokens,
      },
    })
    return id
  },

  ({ actions }: Context) => {
    const newFilter = {
      sortBy: ProposalsSortBy.ID,
      reversed: true,
    }
    actions.wax.setProposalsFilter(newFilter)
  },
  catchError((_: Context, error) => {
    console.error(error)
  })
)
export const showGovernanceDaoSelect = pipe(
  ({ state, actions }: Context, id: string) => {
    const { navigate } = router
    actions.main.toggleMainDrawer(false)
    if (isValidDacId(id)) {
      state.wax.selectedDacId = id
    } else {
      navigate(PagePath.DAOSelect)
      actions.main.showGovernancePage()
    }
    actions.wax.collectEvent({
      name: Constants.GA_PAGE_VISIT,
      fields: {
        location: PagePath.GovernanceDetails,

        planet: state.wax.selectedDacId,
        stakedTokens: state.wax.userStakedDAOTokens,
      },
    })
    return id
  },

  ({ actions }: Context) => {
    const newFilter = {
      sortBy: ProposalsSortBy.ID,
      reversed: true,
    }
    actions.wax.setProposalsFilter(newFilter)
  },
  catchError((_: Context, error) => {
    console.error(error)
  })
)

export const showGovernanceCandidatesPage = pipe(
  ({ state, actions }: Context, { id }: { id: string }) => {
    actions.main.toggleMainDrawer(false)
    const { navigate } = router
    if (isValidDacId(id)) {
      state.wax.selectedDacId = id
    } else {
      navigate(PagePath.GovernanceSelect)
      actions.main.showGovernancePage()
    }
    actions.wax.collectEvent({
      name: Constants.GA_PAGE_VISIT,
      fields: {
        location: PagePath.GovernanceCandidates,

        planet: state.wax.selectedDacId,
        stakedTokens: state.wax.userStakedDAOTokens,
      },
    })
    return id
  },

  ({ actions }: Context) => {
    const newFilter = {
      sortBy: ProposalsSortBy.ID,
      reversed: true,
    }
    actions.wax.setProposalsFilter(newFilter)
  },
  catchError((_: Context, error) => {
    console.error(error)
  })
)

export const showGovernanceBecomeCandidatePage = pipe(({ state, actions }: Context, id: string) => {
  const { navigate } = router
  actions.main.toggleMainDrawer(false)
  if (isValidDacId(id)) {
    state.wax.selectedDacId = id
  } else {
    navigate(PagePath.GovernanceSelect)
    actions.main.showGovernancePage()
  }
  actions.wax.collectEvent({
    name: Constants.GA_PAGE_VISIT,
    fields: {
      location: PagePath.GovernanceBecomeCandidate,

      planet: state.wax.selectedDacId,
      stakedTokens: state.wax.userStakedDAOTokens,
    },
  })
  return id
})

export const showGovernanceManageCandidacyPage = pipe(
  ({ state, actions }: Context, id: string) => {
    const { navigate } = router
    actions.main.toggleMainDrawer(false)
    if (isValidDacId(id)) {
      state.wax.selectedDacId = id
    } else {
      navigate(PagePath.GovernanceSelect)
      actions.main.showGovernancePage()
    }
    actions.wax.collectEvent({
      name: Constants.GA_PAGE_VISIT,
      fields: {
        location: PagePath.GovernanceManageCandidacy,

        planet: state.wax.selectedDacId,
        stakedTokens: state.wax.userStakedDAOTokens,
      },
    })
    return id
  },

  waitUntil((state: any) => state.wax.selectedDacCandidates?.length > 0)
  // TODO
  // ({ state }: Context) => {
  //   const { navigate } = router
  //   if (
  //     state.wax.dacUserStatus !== DACUserStatusType.CANDIDATE &&
  //     state.wax.dacUserStatus !== DACUserStatusType.CUSTODIAN
  //   ) {
  //     navigate(generatePath(PagePath.GovernanceDetails, { planetId: state.wax.selectedDacId }))
  //   }
  // },
)

export const showGovernanceMemberTerms = pipe(({ state, actions }: Context, id: string) => {
  const { navigate } = router
  actions.main.toggleMainDrawer(false)
  if (isValidDacId(id)) {
    state.wax.selectedDacId = id
  } else {
    navigate(PagePath.GovernanceSelect)
    actions.main.showGovernancePage()
  }
  actions.wax.collectEvent({
    name: Constants.GA_PAGE_VISIT,
    fields: {
      location: PagePath.GovernanceMemberTerms,

      planet: state.wax.selectedDacId,
      stakedTokens: state.wax.userStakedDAOTokens,
    },
  })
  return id
})

export const showGovernanceSignCandidateVotePage = pipe(
  ({ state, actions }: Context, payload: { id: string; walletId: string }) => {
    const { id, walletId } = payload
    const { navigate } = router
    actions.main.toggleMainDrawer(false)
    if (isValidDacId(id)) {
      state.wax.selectedDacId = id
      state.wax.selectedDacCandidateWalletId = walletId
    } else {
      navigate(PagePath.GovernanceSelect)
      actions.main.showGovernancePage()
    }
    actions.wax.collectEvent({
      name: Constants.GA_PAGE_VISIT,
      fields: {
        location: PagePath.GovernanceSignCandidateVote,

        planet: state.wax.selectedDacId,
        stakedTokens: state.wax.userStakedDAOTokens,
      },
    })
    return id
  },

  ({ state }: Context) => {
    const candProposals = filter(
      state.wax.dacCustodianProposals,
      (proposal) => proposal.proposer === state.wax.selectedDacCandidateWalletId
    )
    state.wax.filterredAndSortedProposals = candProposals
  },
  ({ actions }: Context) => {
    const newFilter = {
      sortBy: ProposalsSortBy.ID,
      reversed: true,
    }
    actions.wax.setProposalsFilter(newFilter)
  },
  catchError((_: Context, error) => {
    console.error(error)
  })
)

export const showGovernanceCustodianDashboard = pipe(
  ({ state, actions }: Context, id: string) => {
    const { navigate } = router
    actions.main.toggleMainDrawer(false)
    if (isValidDacId(id)) {
      state.wax.selectedDacId = id
    } else {
      navigate(PagePath.GovernanceSelect)
      actions.main.showGovernancePage()
    }
    actions.wax.collectEvent({
      name: Constants.GA_PAGE_VISIT,
      fields: {
        location: PagePath.GovernanceCustodianDashboard,

        planet: state.wax.selectedDacId,
        stakedTokens: state.wax.userStakedDAOTokens,
      },
    })
    return id
  },

  waitUntil((state: any) => state.wax.selectedDacCustodians?.length > 0),
  // TODO
  // ({ state }: Context) => {
  //   const { navigate } = router
  //   if (state.wax.dacUserStatus !== DACUserStatusType.CUSTODIAN) {
  //     navigate(generatePath(PagePath.GovernanceDetails, { planetId: state.wax.selectedDacId }))
  //   }
  // },
  ({ actions }: Context) => {
    const newFilter = {
      sortBy: ProposalsSortBy.ID,
      reversed: true,
    }
    actions.wax.setProposalsFilter(newFilter)
  },
  catchError((_: Context, error) => {
    console.error(error)
  })
)

export const showMissionsPage = pipe(
  ({ actions }: Context) => {
    actions.main.toggleMainDrawer(false)
    actions.missions.setSelectedMissionsTab(0)
    actions.wax.collectEvent({
      name: Constants.GA_PAGE_VISIT,
      fields: { location: PagePath.Missions },
    })
  },
  ({ state, actions }: Context) => {
    const newFilter = { ...state.missions.missionsFilter }
    actions.missions.setMissionsFilter(newFilter)
  },
  catchError((_: Context, error) => {
    console.error(error)
  })
)

export const showMissionsExplorerPage = pipe(
  ({ actions }: Context) => {
    actions.main.toggleMainDrawer(false)
    actions.missions.setSelectedMissionsTab(1)
    actions.wax.collectEvent({
      name: Constants.GA_PAGE_VISIT,
      fields: { location: PagePath.MissionsExplorer },
    })
  },
  ({ state, actions }: Context) => {
    const newFilter = { ...state.missions.missionsFilter }
    actions.missions.setMissionsFilter(newFilter)
  },
  catchError((_: Context, error) => {
    console.error(error)
  })
)

export const showMissionsInventoryPage = pipe(
  ({ actions }: Context) => {
    actions.main.toggleMainDrawer(false)
    actions.missions.setSelectedMissionsTab(2)
    actions.wax.collectEvent({
      name: Constants.GA_PAGE_VISIT,
      fields: { location: PagePath.MissionsInventory },
    })
  },
  catchError((_: Context, error) => {
    console.error(error)
  })
)

export const showMissionDetailsPage = pipe(
  ({ state, actions }: Context, id: string) => {
    actions.main.toggleMainDrawer(false)
    state.missions.selectedMissionId = id
    actions.wax.collectEvent({
      name: Constants.GA_PAGE_VISIT,
      fields: { location: PagePath.MissionDetails },
    })
  },
  setSelectedMission,
  catchError((_: Context, error) => {
    console.error(error)
  })
)

export const showMissionJoinPage = pipe(
  ({ state, actions }: Context, id: string) => {
    actions.main.toggleMainDrawer(false)
    state.missions.selectedMissionId = id
    actions.wax.collectEvent({
      name: Constants.GA_PAGE_VISIT,
      fields: { location: PagePath.MissionJoin },
    })
  },
  setSelectedMission,
  catchError((_: Context, error) => {
    console.error(error)
  })
)

export const showMiningPage = pipe(
  async ({ actions }: Context) => {
    actions.main.toggleMainDrawer(false)
    actions.main.presetAssetsFilter()
    actions.wax.collectEvent({
      name: Constants.GA_PAGE_VISIT,
      fields: { location: PagePath.Tools },
    })
  },
  catchError((_: Context, error) => {
    console.error(error)
  })
)

export const showPlanetPage = pipe(
  async ({ actions }: Context) => {
    actions.main.toggleMainDrawer(false)
    actions.wax.collectEvent({
      name: Constants.GA_PAGE_VISIT,
      fields: { location: PagePath.Planet },
    })
  },
  catchError((_: Context, error) => {
    console.error(error)
  })
)

export const showLandPage = pipe(
  async ({ state, actions }: Context, input: { assetIds: string[]; planetName: string }) => {
    const { assetIds, planetName } = input
    state.atomic.landAssetsFilter.filteredLands = null
    state.atomic.landAssetsFilter.isLoading = true

    if (!state.wax.whereToMine) {
      await actions.main.updateWorld()
    }
    await actions.main.bindLandsMap({ assetIds, planetTitle: planetName })
    actions.atomic.resetLandAssetsFilter()
  },
  async ({ actions }: Context) => {
    actions.main.toggleMainDrawer(false)
    actions.wax.collectEvent({
      name: Constants.GA_PAGE_VISIT,
      fields: { location: PagePath.Land },
    })
  },

  catchError((_: Context, error) => {
    console.error(error)
  })
)

export const showErrorPage = pipe(
  async ({ actions }: Context) => {
    actions.main.toggleMainDrawer(false)
    actions.wax.collectEvent({
      name: Constants.GA_PAGE_VISIT,
      fields: { location: PagePath.Error },
    })
  },
  catchError((_: Context, error) => {
    console.error(error)
  })
)

export const showProfileInfoPage = pipe(
  async ({ actions }: Context) => {
    actions.main.toggleMainDrawer(false)
    actions.wax.collectEvent({
      name: Constants.GA_PAGE_VISIT,
      fields: { location: PagePath.ProfileInfo },
    })
  },
  catchError((_: Context, error) => {
    console.error(error)
  })
)

export const showProfileBalancesPage = pipe(
  async ({ actions }: Context) => {
    actions.main.toggleMainDrawer(false)
    actions.wax.collectEvent({
      name: Constants.GA_PAGE_VISIT,
      fields: { location: PagePath.ProfileBalances },
    })
  },
  catchError((_: Context, error) => {
    console.error(error)
  })
)

export const showOutpostPage = pipe(
  async ({ actions }: Context) => {
    actions.main.toggleMainDrawer(false)
    actions.wax.collectEvent({
      name: Constants.GA_PAGE_VISIT,
      fields: { location: PagePath.Outpost },
    })
  },
  catchError((_: Context, error) => {
    console.error(error)
  })
)

export const showLandMgtPage = pipe(
  ({ state, actions }: Context, id: string) => {
    actions.main.toggleMainDrawer(false)
    state.wax.managingLandId = id

    actions.wax.collectEvent({
      name: Constants.GA_PAGE_VISIT,
      fields: { location: PagePath.LandMgtSubpage },
    })
    actions.main.presetAssetsFilter()
  },
  loadManagingLandDetailsAndBoosts,
  ({ state }: Context) => {
    const {
      state: {
        location: { pathname },
      },
      navigate,
    } = router

    const isMiningLandPage = pathname.startsWith(PagePath.Land)

    if (!isMiningLandPage && !state.wax.nftLandCardProperties.isUserOwner) {
      navigate(PagePath.Inventory)
    }
  },
  catchError((_: Context, error) => {
    console.error(error)
  })
)

export const bindLandsMap = async (
  { state, effects }: Context,
  input: { assetIds: string[]; planetTitle: string }
) => {
  const { assetIds, planetTitle } = input
  if (assetIds.length > 0) {
    if (
      isNil(state.wax.planetLandsAssets[planetTitle]) ||
      state.wax.planetLandsAssets[planetTitle]?.length === 0
    ) {
      let landAssets: IAsset[] = []

      while (assetIds.length) {
        const currentIds = assetIds.splice(0, 100)

        const assets = await effects.atomic.api.getAssetsByIds(currentIds)

        landAssets = landAssets.concat(assets)
      }

      state.wax.planetLandsAssets[planetTitle] = landAssets
    }
  }
}

export const updateWorld = parallel(
  parallel(
    validateAccount,
    initializeOrReloadBag,
    initializeOrReloadMiningLand,
    initializeOrReloadAssets,
    initializeOrReloadTagAndAvatar
  ),
  parallel(
    filterAndSortAssets,
    setMineDelay,
    initializeOrReloadTerms,
    initializeOrReloadRefundsInProgress
  ),
  parallel(
    initializeOrReloadTemplatePinatas,
    initializeOrReloadRecentMissions,
    initializeOrReloadExplorerMissions,
    initializeOrReloadNfts,
    filterAndSortMissions,
    updateMissionsOnSecondTick
  ),
  parallel(
    initializeOrReloadBscBalance,
    initializeOrReloadNftsToClaim,

    initializeOrReloadResources,
    filterAndSortProposals
  )
)

export const onInitializeOvermind = async ({ effects, actions, state }: Context) => {
  effects.main.api.initialize({
    getBagAssets() {
      return state.atomic.bagAssets
    },
    getLandAsset() {
      return state.atomic.landAsset
    },
    getLastMineTx() {
      return state.wax.miner.last_mine_tx
    },
    getWalletId() {
      return state.wax.walletId
    },
    onGetMiningRandomString(value) {
      state.main.miningRandomString = value ?? null
      state.main.isMining = false
    },
    async onRuntimeTick() {
      state.main.runtimeInSeconds += 1

      actions.main.updateWorld()

      if (state.main.autoExpireSigningDACTerms === 0) {
        state.main.autoExpireSigningDACTerms = null
        state.main.isSigningDACTerms = false
      }

      if (state.main.autoExpireSigningDACTerms > 0) {
        const newValue = state.main.autoExpireSigningDACTerms - 1
        state.main.autoExpireSigningDACTerms = newValue
      }

      if (state.main.autoExpireVoteDACCandidates === 0) {
        state.main.autoExpireVoteDACCandidates = null
        actions.wax.resetActionProgressState()
      }

      if (state.main.autoExpireVoteDACCandidates > 0) {
        const newValue = state.main.autoExpireVoteDACCandidates - 1
        state.main.autoExpireVoteDACCandidates = newValue
      }
    },
  })
}

export const setIsFocusedWindow = pipe(
  ({ state }: Context, isFocusedWindow: boolean) => {
    state.main.isFocusedWindow = isFocusedWindow
  },
  catchError((_: Context, error) => {
    console.error(error)
  })
)

export const mine = pipe(
  ({ state }: Context) => {
    state.main.isMining = true
  },
  ({ effects }: Context) => {
    effects.main.api.runMineWorker()
  },
  catchError(({ state }: Context, error) => {
    state.main.miningRandomString = null
    state.main.isMining = false
    console.error(error)
  })
)

export const claimMine = pipe(
  ({ state }: Context) => {
    state.main.isClaiming = true
  },
  async ({ state, effects }: Context) => {
    const result = await effects.wax.api.claimMine()

    if (result) {
      if (state.main.currentWallet === WalletType.WAX) {
        state.main.lastMiningTransactionId = get(result, 'response.transaction_id', '')
      } else if (state.main.currentWallet === WalletType.WOMBAT) {
        state.main.lastMiningTransactionId = result.response?.transaction_id
      } else if (state.main.currentWallet === WalletType.ANCHOR) {
        state.main.lastMiningTransactionId = result.response?.transaction_id
      }
    }
  },

  ({ state }: Context) => {
    let resetMine = true
    let isparsedMsg = false

    if (state.wax.lastTransactionError) {
      if (state.wax.lastTransactionError.indexOf('User declined') !== -1) {
        resetMine = false
      }

      if (state.wax.lastTransactionError.indexOf('INSUFFICIENT_POINTS') !== -1) {
        try {
          const toolRarity = state.wax.lastTransactionError
            .split('INSUFFICIENT_POINTS_')[1]
            ?.split('::')[0]
            ?.trim()
          const rankInfo = getUserRankInfo(toolRarity)

          state.wax.lastTransactionError = `You need to be Rank ${rankInfo.rankNumber}: ${rankInfo.rankName} (${rankInfo.totalShards} total Shards earned) to use tools of ${rankInfo.toolRarity} rarity.`
          isparsedMsg = true
        } catch (err) {
          console.error(err)
        }
      }

      if (state.main.currentWallet === WalletType.WAX || isparsedMsg) {
        toastErrorMessage(state.wax.lastTransactionError)
      }
      state.wax.lastTransactionError = null
    }

    return resetMine
  },
  async ({ state }: Context, resetMine: boolean) => {
    if (resetMine) {
      state.main.mineDelay = null
      state.main.miningRandomString = null
      state.main.isWorkInProgress = true

      executeAfter(state.main.syncAi.land, DateTime.now().plus({ seconds: 6 }))
    }

    state.main.isClaiming = false

    return resetMine
  },
  wait(8000),
  async ({ state, actions }: Context, resetMine: boolean) => {
    if (resetMine) {
      state.main.isWorkInProgress = false

      await actions.main.notifyBountyFromLastMiningTransaction()

      actions.wax.collectEvent({
        name: 'mine_claimed_success',
        fields: {
          mineReward: state.main.lastMineBounty,
          mineCooldown: state.main.lastMineCountdown,
        },
      })
    }
  },
  catchError(({ state, actions }: Context, error) => {
    state.main.mineDelay = null
    state.main.miningRandomString = null
    state.main.isClaiming = false
    state.main.isWorkInProgress = false
    state.wax.lastTransactionError = null
    console.error(error)

    actions.wax.collectEvent({ name: Constants.GA_MINE_CLAIMED_ERROR })
  })
)

export const setLandOwnerDrawerPayload = pipe(({ state }, payload: LandOwnerDrawerType) => {
  state.main.landOwnerDrawerPayload = payload
})

export const setIsLandOwnerAddSlotDrawerOpen = pipe(({ state }: Context, isOpen: boolean) => {
  state.main.isLandOwnerAddSlotDrawerOpen = isOpen
})

export const toggleCompactSidebar = pipe(
  ({ state }: Context, forceState: boolean | null = null) => {
    const newState = forceState !== null ? forceState : !state.main.isCompactSidebar

    state.main.isCompactSidebar = newState
  }
)

export const storeOnboardingNewsletterWasShown = pipe(
  ({ state }: Context, shown: boolean = false) => {
    localStorage.setItem('alienworlds-onboarding-newsletter', shown ? 'true' : 'false')
    state.missions.newsletterOnboardingWasShown = shown
  }
)

export const setOutPostModalsActive = pipe(({ state }: Context, shown: boolean = false) => {
  state.main.isOutPostModalsActive = shown
})

export * as glossary from './actions/glossary'
export * as mining from './actions/mining'
