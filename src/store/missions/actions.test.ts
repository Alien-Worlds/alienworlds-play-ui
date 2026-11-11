import { BigNumber } from 'ethers'
import {
  buildExplorer,
  buildInvestInfo,
  buildMission,
  buildPinata,
  buildUserWallet,
} from 'features/missions/testUtils/fixtures'
import { DateTime } from 'luxon'
import { createOvermindMock } from 'overmind'
import { namespaced } from 'overmind/config'
import { useModalStore } from 'shared/store/modalStore'
import { collectEvent } from 'shared/util/analytics'
import { Constants } from 'shared/util/constants'
import { getDefaultSyncAi } from 'store/main/helpers'
import * as missions from 'store/missions'
import { Mission, MissionStatus, SortBy } from 'store/missions/types'
import * as web3 from 'store/web3'

// Characterisation tests for the Overmind `missions` and `web3` namespaces: what each action
// reads and writes today, so the move to Zustand can be checked against them. They run the real
// namespaces with a stub `main` (only `syncAi`); the full config pulls in the Wharf wallets.

const mockLocation = { pathname: '/missions' }
jest.mock('routes', () => ({
  router: {
    state: {
      get location() {
        return mockLocation
      },
    },
  },
}))
jest.mock('shared/util/analytics', () => ({ collectEvent: jest.fn() }))
jest.mock('shared/util/config', () => ({
  config: {
    ...jest.requireActual('shared/util/config').config,
    IpfsApiUrl: 'https://ipfs.test',
    MissionsApiUrl: 'https://missions.test',
  },
}))

const mockCollectEvent = collectEvent as jest.Mock

// Every sync due now, so shouldExecute lets the loaders run.
const dueSyncAi = () => {
  const syncAi = getDefaultSyncAi()
  Object.values(syncAi).forEach((info) => {
    info.executeAfter = DateTime.now().minus({ minutes: 1 })
  })
  return syncAi
}

const notDueSyncAi = () => {
  const syncAi = getDefaultSyncAi()
  Object.values(syncAi).forEach((info) => {
    info.executeAfter = DateTime.now().plus({ minutes: 10 })
  })
  return syncAi
}

type Setup = {
  missionsState?: Record<string, any>
  web3State?: Record<string, any>
  missionsApi?: Record<string, any>
  web3Api?: Record<string, any>
  syncAi?: ReturnType<typeof getDefaultSyncAi>
}

const setup = ({
  missionsState = {},
  web3State = {},
  missionsApi = {},
  web3Api = {},
  syncAi = dueSyncAi(),
}: Setup = {}) => {
  const config = namespaced({ missions, web3, main: { state: { syncAi } } })
  // createOvermindMock throws on effects that aren't passed, so every one a test can reach is here.
  // Overmind wraps them, so tests assert on these objects, not on `overmind.effects`.
  const api = {
    missions: {
      initialize: jest.fn(),
      getRecentMissions: jest.fn(async () => []),
      getExplorer: jest.fn(async () => null),
      getTemplatePinatas: jest.fn(async () => []),
      mapPinatasToMissions: missions.effects.api.mapPinatasToMissions,
      ...missionsApi,
    },
    web3: {
      initialize: jest.fn(),
      getNfts: jest.fn(async () => null),
      getAllowance: jest.fn(async () => BigNumber.from(0)),
      setAllowance: jest.fn(async () => {}),
      joinMission: jest.fn(async () => {}),
      getMissionRewards: jest.fn(async () => null),
      claimMissionRewards: jest.fn(async () => {}),
      getBscTlmBalance: jest.fn(async () => BigNumber.from(0)),
      ...web3Api,
    },
  }
  const overmind = createOvermindMock(
    config as any,
    { missions: { api: api.missions }, web3: { api: api.web3 } },
    (state: any) => {
      Object.assign(state.missions, missionsState)
      Object.assign(state.web3, web3State)
    }
  ) as any

  return {
    actions: overmind.actions.missions,
    web3Actions: overmind.actions.web3,
    state: overmind.state.missions,
    web3State: overmind.state.web3,
    syncAi: overmind.state.main.syncAi,
    api,
  }
}

const ids = (list: Mission[]) => (list ? list.map((m) => m.id) : list)

// Lets the action's awaited effects settle; Overmind's wait/debounce need the timers moved too.
const flush = async () => {
  for (let i = 0; i < 20; i += 1) {
    // eslint-disable-next-line no-await-in-loop
    await Promise.resolve()
  }
}

const advance = async (ms: number) => {
  await flush()
  jest.advanceTimersByTime(ms)
  await flush()
}

beforeEach(() => {
  mockLocation.pathname = '/missions'
  mockCollectEvent.mockClear()
  useModalStore.setState({ isMainDrawerOpen: false })
  localStorage.clear()
})

afterEach(() => {
  jest.useRealTimers()
})

describe('missions.onInitializeOvermind', () => {
  it('restores the newsletter flag and subscribed email from localStorage', async () => {
    localStorage.setItem('alienworlds-missions-newsletter', 'true')
    localStorage.setItem('alienworlds-missions-email', 'me@example.com')
    const { actions, state, api } = setup()

    await actions.onInitializeOvermind()

    expect(state.newsletterWasShown).toBe(true)
    expect(state.subscribedEmail).toBe('me@example.com')
    expect(api.missions.initialize).toHaveBeenCalledTimes(1)
  })

  it('leaves them unset when nothing is stored', async () => {
    const { actions, state } = setup()

    await actions.onInitializeOvermind()

    expect(state.newsletterWasShown).toBe(false)
    expect(state.subscribedEmail).toBeNull()
  })
})

describe('missions derived state', () => {
  it('has no explorer missions without an explorer', () => {
    expect(setup().state.explorerMissions).toBeNull()
  })

  it('lists the departed explorer missions, soonest to finish first, as current', () => {
    const later = buildMission({ id: '1', status: MissionStatus.Departed })
    later.view.time = 900
    const sooner = buildMission({ id: '2', status: MissionStatus.Departed })
    sooner.view.time = 100
    const boarding = buildMission({ id: '3', status: MissionStatus.Boarding })

    const { state } = setup({
      missionsState: { explorer: buildExplorer([later, sooner, boarding]) },
    })

    expect(ids(state.explorerMissions)).toEqual(['1', '2', '3'])
    expect(ids(state.currentMissions)).toEqual(['2', '1'])
  })

  it('lists the boarding recent missions as available', () => {
    const { state } = setup({
      missionsState: {
        recentMissions: [
          buildMission({ id: '1', status: MissionStatus.Boarding }),
          buildMission({ id: '2', status: MissionStatus.Soon }),
          buildMission({ id: '3', status: MissionStatus.Boarding }),
        ],
      },
    })

    expect(ids(state.availableMissions)).toEqual(['1', '3'])
  })

  it('totals the rewards of the current missions for the ships sent', () => {
    const { state } = setup({
      missionsState: {
        explorer: buildExplorer([
          buildMission({
            id: '1',
            status: MissionStatus.Departed,
            attributes: { reward: 1000000, totalShips: 10 },
            investInfo: buildInvestInfo({ numberOfShips: 2 }),
          }),
          buildMission({
            id: '2',
            status: MissionStatus.Departed,
            attributes: { reward: 500000, totalShips: 5 },
          }),
          buildMission({
            id: '3',
            status: MissionStatus.Completed,
            attributes: { reward: 1000000, totalShips: 1 },
            investInfo: buildInvestInfo({ numberOfShips: 1 }),
          }),
        ]),
      },
    })

    // Mission 1: 1,000,000 / 10 ships * 2 sent / 10,000. Mission 2 sent none; 3 isn't current.
    expect(state.totalMissionsRewards).toBe(20)
  })
})

describe('missions.setSelectedMission', () => {
  it('clears the selection without an id', () => {
    const { actions, state } = setup({ missionsState: { selectedMission: buildMission() } })

    actions.setSelectedMission()

    expect(state.selectedMission).toBeNull()
  })

  it("prefers the explorer's copy (with invest info) over the recent one", () => {
    const recent = buildMission({ id: '7' })
    const joined = buildMission({ id: '7', investInfo: buildInvestInfo({ numberOfShips: 4 }) })
    const { actions, state } = setup({
      missionsState: {
        selectedMissionId: '7',
        recentMissions: [recent],
        explorer: buildExplorer([joined]),
      },
    })

    actions.setSelectedMission()

    expect(state.selectedMission.id).toBe('7')
    expect(state.selectedMission.attributes.investInfo.numberOfShips).toBe(4)
    expect(state.selectedMission.view.status).toBe(MissionStatus.Boarding)
  })

  it('falls back to the recent missions, and clears when neither has it', () => {
    const recentMissions = [buildMission({ id: '8' })]

    const found = setup({ missionsState: { selectedMissionId: '8', recentMissions } })
    found.actions.setSelectedMission()
    expect(found.state.selectedMission.id).toBe('8')

    const missing = setup({
      missionsState: { selectedMissionId: '9', recentMissions, selectedMission: buildMission() },
    })
    missing.actions.setSelectedMission()
    expect(missing.state.selectedMission).toBeNull()
  })
})

describe('missions.initializeOrReloadRecentMissions', () => {
  it('does nothing off the missions pages while the main drawer is closed', async () => {
    mockLocation.pathname = '/mining'
    const getRecentMissions = jest.fn(async () => [])
    const { actions } = setup({ missionsApi: { getRecentMissions } })

    await actions.initializeOrReloadRecentMissions()

    expect(getRecentMissions).not.toHaveBeenCalled()
  })

  it('loads off the missions pages when the main drawer is open', async () => {
    mockLocation.pathname = '/mining'
    useModalStore.setState({ isMainDrawerOpen: true })
    const getRecentMissions = jest.fn(async () => [buildMission({ raw: true })])
    const { actions, state } = setup({ missionsApi: { getRecentMissions } })

    await actions.initializeOrReloadRecentMissions()

    expect(getRecentMissions).toHaveBeenCalled()
    expect(ids(state.recentMissions)).toEqual(['1'])
  })

  it('loads the missions with their template NFT and view, then waits 5 minutes', async () => {
    const template = buildPinata({ series: 1, cardNumber: 1 })
    const courierRun = buildMission({
      raw: true,
      id: '3',
      pinataNft: null,
      attributes: {
        name: 'Courier Run',
        nftTokenURI: 'QmeixndncUVp435QZeEWipHCHgAVbjeJpZ8Ja5MjcaTGe5',
      },
    })
    const { actions, state, web3State, syncAi } = setup({
      missionsState: { templatePinatas: [buildPinata({ series: 2, cardNumber: 1 }), template] },
      missionsApi: { getRecentMissions: jest.fn(async () => [courierRun]) },
    })

    await actions.initializeOrReloadRecentMissions()

    expect(state.recentMissions[0].pinataNft).toEqual(template)
    expect(state.recentMissions[0].view.status).toBe(MissionStatus.Boarding)
    expect(web3State.isSync).toBe(true)
    expect(syncAi.recentMissions.isInProgress).toBe(false)
    expect(syncAi.recentMissions.executeAfter > DateTime.now().plus({ minutes: 4 })).toBe(true)
  })

  it('skips the reload until it is due, once synced', async () => {
    const getRecentMissions = jest.fn(async () => [])
    const { actions } = setup({
      web3State: { isSync: true },
      missionsApi: { getRecentMissions },
      syncAi: notDueSyncAi(),
    })

    await actions.initializeOrReloadRecentMissions()

    expect(getRecentMissions).not.toHaveBeenCalled()
  })

  it('asks for a re-sort when a reload brings a different list', async () => {
    const { actions, state } = setup({
      missionsState: { recentMissions: [buildMission({ id: '1' })] },
      missionsApi: {
        getRecentMissions: jest.fn(async () => [
          buildMission({ raw: true, id: '2' }),
          buildMission({ raw: true, id: '1' }),
        ]),
      },
    })

    await actions.initializeOrReloadRecentMissions()

    expect(ids(state.recentMissions)).toEqual(['2', '1'])
    expect(state.triggerFilterAndSortMissions).toBe(true)
  })

  it('keeps the current list (and order) when the ids are unchanged', async () => {
    const existing = [buildMission({ id: '1' }), buildMission({ id: '2' })]
    const { actions, state } = setup({
      missionsState: { recentMissions: existing },
      missionsApi: {
        getRecentMissions: jest.fn(async () => [
          buildMission({ raw: true, id: '1', attributes: { name: 'Renamed' } }),
          buildMission({ raw: true, id: '2' }),
        ]),
      },
    })

    await actions.initializeOrReloadRecentMissions()

    expect(state.recentMissions[0].attributes.name).toBe('Mission 1')
    expect(state.triggerFilterAndSortMissions).toBe(false)
  })

  it('keeps the old list and frees the sync when the API fails', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {})
    const { actions, state, syncAi } = setup({
      missionsState: { recentMissions: [buildMission({ id: '1' })] },
      missionsApi: { getRecentMissions: jest.fn(async () => null) },
    })

    await actions.initializeOrReloadRecentMissions()

    expect(ids(state.recentMissions)).toEqual(['1'])
    expect(syncAi.recentMissions.isInProgress).toBe(false)
  })
})

describe('missions.initializeOrReloadExplorerMissions', () => {
  it('builds a demo explorer from the recent missions without a BSC wallet', async () => {
    const recent = [
      buildMission({ id: '1', investInfo: buildInvestInfo({ totalStakeTLM: 30000 }) }),
      buildMission({ id: '2' }),
    ]
    const getExplorer = jest.fn()
    const { actions, state, web3State } = setup({
      missionsState: { recentMissions: recent },
      web3State: { userWallet: null },
      missionsApi: { getExplorer },
    })

    await actions.initializeOrReloadExplorerMissions()

    expect(getExplorer).not.toHaveBeenCalled()
    expect(state.explorer.id).toBe('demoExplorer')
    expect(ids(state.explorerMissions)).toEqual(['1', '2'])
    expect(state.triggerFilterAndSortMissions).toBe(true)
    expect(web3State.bscStakedTlmBalance).toBe(30000)
  })

  it("loads the connected wallet's explorer, totals its staked TLM and waits a minute", async () => {
    const wallet = buildUserWallet('0xwallet')
    const explorer = buildExplorer([
      buildMission({ raw: true, id: '1', investInfo: buildInvestInfo({ totalStakeTLM: 20000 }) }),
      buildMission({ raw: true, id: '2', investInfo: buildInvestInfo({ totalStakeTLM: 5000 }) }),
      buildMission({
        raw: true,
        id: '3',
        investInfo: buildInvestInfo({ totalStakeTLM: 70000, withdrawn: true }),
      }),
    ])
    const getExplorer = jest.fn(async () => explorer)
    const { actions, state, web3State, syncAi } = setup({
      web3State: { userWallet: wallet },
      missionsApi: { getExplorer },
    })

    await actions.initializeOrReloadExplorerMissions()

    expect(getExplorer).toHaveBeenCalledWith('0xwallet')
    expect(ids(state.explorerMissions)).toEqual(['1', '2', '3'])
    expect(state.explorerMissions[0].view.status).toBe(MissionStatus.Boarding)
    expect(state.triggerFilterAndSortMissions).toBe(true)
    // Withdrawn stakes don't count.
    expect(web3State.bscStakedTlmBalance).toBe(25000)
    expect(web3State.isSync).toBe(true)
    expect(syncAi.explorer.isInProgress).toBe(false)
    expect(syncAi.explorer.executeAfter > DateTime.now().plus({ seconds: 50 })).toBe(true)
  })

  it('runs on other pages too, except Profile → Balances with the drawer closed', async () => {
    const getExplorer = jest.fn(async () => buildExplorer([]))
    const wallet = buildUserWallet()

    mockLocation.pathname = '/mining'
    await setup({
      web3State: { userWallet: wallet },
      missionsApi: { getExplorer },
    }).actions.initializeOrReloadExplorerMissions()
    expect(getExplorer).toHaveBeenCalledTimes(1)

    mockLocation.pathname = '/profile/balances'
    await setup({
      web3State: { userWallet: wallet },
      missionsApi: { getExplorer },
    }).actions.initializeOrReloadExplorerMissions()
    expect(getExplorer).toHaveBeenCalledTimes(1)
  })

  it('skips the reload until it is due, once synced', async () => {
    const getExplorer = jest.fn()
    const { actions } = setup({
      web3State: { userWallet: buildUserWallet(), isSync: true },
      missionsApi: { getExplorer },
      syncAi: notDueSyncAi(),
    })

    await actions.initializeOrReloadExplorerMissions()

    expect(getExplorer).not.toHaveBeenCalled()
  })

  it('keeps the same explorer when its id and missions are unchanged', async () => {
    const current = buildExplorer([buildMission({ id: '1', attributes: { name: 'Kept' } })])
    const { actions, state } = setup({
      missionsState: { explorer: current },
      web3State: { userWallet: buildUserWallet() },
      missionsApi: {
        getExplorer: jest.fn(async () => buildExplorer([buildMission({ raw: true, id: '1' })])),
      },
    })

    await actions.initializeOrReloadExplorerMissions()

    expect(state.explorerMissions[0].attributes.name).toBe('Kept')
    expect(state.triggerFilterAndSortMissions).toBe(false)
  })

  it('retries every tick when the explorer API fails, until anything has synced', async () => {
    const getExplorer = jest.fn(async () => null)
    const { actions, state } = setup({
      web3State: { userWallet: buildUserWallet(), isSync: false },
      missionsApi: { getExplorer },
    })

    await actions.initializeOrReloadExplorerMissions()
    await actions.initializeOrReloadExplorerMissions()

    expect(state.explorer).toBeUndefined()
    expect(getExplorer).toHaveBeenCalledTimes(2)
  })

  // It used to return still in progress, so once synced it never loaded again until
  // reloadMissions.
  it('keeps the loaded explorer and retries in 10 seconds after a failure once synced', async () => {
    const current = buildExplorer([buildMission({ id: '1' })])
    const getExplorer = jest.fn(async () => null)
    const { actions, state, syncAi } = setup({
      missionsState: { explorer: current },
      web3State: { userWallet: buildUserWallet(), isSync: true },
      missionsApi: { getExplorer },
    })

    await actions.initializeOrReloadExplorerMissions()
    await actions.initializeOrReloadExplorerMissions()

    expect(getExplorer).toHaveBeenCalledTimes(1)
    expect(ids(state.explorerMissions)).toEqual(['1'])
    expect(syncAi.explorer.isInProgress).toBe(false)
    expect(syncAi.explorer.executeAfter > DateTime.now().plus({ seconds: 5 })).toBe(true)
    expect(syncAi.explorer.executeAfter < DateTime.now().plus({ seconds: 15 })).toBe(true)
  })

  it('loads again once the retry is due', async () => {
    const getExplorer = jest
      .fn()
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(buildExplorer([buildMission({ raw: true, id: '2' })]))
    jest.useFakeTimers()
    const { actions, state } = setup({
      web3State: { userWallet: buildUserWallet(), isSync: true },
      missionsApi: { getExplorer },
    })

    await actions.initializeOrReloadExplorerMissions()
    await actions.initializeOrReloadExplorerMissions()
    expect(getExplorer).toHaveBeenCalledTimes(1)

    jest.setSystemTime(Date.now() + 11_000)
    await actions.initializeOrReloadExplorerMissions()

    expect(getExplorer).toHaveBeenCalledTimes(2)
    expect(ids(state.explorerMissions)).toEqual(['2'])
  })
})

describe('missions.initializeOrReloadNfts', () => {
  it('loads nothing off the missions pages (the action then waits for template NFTs)', async () => {
    mockLocation.pathname = '/mining'
    const getTemplatePinatas = jest.fn(async () => [buildPinata()])
    const getNfts = jest.fn()
    const { actions, state } = setup({ missionsApi: { getTemplatePinatas }, web3Api: { getNfts } })

    // Not awaited: the pipe's waitUntil(templatePinatas) never resolves here.
    actions.initializeOrReloadNfts()
    await flush()

    expect(getTemplatePinatas).not.toHaveBeenCalled()
    expect(getNfts).not.toHaveBeenCalled()
    expect(state.nfts).toBeNull()
  })

  it('shows the template NFTs, on the AW IPFS gateway, without a BSC wallet', async () => {
    const getTemplatePinatas = jest.fn(async () => [
      buildPinata({ name: 'A', image: 'https://ipfs.io/ipfs/Qm1' }),
      buildPinata({ name: 'B', image: 'https://ipfs.io/ipfs/Qm2' }),
    ])
    const getNfts = jest.fn()
    const { actions, state, web3State } = setup({
      missionsApi: { getTemplatePinatas },
      web3Api: { getNfts },
    })

    await actions.initializeOrReloadNfts()

    expect(getNfts).not.toHaveBeenCalled()
    expect(state.nfts.map((n: any) => n.image)).toEqual([
      'https://ipfs.test/Qm1',
      'https://ipfs.test/Qm2',
    ])
    expect(web3State.isSync).toBe(true)
  })

  it("loads the wallet's mission NFTs, reporting progress, then waits 2 hours", async () => {
    const templates = [buildPinata({ name: 'A' })]
    const owned = [buildPinata({ name: 'A' }), buildPinata({ name: 'A' })]
    const wallet = buildUserWallet('0xowner')
    const getNfts = jest.fn(async (_account, _provider, _templates, onTotal, onLoaded) => {
      onTotal(2)
      onLoaded(2)
      return owned
    })
    const { actions, state, web3State, syncAi } = setup({
      missionsState: { templatePinatas: templates },
      web3State: { userWallet: wallet },
      web3Api: { getNfts },
    })

    await actions.initializeOrReloadNfts()

    expect(getNfts).toHaveBeenCalledWith(
      '0xowner',
      wallet.provider,
      expect.anything(),
      expect.any(Function),
      expect.any(Function)
    )
    expect(state.nfts).toHaveLength(2)
    expect(web3State.totalMissionsNfts).toBe(2)
    expect(web3State.loadedMissionsNfts).toBe(2)
    expect(web3State.loadingProgressMissionsNfts).toBe(100)
    expect(syncAi.missionNfts.executeAfter > DateTime.now().plus({ minutes: 119 })).toBe(true)
  })

  it('loads the template NFTs only once', async () => {
    const getTemplatePinatas = jest.fn(async () => [buildPinata()])
    const { actions } = setup({
      missionsState: { templatePinatas: [buildPinata()] },
      missionsApi: { getTemplatePinatas },
    })

    await actions.initializeOrReloadTemplatePinatas()
    await actions.initializeOrReloadNfts()

    expect(getTemplatePinatas).not.toHaveBeenCalled()
  })
})

describe('missions.initializeOrReloadTemplatePinatas', () => {
  it('loads the template NFTs when there are none yet', async () => {
    const templates = [buildPinata({ name: 'A' })]
    const { actions, state } = setup({
      missionsApi: { getTemplatePinatas: jest.fn(async () => templates) },
    })

    await actions.initializeOrReloadTemplatePinatas()

    expect(state.templatePinatas).toEqual(templates)
  })
})

describe('missions.updateMissionsOnSecondTick', () => {
  it('counts the completed, unclaimed explorer missions to claim', () => {
    const { actions, state } = setup({
      missionsState: {
        explorer: buildExplorer([
          buildMission({ id: '1', status: MissionStatus.Completed, investInfo: buildInvestInfo() }),
          buildMission({
            id: '2',
            status: MissionStatus.Completed,
            investInfo: buildInvestInfo({ withdrawn: true }),
          }),
          buildMission({ id: '3', status: MissionStatus.Completed }),
          buildMission({ id: '4', status: MissionStatus.Departed, investInfo: buildInvestInfo() }),
        ]),
      },
    })

    actions.updateMissionsOnSecondTick()

    expect(state.missionsToClaimCount).toBe(1)
  })

  it('refreshes the views as time passes', () => {
    const stale = () => {
      const mission = buildMission({ id: '1', status: MissionStatus.Boarding })
      mission.view.timeLabel = 'stale'
      return mission
    }
    const { actions, state } = setup({
      missionsState: { recentMissions: [stale()], selectedMission: stale() },
    })

    actions.updateMissionsOnSecondTick()

    expect(state.recentMissions[0].view.timeLabel).toBe('Starting in:')
    expect(state.selectedMission.view.timeLabel).toBe('Starting in:')
  })

  it('does nothing off the missions pages', () => {
    mockLocation.pathname = '/mining'
    const { actions, state } = setup({
      missionsState: {
        explorer: buildExplorer([
          buildMission({ status: MissionStatus.Completed, investInfo: buildInvestInfo() }),
        ]),
      },
    })

    actions.updateMissionsOnSecondTick()

    expect(state.missionsToClaimCount).toBeNull()
  })
})

describe('missions.filterAndSortMissions', () => {
  const recent = () => [
    buildMission({ id: '2', attributes: { name: 'Bravo', reward: 30000 } }),
    buildMission({ id: '10', attributes: { name: 'Alpha', reward: 100000 } }),
    buildMission({ id: '1', attributes: { name: 'Charlie', reward: 200000 } }),
  ]

  const sort = async (sortBy: SortBy, reversed: boolean, extra: Record<string, any> = {}) => {
    jest.useFakeTimers()
    const ctx = setup({
      missionsState: {
        recentMissions: recent(),
        triggerFilterAndSortMissions: true,
        missionsFilter: { account: null, sortBy, reversed },
        ...extra,
      },
    })
    const done = ctx.actions.filterAndSortMissions()
    await advance(300)
    await done
    return ctx.state
  }

  it('sorts by id numerically, newest first by default', async () => {
    expect(ids((await sort(SortBy.Id, true)).filterredAndSortedMissions)).toEqual(['10', '2', '1'])
    expect(ids((await sort(SortBy.Id, false)).filterredAndSortedMissions)).toEqual(['1', '2', '10'])
  })

  it('sorts by name and by reward', async () => {
    expect(ids((await sort(SortBy.Name, false)).filterredAndSortedMissions)).toEqual([
      '10',
      '2',
      '1',
    ])
    expect(ids((await sort(SortBy.Rewards, false)).filterredAndSortedMissions)).toEqual([
      '2',
      '10',
      '1',
    ])
  })

  it('resets the trigger once sorted', async () => {
    expect((await sort(SortBy.Id, true)).triggerFilterAndSortMissions).toBe(false)
  })

  it("copies the explorer's invest info onto the matching recent missions", async () => {
    const state = await sort(SortBy.Id, true, {
      explorer: buildExplorer([
        buildMission({ id: '2', investInfo: buildInvestInfo({ numberOfShips: 6 }) }),
      ]),
    })

    const two = state.filterredAndSortedMissions.find((m: Mission) => m.id === '2')
    expect(two.attributes.investInfo.numberOfShips).toBe(6)
  })

  it('sorts the explorer missions on My Missions', async () => {
    mockLocation.pathname = '/missions/my'
    const state = await sort(SortBy.Id, false, {
      explorer: buildExplorer([buildMission({ id: '5' }), buildMission({ id: '4' })]),
    })

    expect(ids(state.filterredAndSortedMissions)).toEqual(['4', '5'])
  })

  it('shows an empty list right away when there are no missions', async () => {
    const { actions, state } = setup({
      missionsState: { recentMissions: null, triggerFilterAndSortMissions: true },
    })

    await actions.filterAndSortMissions()

    expect(state.filterredAndSortedMissions).toEqual([])
  })

  it('does nothing without the trigger, or on the details and inventory pages', async () => {
    const untriggered = setup({ missionsState: { recentMissions: recent() } })
    await untriggered.actions.filterAndSortMissions()
    expect(untriggered.state.filterredAndSortedMissions).toBeNull()

    mockLocation.pathname = '/missions/inventory'
    const inventory = setup({
      missionsState: { recentMissions: recent(), triggerFilterAndSortMissions: true },
    })
    await inventory.actions.filterAndSortMissions()
    expect(inventory.state.filterredAndSortedMissions).toBeNull()
    expect(inventory.state.triggerFilterAndSortMissions).toBe(true)
  })
})

describe('missions.reloadMissions', () => {
  it('clears the loaded missions, makes their syncs due now and re-sorts after 200ms', async () => {
    jest.useFakeTimers()
    const { actions, state, syncAi } = setup({
      missionsState: {
        recentMissions: [buildMission()],
        explorer: buildExplorer([buildMission()]),
        nfts: [buildPinata()],
      },
      syncAi: notDueSyncAi(),
    })

    const done = actions.reloadMissions()
    await flush()

    expect(state.recentMissions).toBeNull()
    expect(state.explorer).toBeNull()
    expect(state.nfts).toBeNull()
    ;['bscBalance', 'explorer', 'missionNfts', 'recentMissions'].forEach((key) => {
      expect(syncAi[key].executeAfter <= DateTime.now()).toBe(true)
      expect(syncAi[key].isInProgress).toBe(false)
    })
    expect(state.triggerFilterAndSortMissions).toBe(false)

    await advance(200)
    await done
    expect(state.triggerFilterAndSortMissions).toBe(true)
  })
})

describe('missions setters', () => {
  it('setMissionsFilter clears the sorted list, stores the filter and asks for a re-sort', async () => {
    const { actions, state } = setup({
      missionsState: { filterredAndSortedMissions: [buildMission()] },
    })
    const filter = { account: '0xabc', sortBy: SortBy.Name, reversed: false }

    await actions.setMissionsFilter(filter)

    expect(state.filterredAndSortedMissions).toBeNull()
    expect(state.missionsFilter).toEqual(filter)
    expect(state.account).toBe('0xabc')
    expect(state.triggerFilterAndSortMissions).toBe(true)
  })

  it('stores the tab, join step and ships count', async () => {
    const { actions, state } = setup()

    await actions.setSelectedMissionsTab(2)
    await actions.setJoinMissionStep(3)
    await actions.setMissionShipsCount(5)

    expect(state.selectedMissionsTab).toBe(2)
    expect(state.joinMissionStep).toBe(3)
    expect(state.missionShipsCount).toBe(5)
  })

  it('has the default filter: by id, newest first', () => {
    expect(setup().state.missionsFilter).toEqual({
      account: null,
      sortBy: SortBy.Id,
      reversed: true,
    })
  })
})

describe('missions.joinMission', () => {
  const wallet = buildUserWallet('0xjoiner')
  const joinSetup = (web3Api: Record<string, any> = {}) =>
    setup({
      missionsState: {
        selectedMission: buildMission({ id: '7', attributes: { spaceshipCost: 10000 } }),
        recentMissions: [buildMission()],
      },
      web3State: { userWallet: wallet },
      web3Api,
    })

  it('approves the TLM, waits, sends the spacecrafts, then reloads the missions', async () => {
    jest.useFakeTimers()
    const getAllowance = jest.fn(async () => BigNumber.from(5000))
    const setAllowance = jest.fn(async () => {})
    const joinMission = jest.fn(async () => {})
    const { actions, state } = joinSetup({ getAllowance, setAllowance, joinMission })
    const { provider } = wallet

    const done = actions.joinMission(3)
    await flush()

    expect(state.joinMissionStep).toBe(1)
    expect(state.missionShipsCount).toBe(3)
    expect(getAllowance).toHaveBeenCalledWith(provider, '0xjoiner')
    expect(setAllowance).toHaveBeenCalledWith(BigNumber.from(30000), provider)
    expect(joinMission).not.toHaveBeenCalled()
    expect(mockCollectEvent).toHaveBeenCalledWith({ name: Constants.GA_MISSIONS_JOIN })
    expect(mockCollectEvent).toHaveBeenCalledWith({ name: Constants.GA_MISSIONS_SET_ALLOWANCE })

    await advance(5000)
    expect(joinMission).toHaveBeenCalledWith('7', 3, provider)
    expect(state.joinMissionStep).toBe(3)
    expect(state.recentMissions).not.toBeNull()

    await advance(1000)
    expect(state.recentMissions).toBeNull()
    await advance(200)
    await expect(done).resolves.toBe(true)
    expect(mockCollectEvent).toHaveBeenCalledWith({ name: Constants.GA_MISSIONS_JOIN_SUCCESS })
  })

  it('skips the approval when the allowance already covers the cost', async () => {
    jest.useFakeTimers()
    const setAllowance = jest.fn()
    const { actions } = joinSetup({
      getAllowance: jest.fn(async () => BigNumber.from(30000)),
      setAllowance,
    })

    const done = actions.joinMission(3)
    await advance(5000)
    await advance(1000)
    await advance(200)
    await done

    expect(setAllowance).not.toHaveBeenCalled()
  })

  it('moves to the failed step and clears the ships when sending fails', async () => {
    jest.useFakeTimers()
    jest.spyOn(console, 'error').mockImplementation(() => {})
    const { actions, state } = joinSetup({
      getAllowance: jest.fn(async () => BigNumber.from(30000)),
      joinMission: jest.fn(async () => {
        throw new Error('user rejected')
      }),
    })

    const done = actions.joinMission(3)
    await advance(5000)

    await expect(done).resolves.toBe(false)
    expect(state.joinMissionStep).toBe(4)
    expect(state.missionShipsCount).toBeNull()
  })

  it('fails straight away when the approval is rejected', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {})
    const joinMission = jest.fn()
    const { actions, state } = joinSetup({
      setAllowance: jest.fn(async () => {
        throw new Error('user rejected')
      }),
      joinMission,
    })

    await expect(actions.joinMission(3)).resolves.toBe(false)
    expect(state.joinMissionStep).toBe(4)
    expect(joinMission).not.toHaveBeenCalled()
  })
})

describe('missions.loadMissionRewards', () => {
  it('loads the rewards for the mission, flagging while it loads', async () => {
    let resolve: (value: unknown) => void
    const getMissionRewards = jest.fn(
      () =>
        new Promise((r) => {
          resolve = r
        })
    )
    const wallet = buildUserWallet()
    const { actions, state } = setup({
      web3State: { userWallet: wallet },
      web3Api: { getMissionRewards },
    })

    const done = actions.loadMissionRewards('7')
    await flush()
    expect(state.missionRewardsLoading).toBe(true)

    resolve({ tlm: '12.5', nft: '1' })
    await done

    expect(getMissionRewards).toHaveBeenCalledWith('7', wallet.provider)
    expect(state.missionRewards).toEqual({ tlm: '12.5', nft: '1' })
    expect(state.missionRewardsLoading).toBe(false)
  })

  it('does nothing without a BSC wallet, and stops loading on an error', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {})
    const getMissionRewards = jest.fn(async () => {
      throw new Error('rpc down')
    })

    const noWallet = setup({ web3State: { userWallet: null }, web3Api: { getMissionRewards } })
    await noWallet.actions.loadMissionRewards('7')
    expect(getMissionRewards).not.toHaveBeenCalled()

    const failing = setup({
      web3State: { userWallet: buildUserWallet() },
      web3Api: { getMissionRewards },
    })
    await failing.actions.loadMissionRewards('7')
    expect(failing.state.missionRewardsLoading).toBe(false)
    expect(failing.state.missionRewards).toBeNull()
  })
})

describe('missions.claimMissionRewards', () => {
  it('claims, waits 8s, reloads the missions and shows the success message', async () => {
    jest.useFakeTimers()
    const claimMissionRewards = jest.fn(async () => {})
    const wallet = buildUserWallet()
    const { actions, state } = setup({
      missionsState: { recentMissions: [buildMission()] },
      web3State: { userWallet: wallet },
      web3Api: { claimMissionRewards },
    })

    const done = actions.claimMissionRewards('7')
    await flush()

    expect(state.loadingMessage).toBe('Claiming your Mission rewards..')
    expect(claimMissionRewards).toHaveBeenCalledWith('7', wallet.provider)
    expect(mockCollectEvent).toHaveBeenCalledWith({
      name: Constants.GA_MISSIONS_REWARDS_CLAIMED_SUCCESS,
    })

    await advance(8000)
    expect(state.loadingMessage).toBeNull()
    expect(state.infoMessage).toBe('Your Mission reward has been claimed.')
    expect(state.recentMissions).toBeNull()
    await advance(200)
    await expect(done).resolves.toBe(true)
  })

  it.each([
    ['User denied transaction signature', 'User denied transaction'],
    ['execution reverted', 'Error has occured!'],
  ])('shows an error for "%s" and reports failure', async (chainError, shown) => {
    jest.useFakeTimers()
    const { actions, state } = setup({
      missionsState: { recentMissions: [buildMission()] },
      web3State: { userWallet: buildUserWallet() },
      web3Api: {
        claimMissionRewards: jest.fn(async () => {
          throw new Error(chainError)
        }),
      },
    })

    const done = actions.claimMissionRewards('7')
    await advance(8000)

    await expect(done).resolves.toBe(false)
    expect(state.errorMessage).toBe(shown)
    expect(state.loadingMessage).toBeNull()
    expect(state.infoMessage).toBeNull()
    expect(state.recentMissions).not.toBeNull()
    expect(mockCollectEvent).toHaveBeenCalledWith({
      name: Constants.GA_MISSIONS_REWARDS_CLAIMED_ERROR,
    })
  })
})

describe('missions messages and newsletter', () => {
  it('clears the info and error messages', () => {
    const { actions, state } = setup({ missionsState: { infoMessage: 'i', errorMessage: 'e' } })

    actions.clearInfoMessage()
    actions.clearErrorMessage()

    expect(state.infoMessage).toBeNull()
    expect(state.errorMessage).toBeNull()
  })

  it('remembers that the newsletter was shown', () => {
    const { actions, state } = setup()

    actions.storeNewsletterWasShown()

    expect(state.newsletterWasShown).toBe(true)
    expect(localStorage.getItem('alienworlds-missions-newsletter')).toBe('true')
  })

  it('stores and removes the subscribed email, reporting each', () => {
    const { actions, state } = setup()

    actions.storeSubscribedEmail('me@example.com')
    expect(state.subscribedEmail).toBe('me@example.com')
    expect(localStorage.getItem('alienworlds-missions-email')).toBe('me@example.com')
    expect(mockCollectEvent).toHaveBeenCalledWith({ name: Constants.GA_MISSIONS_NEWSLETTER_SUB })

    actions.storeSubscribedEmail(null)
    expect(state.subscribedEmail).toBeNull()
    expect(localStorage.getItem('alienworlds-missions-email')).toBeNull()
    expect(mockCollectEvent).toHaveBeenCalledWith({ name: Constants.GA_MISSIONS_NEWSLETTER_UNSUB })
  })
})

describe('web3.onInitializeOvermind', () => {
  const init = () => {
    const ctx = setup({
      missionsState: {
        recentMissions: [buildMission()],
        selectedMission: buildMission({ id: '9' }),
      },
      syncAi: notDueSyncAi(),
    })
    ctx.web3Actions.onInitializeOvermind()
    const [[options]] = ctx.api.web3.initialize.mock.calls
    return { ...ctx, options }
  }

  it.each([
    ['connect', (options: any) => options.onConnectionSuccess('0x1'), '0x1'],
    ['account change', (options: any) => options.onAccountChanged('0x2'), '0x2'],
    ['disconnect', (options: any) => options.onDisconnect(), null],
  ])('stores the account and reloads the missions on %s', (_, fire, account) => {
    const { options, state, web3State } = init()

    fire(options)

    expect(web3State.account).toBe(account)
    expect(state.recentMissions).toBeNull()
  })

  it('reloads the missions and reports a chain change', () => {
    const { options, state } = init()

    options.onChainChanged()

    expect(state.recentMissions).toBeNull()
    expect(mockCollectEvent).toHaveBeenCalledWith({ name: Constants.GA_CHAIN_CHANGED })
  })

  it('makes the BSC balance and explorer due on a TLM transfer', () => {
    const { options, syncAi } = init()

    options.onInOutTransfer()

    expect(syncAi.bscBalance.executeAfter <= DateTime.now()).toBe(true)
    expect(syncAi.explorer.executeAfter <= DateTime.now()).toBe(true)
    expect(syncAi.missionNfts.executeAfter > DateTime.now()).toBe(true)
  })

  it('gives the API the selected mission', () => {
    expect(init().options.getSelectedMission().id).toBe('9')
  })
})

describe('web3 state and actions', () => {
  it('formats the BSC balances (4 decimals), or null without them', () => {
    const { web3State } = setup({
      web3State: { bscTlmBalance: BigNumber.from(123456789), bscStakedTlmBalance: 25000 },
    })
    expect(web3State.bscTlmBalanceFormatted).toBe('12,345.6789')
    expect(web3State.bscStakedTlmBalanceFormatted).toBe('2.5')

    const empty = setup().web3State
    expect(empty.bscTlmBalanceFormatted).toBeNull()
    expect(empty.bscStakedTlmBalanceFormatted).toBeNull()
  })

  it('stores the wallet, auto-connect and sync flags, and NFT progress', async () => {
    const { web3Actions, web3State } = setup()
    const wallet = buildUserWallet()

    await web3Actions.setWallet(wallet)
    await web3Actions.setIsAutoConnect(false)
    await web3Actions.setIsSync(true)
    web3Actions.updateTotalMissionsNfts(8)
    web3Actions.updateLoadedMissionsNfts(2)

    expect(web3State.userWallet).toEqual(wallet)
    expect(web3State.isAutoConnect).toBe(false)
    expect(web3State.isSync).toBe(true)
    expect(web3State.loadingProgressMissionsNfts).toBe(25)
  })

  it('clears the account on disconnect', () => {
    const { web3Actions, web3State } = setup({ web3State: { account: '0x1' } })

    web3Actions.disconnectProvider()

    expect(web3State.account).toBeNull()
  })

  it('loads the BSC TLM balance for the wallet and waits a minute', async () => {
    const wallet = buildUserWallet('0xbal')
    const getBscTlmBalance = jest.fn(async () => BigNumber.from(50000))
    const { web3Actions, web3State, syncAi } = setup({
      web3State: { userWallet: wallet },
      web3Api: { getBscTlmBalance },
    })

    await web3Actions.initializeOrReloadBscBalance()

    expect(getBscTlmBalance).toHaveBeenCalledWith(wallet.provider, '0xbal')
    expect(web3State.bscTlmBalanceFormatted).toBe('5.0')
    expect(syncAi.bscBalance.executeAfter > DateTime.now().plus({ seconds: 50 })).toBe(true)
  })

  it('clears the BSC TLM balance without a wallet', async () => {
    const getBscTlmBalance = jest.fn()
    const { web3Actions, web3State } = setup({
      web3State: { userWallet: null, bscTlmBalance: BigNumber.from(1) },
      web3Api: { getBscTlmBalance },
    })

    await web3Actions.initializeOrReloadBscBalance()

    expect(getBscTlmBalance).not.toHaveBeenCalled()
    expect(web3State.bscTlmBalance).toBeNull()
  })
})
