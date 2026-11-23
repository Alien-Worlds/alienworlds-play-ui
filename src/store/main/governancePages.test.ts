import { createOvermind, createOvermindMock } from 'overmind'
import { namespaced } from 'overmind/config'
import { useModalStore } from 'shared/store/modalStore'
import { collectEvent } from 'shared/util/analytics'
import * as mainActions from 'store/main/actions'
import { getDefaultSyncAi } from 'store/main/helpers'
import * as wax from 'store/wax'
import { RequestState } from 'store/wax/types'

// Characterisation tests for the syndicates parts of Overmind's `main` namespace: the
// `showGovernance*` page actions the syndicates pages call on mount, and the 1s runtime tick that
// expires the member-terms signing flag and the vote progress. They run those real `main` actions
// against the real `wax` namespace; `updateWorld` (the loaders) is stubbed out.

jest.mock('@wharfkit/session', () => ({
  __esModule: true,
  default: function SessionKit() {},
  Session: function Session() {},
  APIClient: function APIClient() {},
  Serializer: {},
}))
jest.mock('@wharfkit/wallet-plugin-anchor', () => ({ WalletPluginAnchor: function Anchor() {} }))
jest.mock('@wharfkit/wallet-plugin-cloudwallet', () => ({
  WalletPluginCloudWallet: function CloudWallet() {},
}))
jest.mock('@wharfkit/wallet-plugin-wombat', () => ({ WalletPluginWombat: function Wombat() {} }))
jest.mock('@eoscafe/hyperion', () => ({ JsonRpc: function JsonRpc() {} }))
jest.mock('@waxio/waxjs/dist', () => ({ WaxJS: function WaxJS() {} }))
jest.mock('eosjs', () => ({ JsonRpc: function JsonRpc() {}, Serialize: {} }))

const mockNavigate = jest.fn()
jest.mock('routes', () => ({
  router: {
    navigate: (...args: unknown[]) => mockNavigate(...args),
    state: { location: { pathname: '/syndicates/kavian' } },
  },
}))
jest.mock('shared/util/analytics', () => ({ collectEvent: jest.fn() }))
jest.mock('shared/util/config', () => ({
  config: {
    ...jest.requireActual('shared/util/config').config,
    ActiveDacIds: 'eyeke,kavian,magor,naron,nerix,veles,eyekeunn,kavianunn',
  },
}))

const mockCollectEvent = collectEvent as jest.Mock

const {
  showGovernancePage,
  showGovernanceDetailsPage,
  showGovernanceDaoSelect,
  showGovernanceBecomeCandidatePage,
  showGovernanceManageCandidacyPage,
  showGovernanceMemberTerms,
  showGovernanceSignCandidateVotePage,
  showGovernanceCustodianDashboard,
  onInitializeOvermind,
} = mainActions

const setup = (waxState: Record<string, any> = {}) => {
  const config = namespaced({
    wax,
    main: {
      state: { syncAi: getDefaultSyncAi() },
      actions: {
        showGovernancePage,
        showGovernanceDetailsPage,
        showGovernanceDaoSelect,
        showGovernanceBecomeCandidatePage,
        showGovernanceManageCandidacyPage,
        showGovernanceMemberTerms,
        showGovernanceSignCandidateVotePage,
        showGovernanceCustodianDashboard,
      },
    },
  })
  const overmind = createOvermindMock(
    config as any,
    { wax: { api: { initialize: jest.fn() } } },
    (state: any) => {
      Object.assign(state.wax, { walletId: 'voter.wam', ...waxState })
    }
  ) as any

  return {
    actions: overmind.actions.main,
    wax: overmind.state.wax,
  }
}

// The tick mutates state from an effect callback, after onInitializeOvermind has returned. The
// mock's dev-mode proxy rejects that, so these run on a real (non-dev-mode) Overmind instead.
const setupRuntime = async (
  waxState: Record<string, any> = {},
  mainState: Record<string, any> = {}
) => {
  let runtime: { onRuntimeTick: () => Promise<void> } = null
  const updateWorld = jest.fn()
  const overmind = createOvermind(
    namespaced({
      wax: {
        ...wax,
        state: { ...wax.state, walletId: 'voter.wam', ...waxState },
        effects: { api: { initialize: () => {} } },
      },
      main: {
        state: {
          syncAi: getDefaultSyncAi(),
          runtimeInSeconds: 0,
          isSigningDACTerms: false,
          autoExpireSigningDACTerms: null,
          autoExpireVoteDACCandidates: null,
          ...mainState,
        },
        actions: { onInitializeOvermind, updateWorld },
        effects: {
          api: {
            initialize: (options: typeof runtime) => {
              runtime = options
            },
          },
        },
      },
    }) as any,
    { devtools: false }
  ) as any
  await overmind.initialized

  return {
    wax: overmind.state.wax,
    main: overmind.state.main,
    updateWorld,
    tick: () => runtime.onRuntimeTick(),
  }
}

const flush = async () => {
  for (let i = 0; i < 10; i += 1) {
    // eslint-disable-next-line no-await-in-loop
    await Promise.resolve()
  }
}

const visit = (location: string, fields: Record<string, unknown> = {}) => ({
  name: 'page_visit',
  fields: { location, ...fields },
})

beforeEach(() => {
  useModalStore.setState({ isMainDrawerOpen: true })
  jest.spyOn(console, 'error').mockImplementation(() => {})
})

afterEach(() => {
  jest.restoreAllMocks()
})

describe('main.showGovernancePage', () => {
  it('closes the main drawer and reports a visit with the selected planet', () => {
    const { actions } = setup({ selectedDacId: 'kavian' })

    actions.showGovernancePage()

    expect(useModalStore.getState().isMainDrawerOpen).toBe(false)
    expect(mockCollectEvent).toHaveBeenCalledWith(visit('/syndicates', { planet: 'kavian' }))
  })
})

describe('main.showGovernance*Page with a planet id', () => {
  it.each([
    ['showGovernanceDetailsPage', '/syndicates/:planetId'],
    ['showGovernanceBecomeCandidatePage', '/syndicates/:planetId/register'],
    ['showGovernanceMemberTerms', '/syndicates/:planetId/memberterms'],
  ])('%s selects a valid planet and reports a visit to %s', (action, location) => {
    const { actions, wax } = setup()

    actions[action]('kavian')

    expect(wax.selectedDacId).toBe('kavian')
    expect(useModalStore.getState().isMainDrawerOpen).toBe(false)
    expect(mockNavigate).not.toHaveBeenCalled()
    // userStakedDAOTokens is never written, so stakedTokens is always 0.
    expect(mockCollectEvent).toHaveBeenCalledWith(
      visit(location, { planet: 'kavian', stakedTokens: 0 })
    )
  })

  it.each([
    'showGovernanceDetailsPage',
    'showGovernanceBecomeCandidatePage',
    'showGovernanceMemberTerms',
  ])('%s sends an unknown planet back to planet select', (action) => {
    const { actions, wax } = setup({ selectedDacId: 'naron' })

    actions[action]('pluto')

    expect(wax.selectedDacId).toBe('naron')
    expect(mockNavigate).toHaveBeenCalledWith('/syndicates')
    expect(mockCollectEvent).toHaveBeenCalledWith(visit('/syndicates', { planet: 'naron' }))
  })

  it('accepts union ids and any case', () => {
    const { actions, wax } = setup()

    actions.showGovernanceDetailsPage('KavianUnn')

    expect(wax.selectedDacId).toBe('KavianUnn')
  })

  it('the details page resets the (unused) proposals filter to newest id first', () => {
    const { actions, wax } = setup({ proposalsFilter: { sortBy: 3, reversed: false } })

    actions.showGovernanceDetailsPage('kavian')

    expect(wax.proposalsFilter).toEqual({ sortBy: 0, reversed: true })
  })
})

describe('main.showGovernanceDaoSelect', () => {
  it('selects the planet but reports the visit as the details page', () => {
    const { actions, wax } = setup()

    actions.showGovernanceDaoSelect('magor')

    expect(wax.selectedDacId).toBe('magor')
    expect(mockCollectEvent).toHaveBeenCalledWith(
      visit('/syndicates/:planetId', { planet: 'magor', stakedTokens: 0 })
    )
  })

  it('navigates to the unfilled /dao/:planetId pattern for an unknown planet', () => {
    const { actions } = setup()

    actions.showGovernanceDaoSelect('pluto')

    expect(mockNavigate).toHaveBeenCalledWith('/dao/:planetId')
  })
})

describe('main.showGovernanceSignCandidateVotePage', () => {
  it('selects the planet and the candidate from the URL', () => {
    const { actions, wax } = setup()

    actions.showGovernanceSignCandidateVotePage({ id: 'kavian', walletId: 'cand.wam' })

    expect(wax.selectedDacId).toBe('kavian')
    expect(wax.selectedDacCandidateWalletId).toBe('cand.wam')
    expect(mockCollectEvent).toHaveBeenCalledWith(
      visit('/syndicates/:planetId/signcandidatevote', { planet: 'kavian', stakedTokens: 0 })
    )
  })

  it('clears the candidate on the list URL', () => {
    const { actions, wax } = setup({ selectedDacCandidateWalletId: 'cand.wam' })

    actions.showGovernanceSignCandidateVotePage({ id: 'kavian', walletId: undefined })

    expect(wax.selectedDacCandidateWalletId).toBeUndefined()
  })

  it('keeps the previous candidate for an unknown planet', () => {
    const { actions, wax } = setup({ selectedDacCandidateWalletId: 'old.wam' })

    actions.showGovernanceSignCandidateVotePage({ id: 'pluto', walletId: 'cand.wam' })

    expect(wax.selectedDacCandidateWalletId).toBe('old.wam')
    expect(mockNavigate).toHaveBeenCalledWith('/syndicates')
  })
})

describe('pages that wait for lists nothing fills', () => {
  it('showGovernanceManageCandidacyPage reports the visit, then waits forever for candidates', async () => {
    const { actions, wax } = setup()
    let done = false

    actions.showGovernanceManageCandidacyPage('kavian').then(() => {
      done = true
    })
    await flush()

    expect(wax.selectedDacId).toBe('kavian')
    expect(mockCollectEvent).toHaveBeenCalledWith(
      visit('/syndicates/:planetId/manage', { planet: 'kavian', stakedTokens: 0 })
    )
    expect(done).toBe(false)
  })

  it('showGovernanceCustodianDashboard never gets to reset the proposals filter', async () => {
    const { actions, wax } = setup({ proposalsFilter: { sortBy: 3, reversed: false } })

    actions.showGovernanceCustodianDashboard('kavian')
    await flush()

    expect(mockCollectEvent).toHaveBeenCalledWith(
      visit('/syndicates/:planetId/dashboard', { planet: 'kavian', stakedTokens: 0 })
    )
    expect(wax.proposalsFilter).toEqual({ sortBy: 3, reversed: false })
  })
})

describe('the 1s runtime tick', () => {
  it('counts seconds and runs updateWorld', async () => {
    const { main, updateWorld, tick } = await setupRuntime()

    await tick()
    await tick()

    expect(main.runtimeInSeconds).toBe(2)
    expect(updateWorld).toHaveBeenCalledTimes(2)
  })

  it('clears the member-terms signing flag once its countdown runs out', async () => {
    const { main, tick } = await setupRuntime(
      {},
      { isSigningDACTerms: true, autoExpireSigningDACTerms: 1 }
    )

    await tick()
    expect(main.autoExpireSigningDACTerms).toBe(0)
    expect(main.isSigningDACTerms).toBe(true)

    await tick()
    expect(main.autoExpireSigningDACTerms).toBeNull()
    expect(main.isSigningDACTerms).toBe(false)
  })

  it('resets the vote progress once its countdown runs out', async () => {
    const { main, wax, tick } = await setupRuntime(
      { actionProgressState: RequestState.InProgress },
      { autoExpireVoteDACCandidates: 1 }
    )

    await tick()
    expect(wax.actionProgressState).toBe(RequestState.InProgress)

    await tick()
    expect(main.autoExpireVoteDACCandidates).toBeNull()
    expect(wax.actionProgressState).toBeNull()
  })

  it('leaves the progress alone without a countdown (vote power staking sets none)', async () => {
    const { wax, tick } = await setupRuntime({ actionProgressState: RequestState.InProgress })

    await tick()
    await tick()

    expect(wax.actionProgressState).toBe(RequestState.InProgress)
  })
})
