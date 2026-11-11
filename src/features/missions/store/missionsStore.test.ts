import { BigNumber } from 'ethers'
import { getInitialBscWalletState, useBscWalletStore } from 'features/missions/store/bscWalletStore'
import {
  buildExplorer,
  buildInvestInfo,
  buildMission,
  buildPinata,
  buildUserWallet,
} from 'features/missions/testUtils/fixtures'
import { Mission, MissionStatus, SortBy } from 'features/missions/types/missionsTypes'
import * as bscContracts from 'features/missions/utils/bscContracts'
import * as missionsApi from 'features/missions/utils/missionsApi'
import { useModalStore } from 'shared/store/modalStore'
import {
  getInitialOverlayMessagesState,
  useOverlayMessagesStore,
} from 'shared/store/overlayMessagesStore'
import { collectEvent } from 'shared/util/analytics'
import { Constants } from 'shared/util/constants'

import {
  getInitialMissionsState,
  MissionsState,
  MissionsSyncKey,
  RETRY_AFTER_FAILURE_MS,
  useMissionsStore,
} from './missionsStore'

// The missions store: loaders and their schedule, the derived lists, the list sort, the timers,
// joining and claiming. Ported from the Overmind missions/web3 characterisation tests; where the
// behaviour changed in the move, the test says what it used to do.

jest.mock('features/missions/utils/missionsApi', () => ({
  ...jest.requireActual('features/missions/utils/missionsApi'),
  getRecentMissions: jest.fn(),
  getExplorer: jest.fn(),
  getTemplatePinatas: jest.fn(),
}))
jest.mock('features/missions/utils/bscContracts', () => ({
  getBscTlmBalance: jest.fn(),
  getAllowance: jest.fn(),
  setAllowance: jest.fn(),
  joinMission: jest.fn(),
  getMissionRewards: jest.fn(),
  claimMissionRewards: jest.fn(),
  getNfts: jest.fn(),
}))
jest.mock('shared/util/analytics', () => ({ collectEvent: jest.fn() }))

const api = missionsApi as jest.Mocked<typeof missionsApi>
const contracts = bscContracts as jest.Mocked<typeof bscContracts>
const mockCollectEvent = collectEvent as jest.Mock

const realMissions = useMissionsStore.getState()
const realWallet = useBscWalletStore.getState()

const MINUTE = 60 * 1000
const SYNC_KEYS: MissionsSyncKey[] = ['recentMissions', 'explorer', 'missionNfts', 'bscBalance']

const syncsDueIn = (ms: number) =>
  Object.fromEntries(
    SYNC_KEYS.map((key) => [key, { isInProgress: false, executeAfter: Date.now() + ms }])
  ) as MissionsState['syncs']

type Setup = {
  missions?: Partial<MissionsState>
  wallet?: Record<string, any>
  syncs?: MissionsState['syncs']
}

// Seeds the stores. Selecting the seeded mission id recomputes the derived fields (current and
// available missions, the selection, the count to claim) from the seeded explorer and missions.
const setup = ({ missions = {}, wallet = {}, syncs = syncsDueIn(-MINUTE) }: Setup = {}) => {
  useBscWalletStore.setState({ ...realWallet, ...getInitialBscWalletState(), ...wallet }, true)
  useMissionsStore.setState(
    { ...realMissions, ...getInitialMissionsState(), ...missions, syncs },
    true
  )
  useOverlayMessagesStore.setState(getInitialOverlayMessagesState())
  useMissionsStore.getState().selectMission(missions.selectedMissionId ?? null)
  return useMissionsStore.getState()
}

const state = () => useMissionsStore.getState()
const wallet = () => useBscWalletStore.getState()
const messages = () => useOverlayMessagesStore.getState()
const ids = (list: Mission[] | null) => (list ? list.map((m) => m.id) : list)

// Lets awaited mocks settle; the store's delays also need the timers moved.
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
  jest.clearAllMocks()
  api.getRecentMissions.mockResolvedValue([])
  api.getExplorer.mockResolvedValue(null)
  api.getTemplatePinatas.mockResolvedValue([])
  contracts.getAllowance.mockResolvedValue(BigNumber.from(0))
  contracts.getBscTlmBalance.mockResolvedValue(BigNumber.from(0))
  useModalStore.setState({ isMainDrawerOpen: false })
  localStorage.clear()
})

afterEach(() => {
  jest.useRealTimers()
})

describe('initial state', () => {
  it('restores the newsletter flag and subscribed email from localStorage', () => {
    localStorage.setItem('alienworlds-missions-newsletter', 'true')
    localStorage.setItem('alienworlds-missions-email', 'me@example.com')

    expect(getInitialMissionsState()).toMatchObject({
      newsletterWasShown: true,
      subscribedEmail: 'me@example.com',
    })
  })

  it('leaves them unset when nothing is stored', () => {
    expect(getInitialMissionsState()).toMatchObject({
      newsletterWasShown: false,
      subscribedEmail: null,
    })
  })

  it('has the default filter: by id, newest first', () => {
    expect(getInitialMissionsState().missionsFilter).toEqual({ sortBy: SortBy.Id, reversed: true })
  })
})

describe('derived missions', () => {
  it('has no explorer missions or count to claim without an explorer', () => {
    expect(setup()).toMatchObject({ explorerMissions: null, missionsToClaimCount: null })
  })

  it('lists the departed explorer missions, soonest to finish first, as current', () => {
    const later = buildMission({ id: '1', status: MissionStatus.Departed })
    later.view.time = 900
    const sooner = buildMission({ id: '2', status: MissionStatus.Departed })
    sooner.view.time = 100
    const boarding = buildMission({ id: '3', status: MissionStatus.Boarding })

    const { explorerMissions, currentMissions } = setup({
      missions: { explorer: buildExplorer([later, sooner, boarding]) },
    })

    expect(ids(explorerMissions)).toEqual(['1', '2', '3'])
    expect(ids(currentMissions)).toEqual(['2', '1'])
  })

  it('lists the boarding recent missions as available', () => {
    const { availableMissions } = setup({
      missions: {
        recentMissions: [
          buildMission({ id: '1', status: MissionStatus.Boarding }),
          buildMission({ id: '2', status: MissionStatus.Soon }),
          buildMission({ id: '3', status: MissionStatus.Boarding }),
        ],
      },
    })

    expect(ids(availableMissions)).toEqual(['1', '3'])
  })

  it('totals the rewards of the current missions for the ships sent', () => {
    const { totalMissionsRewards } = setup({
      missions: {
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
    expect(totalMissionsRewards).toBe(20)
  })

  // It used to be counted only on the missions pages' 1s tick.
  it('counts the completed, unclaimed explorer missions to claim', () => {
    const { missionsToClaimCount } = setup({
      missions: {
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

    expect(missionsToClaimCount).toBe(1)
  })
})

describe('selectMission', () => {
  it('clears the selection without an id', () => {
    setup({ missions: { recentMissions: [buildMission({ id: '7' })], selectedMissionId: '7' } })

    state().selectMission(null)

    expect(state().selectedMission).toBeNull()
  })

  it("prefers the explorer's copy (with invest info) over the recent one", () => {
    const { selectedMission } = setup({
      missions: {
        selectedMissionId: '7',
        recentMissions: [buildMission({ id: '7' })],
        explorer: buildExplorer([
          buildMission({ id: '7', investInfo: buildInvestInfo({ numberOfShips: 4 }) }),
        ]),
      },
    })

    expect(selectedMission.id).toBe('7')
    expect(selectedMission.attributes.investInfo.numberOfShips).toBe(4)
    expect(selectedMission.view.status).toBe(MissionStatus.Boarding)
  })

  it('falls back to the recent missions, and clears when neither has it', () => {
    const recentMissions = [buildMission({ id: '8' })]

    expect(setup({ missions: { selectedMissionId: '8', recentMissions } }).selectedMission.id).toBe(
      '8'
    )
    expect(
      setup({ missions: { selectedMissionId: '9', recentMissions } }).selectedMission
    ).toBeNull()
  })

  it('follows the missions as they load', async () => {
    setup({ missions: { selectedMissionId: '7' } })
    expect(state().selectedMission).toBeNull()

    api.getRecentMissions.mockResolvedValue([buildMission({ raw: true, id: '7' })])
    await state().loadRecentMissions('/missions/7')

    expect(state().selectedMission.id).toBe('7')
  })
})

describe('loadTemplatePinatas', () => {
  it('loads the template NFTs when there are none yet', async () => {
    const templates = [buildPinata({ name: 'A' })]
    api.getTemplatePinatas.mockResolvedValue(templates)
    setup()

    await expect(state().loadTemplatePinatas()).resolves.toEqual(templates)
    expect(state().templatePinatas).toEqual(templates)
  })

  it('loads them once, sharing a request in flight', async () => {
    setup()

    await Promise.all([state().loadTemplatePinatas(), state().loadTemplatePinatas()])
    await state().loadTemplatePinatas()

    expect(api.getTemplatePinatas).toHaveBeenCalledTimes(1)
  })
})

describe('loadRecentMissions', () => {
  it('does nothing off the missions pages while the main drawer is closed', async () => {
    setup()

    await state().loadRecentMissions('/mining')

    expect(api.getRecentMissions).not.toHaveBeenCalled()
  })

  it('loads off the missions pages when the main drawer is open', async () => {
    useModalStore.setState({ isMainDrawerOpen: true })
    api.getRecentMissions.mockResolvedValue([buildMission({ raw: true })])
    setup()

    await state().loadRecentMissions('/mining')

    expect(ids(state().recentMissions)).toEqual(['1'])
  })

  // It used to reload in the drawer only until anything had synced.
  it('reloads on its schedule in the main drawer too', async () => {
    useModalStore.setState({ isMainDrawerOpen: true })
    setup({ wallet: { isSync: true } })

    await state().loadRecentMissions('/mining')

    expect(api.getRecentMissions).toHaveBeenCalled()
  })

  it('loads the missions with their template NFT and view, then waits 5 minutes', async () => {
    const template = buildPinata({ series: 1, cardNumber: 1 })
    api.getRecentMissions.mockResolvedValue([
      buildMission({
        raw: true,
        id: '3',
        pinataNft: null,
        attributes: {
          name: 'Courier Run',
          nftTokenURI: 'QmeixndncUVp435QZeEWipHCHgAVbjeJpZ8Ja5MjcaTGe5',
        },
      }),
    ])
    setup({ missions: { templatePinatas: [buildPinata({ series: 2, cardNumber: 1 }), template] } })

    await state().loadRecentMissions('/missions')

    expect(state().recentMissions[0].pinataNft).toEqual(template)
    expect(state().recentMissions[0].view.status).toBe(MissionStatus.Boarding)
    expect(wallet().isSync).toBe(true)
    expect(state().syncs.recentMissions.isInProgress).toBe(false)
    expect(state().syncs.recentMissions.executeAfter).toBeGreaterThan(Date.now() + 4 * MINUTE)
  })

  // They used to be matched against whatever templates had loaded so far, often none.
  it('waits for the template NFTs before matching them', async () => {
    const template = buildPinata({ series: 1, cardNumber: 1 })
    api.getTemplatePinatas.mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve([template]), 0))
    )
    api.getRecentMissions.mockResolvedValue([
      buildMission({
        raw: true,
        pinataNft: null,
        attributes: {
          name: 'Courier Run',
          nftTokenURI: 'QmeixndncUVp435QZeEWipHCHgAVbjeJpZ8Ja5MjcaTGe5',
        },
      }),
    ])
    setup()

    await state().loadRecentMissions('/missions')

    expect(state().recentMissions[0].pinataNft).toEqual(template)
  })

  it('skips the reload until it is due, once synced', async () => {
    setup({ wallet: { isSync: true }, syncs: syncsDueIn(10 * MINUTE) })

    await state().loadRecentMissions('/missions')

    expect(api.getRecentMissions).not.toHaveBeenCalled()
  })

  it('asks for a re-sort when a reload brings a different list', async () => {
    api.getRecentMissions.mockResolvedValue([
      buildMission({ raw: true, id: '2' }),
      buildMission({ raw: true, id: '1' }),
    ])
    setup({ missions: { recentMissions: [buildMission({ id: '1' })] } })

    await state().loadRecentMissions('/missions')

    expect(ids(state().recentMissions)).toEqual(['2', '1'])
    expect(state().triggerFilterAndSortMissions).toBe(true)
  })

  it('keeps the current list (and order) when the ids are unchanged', async () => {
    api.getRecentMissions.mockResolvedValue([
      buildMission({ raw: true, id: '1', attributes: { name: 'Renamed' } }),
      buildMission({ raw: true, id: '2' }),
    ])
    setup({ missions: { recentMissions: [buildMission({ id: '1' }), buildMission({ id: '2' })] } })

    await state().loadRecentMissions('/missions')

    expect(state().recentMissions[0].attributes.name).toBe('Mission 1')
    expect(state().triggerFilterAndSortMissions).toBe(false)
  })

  // It used to try again on every 1s tick while the API was down.
  it('keeps the old list and tries again in 10 seconds when the API fails', async () => {
    api.getRecentMissions.mockResolvedValue(null)
    setup({ missions: { recentMissions: [buildMission({ id: '1' })] } })

    await state().loadRecentMissions('/missions')

    expect(ids(state().recentMissions)).toEqual(['1'])
    expect(state().syncs.recentMissions.isInProgress).toBe(false)
    expect(state().syncs.recentMissions.executeAfter).toBeGreaterThan(Date.now() + 5000)
    expect(state().syncs.recentMissions.executeAfter).toBeLessThanOrEqual(
      Date.now() + RETRY_AFTER_FAILURE_MS
    )
  })

  it("doesn't start another load while one is in progress", async () => {
    api.getRecentMissions.mockReturnValue(new Promise(() => {}))
    setup()

    state().loadRecentMissions('/missions')
    await state().loadRecentMissions('/missions')

    expect(api.getRecentMissions).toHaveBeenCalledTimes(1)
  })
})

describe('loadExplorer', () => {
  it('builds a demo explorer from the recent missions without a BSC wallet', async () => {
    setup({
      missions: {
        recentMissions: [
          buildMission({ id: '1', investInfo: buildInvestInfo({ totalStakeTLM: 30000 }) }),
          buildMission({ id: '2' }),
        ],
      },
    })

    await state().loadExplorer('/missions')

    expect(api.getExplorer).not.toHaveBeenCalled()
    expect(state().explorer.id).toBe('demoExplorer')
    expect(ids(state().explorerMissions)).toEqual(['1', '2'])
    expect(state().triggerFilterAndSortMissions).toBe(true)
    expect(wallet().bscStakedTlmBalance).toBe(30000)
  })

  // It used to rebuild it, and ask for a re-sort, every second.
  it('keeps the demo explorer while the recent missions are unchanged', async () => {
    setup({ missions: { recentMissions: [buildMission({ id: '1' })] } })
    await state().loadExplorer('/missions')
    const demo = state().explorer
    useMissionsStore.setState({ triggerFilterAndSortMissions: false })

    await state().loadExplorer('/missions')

    expect(state().explorer).toBe(demo)
    expect(state().triggerFilterAndSortMissions).toBe(false)
  })

  it("loads the connected wallet's explorer, totals its staked TLM and waits a minute", async () => {
    api.getExplorer.mockResolvedValue(
      buildExplorer([
        buildMission({ raw: true, id: '1', investInfo: buildInvestInfo({ totalStakeTLM: 20000 }) }),
        buildMission({ raw: true, id: '2', investInfo: buildInvestInfo({ totalStakeTLM: 5000 }) }),
        buildMission({
          raw: true,
          id: '3',
          investInfo: buildInvestInfo({ totalStakeTLM: 70000, withdrawn: true }),
        }),
      ])
    )
    setup({ wallet: { userWallet: buildUserWallet('0xwallet') } })

    await state().loadExplorer('/missions')

    expect(api.getExplorer).toHaveBeenCalledWith('0xwallet')
    expect(ids(state().explorerMissions)).toEqual(['1', '2', '3'])
    expect(state().explorerMissions[0].view.status).toBe(MissionStatus.Boarding)
    expect(state().triggerFilterAndSortMissions).toBe(true)
    // Withdrawn stakes don't count.
    expect(wallet().bscStakedTlmBalance).toBe(25000)
    expect(wallet().isSync).toBe(true)
    expect(state().syncs.explorer.isInProgress).toBe(false)
    expect(state().syncs.explorer.executeAfter).toBeGreaterThan(Date.now() + 50 * 1000)
  })

  // It used to skip Profile → Balances (which shows the staked TLM) and run everywhere else.
  it.each([
    ['/missions/my', false, true],
    ['/profile/balances', false, true],
    ['/mining', true, true],
    ['/mining', false, false],
  ])('on %s with the drawer open: %s, loads: %s', async (pathname, isMainDrawerOpen, loads) => {
    useModalStore.setState({ isMainDrawerOpen })
    api.getExplorer.mockResolvedValue(buildExplorer([]))
    setup({ wallet: { userWallet: buildUserWallet() } })

    await state().loadExplorer(pathname)

    expect(api.getExplorer).toHaveBeenCalledTimes(loads ? 1 : 0)
  })

  it('skips the reload until it is due, once synced', async () => {
    setup({
      wallet: { userWallet: buildUserWallet(), isSync: true },
      syncs: syncsDueIn(10 * MINUTE),
    })

    await state().loadExplorer('/missions')

    expect(api.getExplorer).not.toHaveBeenCalled()
  })

  it('keeps the same explorer when its id and missions are unchanged', async () => {
    api.getExplorer.mockResolvedValue(buildExplorer([buildMission({ raw: true, id: '1' })]))
    setup({
      missions: {
        explorer: buildExplorer([buildMission({ id: '1', attributes: { name: 'Kept' } })]),
      },
      wallet: { userWallet: buildUserWallet() },
    })

    await state().loadExplorer('/missions')

    expect(state().explorerMissions[0].attributes.name).toBe('Kept')
    expect(state().triggerFilterAndSortMissions).toBe(false)
  })

  it('retries every tick when the explorer API fails, until anything has synced', async () => {
    setup({ wallet: { userWallet: buildUserWallet(), isSync: false } })

    await state().loadExplorer('/missions')
    await state().loadExplorer('/missions')

    expect(state().explorer).toBeNull()
    expect(api.getExplorer).toHaveBeenCalledTimes(2)
  })

  // It used to return still in progress, so once synced it never loaded again until
  // reloadMissions.
  it('keeps the loaded explorer and retries in 10 seconds after a failure once synced', async () => {
    setup({
      missions: { explorer: buildExplorer([buildMission({ id: '1' })]) },
      wallet: { userWallet: buildUserWallet(), isSync: true },
    })

    await state().loadExplorer('/missions')
    await state().loadExplorer('/missions')

    expect(api.getExplorer).toHaveBeenCalledTimes(1)
    expect(ids(state().explorerMissions)).toEqual(['1'])
    expect(state().syncs.explorer.isInProgress).toBe(false)
    expect(state().syncs.explorer.executeAfter).toBeGreaterThan(Date.now() + 5000)
    expect(state().syncs.explorer.executeAfter).toBeLessThanOrEqual(
      Date.now() + RETRY_AFTER_FAILURE_MS
    )
  })

  it('loads again once the retry is due', async () => {
    jest.useFakeTimers()
    api.getExplorer
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(buildExplorer([buildMission({ raw: true, id: '2' })]))
    setup({ wallet: { userWallet: buildUserWallet(), isSync: true } })

    await state().loadExplorer('/missions')
    await state().loadExplorer('/missions')
    expect(api.getExplorer).toHaveBeenCalledTimes(1)

    jest.setSystemTime(Date.now() + RETRY_AFTER_FAILURE_MS + 1000)
    await state().loadExplorer('/missions')

    expect(api.getExplorer).toHaveBeenCalledTimes(2)
    expect(ids(state().explorerMissions)).toEqual(['2'])
  })

  it("doesn't start another load while one is in progress, even before anything synced", async () => {
    api.getExplorer.mockReturnValue(new Promise(() => {}))
    setup({ wallet: { userWallet: buildUserWallet(), isSync: false } })

    state().loadExplorer('/missions')
    await state().loadExplorer('/missions')

    expect(api.getExplorer).toHaveBeenCalledTimes(1)
  })
})

describe('loadNfts', () => {
  it('loads nothing off the missions pages', async () => {
    setup({ missions: { templatePinatas: [buildPinata()] } })

    await state().loadNfts('/mining')

    expect(state().nfts).toBeNull()
  })

  it('waits for the template NFTs', async () => {
    setup()

    await state().loadNfts('/missions/inventory')

    expect(state().nfts).toBeNull()
    expect(state().syncs.missionNfts.isInProgress).toBe(false)
  })

  it('shows the template NFTs without a BSC wallet', async () => {
    const templates = [buildPinata({ name: 'A' }), buildPinata({ name: 'B' })]
    setup({ missions: { templatePinatas: templates } })

    await state().loadNfts('/missions/inventory')

    expect(contracts.getNfts).not.toHaveBeenCalled()
    expect(state().nfts).toEqual(templates)
    expect(wallet().isSync).toBe(true)
  })

  it("loads the wallet's mission NFTs, reporting progress, then waits 2 hours", async () => {
    const userWallet = buildUserWallet('0xowner')
    contracts.getNfts.mockImplementation(
      async (_account, _provider, _templates, onTotal, onLoaded) => {
        onTotal(2)
        onLoaded(2)
        return [buildPinata({ name: 'A' }), buildPinata({ name: 'A' })]
      }
    )
    setup({ missions: { templatePinatas: [buildPinata({ name: 'A' })] }, wallet: { userWallet } })

    await state().loadNfts('/missions/inventory')

    expect(contracts.getNfts).toHaveBeenCalledWith(
      '0xowner',
      userWallet.provider,
      expect.anything(),
      expect.any(Function),
      expect.any(Function)
    )
    expect(state().nfts).toHaveLength(2)
    expect(wallet()).toMatchObject({
      totalMissionsNfts: 2,
      loadedMissionsNfts: 2,
      loadingProgressMissionsNfts: 100,
    })
    expect(state().syncs.missionNfts.executeAfter).toBeGreaterThan(Date.now() + 119 * MINUTE)
  })

  // It used to stay in progress, so it never checked again until reloadMissions.
  it('checks again in 2 hours when the wallet has none', async () => {
    contracts.getNfts.mockResolvedValue(null)
    setup({
      missions: { templatePinatas: [buildPinata()] },
      wallet: { userWallet: buildUserWallet() },
    })

    await state().loadNfts('/missions/inventory')

    expect(state().nfts).toBeNull()
    expect(state().syncs.missionNfts.isInProgress).toBe(false)
    expect(state().syncs.missionNfts.executeAfter).toBeGreaterThan(Date.now() + 119 * MINUTE)
  })
})

describe('loadBscBalance', () => {
  it('loads the BSC TLM balance for the wallet and waits a minute', async () => {
    const userWallet = buildUserWallet('0xbal')
    contracts.getBscTlmBalance.mockResolvedValue(BigNumber.from(50000))
    setup({ wallet: { userWallet } })

    await state().loadBscBalance('/missions')

    expect(contracts.getBscTlmBalance).toHaveBeenCalledWith(
      userWallet.provider,
      '0xbal',
      expect.any(Function)
    )
    expect(wallet().bscTlmBalanceFormatted).toBe('5.0')
    expect(state().syncs.bscBalance.executeAfter).toBeGreaterThan(Date.now() + 50 * 1000)
  })

  // It used to read the balance every second, on every page.
  it("doesn't read it again until it is due", async () => {
    setup({ wallet: { userWallet: buildUserWallet() }, syncs: syncsDueIn(10 * MINUTE) })

    await state().loadBscBalance('/missions')

    expect(contracts.getBscTlmBalance).not.toHaveBeenCalled()
  })

  it('reads it on Profile → Balances, but not on pages without BSC balances', async () => {
    setup({ wallet: { userWallet: buildUserWallet() } })

    await state().loadBscBalance('/mining')
    expect(contracts.getBscTlmBalance).not.toHaveBeenCalled()

    await state().loadBscBalance('/profile/balances')
    expect(contracts.getBscTlmBalance).toHaveBeenCalled()
  })

  it('clears the BSC TLM balance without a wallet', async () => {
    setup({ wallet: { userWallet: null, bscTlmBalance: BigNumber.from(1) } })

    await state().loadBscBalance('/missions')

    expect(contracts.getBscTlmBalance).not.toHaveBeenCalled()
    expect(wallet().bscTlmBalance).toBeNull()
  })

  it('makes the balance and explorer due when TLM moves in or out', async () => {
    setup({ wallet: { userWallet: buildUserWallet() } })
    await state().loadBscBalance('/missions')
    useMissionsStore.setState({ syncs: syncsDueIn(10 * MINUTE) })

    const [[, , onTransfer]] = contracts.getBscTlmBalance.mock.calls
    onTransfer()

    expect(state().syncs.bscBalance.executeAfter).toBeLessThanOrEqual(Date.now())
    expect(state().syncs.explorer.executeAfter).toBeLessThanOrEqual(Date.now())
    expect(state().syncs.missionNfts.executeAfter).toBeGreaterThan(Date.now())
  })

  it('makes the balance and explorer due for a different BSC account', () => {
    setup({ wallet: { userWallet: buildUserWallet('0x1') }, syncs: syncsDueIn(10 * MINUTE) })

    wallet().setWallet(buildUserWallet('0x1') as any)
    expect(state().syncs.bscBalance.executeAfter).toBeGreaterThan(Date.now())

    wallet().setWallet(buildUserWallet('0x2') as any)
    expect(state().syncs.bscBalance.executeAfter).toBeLessThanOrEqual(Date.now())
    expect(state().syncs.explorer.executeAfter).toBeLessThanOrEqual(Date.now())
  })
})

describe('refreshMissionViews', () => {
  const stale = (id: string, status = MissionStatus.Boarding) => {
    const mission = buildMission({ id, status })
    mission.view.timeLabel = 'stale'
    return mission
  }

  it('refreshes the views as time passes, and the selection follows', () => {
    setup({
      missions: {
        recentMissions: [stale('1')],
        explorer: buildExplorer([stale('2')]),
        filteredAndSortedMissions: [stale('1')],
        selectedMissionId: '1',
      },
    })

    state().refreshMissionViews('/missions')

    expect(state().recentMissions[0].view.timeLabel).toBe('Starting in:')
    expect(state().explorerMissions[0].view.timeLabel).toBe('Starting in:')
    expect(state().filteredAndSortedMissions[0].view.timeLabel).toBe('Starting in:')
    expect(state().selectedMission.view.timeLabel).toBe('Starting in:')
  })

  it('updates the count to claim once a mission completes', () => {
    const mission = buildMission({
      id: '1',
      status: MissionStatus.Completed,
      investInfo: buildInvestInfo(),
    })
    mission.view.status = MissionStatus.Departed
    setup({ missions: { explorer: buildExplorer([mission]) } })
    expect(state().missionsToClaimCount).toBe(0)

    state().refreshMissionViews('/missions/my')

    expect(state().missionsToClaimCount).toBe(1)
  })

  it('does nothing off the missions pages', () => {
    setup({ missions: { recentMissions: [stale('1')] } })

    state().refreshMissionViews('/mining')

    expect(state().recentMissions[0].view.timeLabel).toBe('stale')
  })
})

describe('filterAndSortMissions', () => {
  const recent = () => [
    buildMission({ id: '2', attributes: { name: 'Bravo', reward: 30000 } }),
    buildMission({ id: '10', attributes: { name: 'Alpha', reward: 100000 } }),
    buildMission({ id: '1', attributes: { name: 'Charlie', reward: 200000 } }),
  ]

  const sort = (
    sortBy: SortBy,
    reversed: boolean,
    extra: Partial<MissionsState> = {},
    at = '/missions'
  ) => {
    setup({
      missions: {
        recentMissions: recent(),
        triggerFilterAndSortMissions: true,
        missionsFilter: { sortBy, reversed },
        ...extra,
      },
    })
    state().filterAndSortMissions(at)
    return state()
  }

  it('sorts by id numerically, newest first by default', () => {
    expect(ids(sort(SortBy.Id, true).filteredAndSortedMissions)).toEqual(['10', '2', '1'])
    expect(ids(sort(SortBy.Id, false).filteredAndSortedMissions)).toEqual(['1', '2', '10'])
  })

  it('sorts by name and by reward', () => {
    expect(ids(sort(SortBy.Name, false).filteredAndSortedMissions)).toEqual(['10', '2', '1'])
    expect(ids(sort(SortBy.Rewards, false).filteredAndSortedMissions)).toEqual(['2', '10', '1'])
  })

  it('resets the trigger once sorted', () => {
    expect(sort(SortBy.Id, true).triggerFilterAndSortMissions).toBe(false)
  })

  // It used to sort the recent missions themselves, and write the invest info onto them.
  it("copies the explorer's invest info onto the matching listed missions", () => {
    const sorted = sort(SortBy.Id, true, {
      explorer: buildExplorer([
        buildMission({ id: '2', investInfo: buildInvestInfo({ numberOfShips: 6 }) }),
      ]),
    })

    const two = sorted.filteredAndSortedMissions.find((m) => m.id === '2')
    expect(two.attributes.investInfo.numberOfShips).toBe(6)
    expect(ids(sorted.recentMissions)).toEqual(['2', '10', '1'])
    expect(sorted.recentMissions[0].attributes.investInfo).toBeUndefined()
  })

  it('sorts the explorer missions on My Missions', () => {
    const sorted = sort(
      SortBy.Id,
      false,
      { explorer: buildExplorer([buildMission({ id: '5' }), buildMission({ id: '4' })]) },
      '/missions/my'
    )

    expect(ids(sorted.filteredAndSortedMissions)).toEqual(['4', '5'])
  })

  it('shows an empty list right away when there are no missions, sorting once they load', () => {
    setup({ missions: { recentMissions: null, triggerFilterAndSortMissions: true } })

    state().filterAndSortMissions('/missions')

    expect(state().filteredAndSortedMissions).toEqual([])
    expect(state().triggerFilterAndSortMissions).toBe(true)
  })

  it('does nothing without the trigger, or on the details and inventory pages', () => {
    setup({ missions: { recentMissions: recent() } })
    state().filterAndSortMissions('/missions')
    expect(state().filteredAndSortedMissions).toBeNull()

    expect(sort(SortBy.Id, true, {}, '/missions/inventory').filteredAndSortedMissions).toBeNull()
    expect(state().triggerFilterAndSortMissions).toBe(true)
  })
})

describe('reloadMissions', () => {
  // The re-sort used to be asked for 200ms later.
  it('clears the loaded missions, makes their syncs due now and asks for a re-sort', () => {
    setup({
      missions: {
        recentMissions: [buildMission()],
        explorer: buildExplorer([buildMission()]),
        nfts: [buildPinata()],
      },
      syncs: syncsDueIn(10 * MINUTE),
    })

    state().reloadMissions()

    expect(state()).toMatchObject({
      recentMissions: null,
      explorer: null,
      explorerMissions: null,
      nfts: null,
      triggerFilterAndSortMissions: true,
    })
    SYNC_KEYS.forEach((key) => {
      expect(state().syncs[key].executeAfter).toBeLessThanOrEqual(Date.now())
      expect(state().syncs[key].isInProgress).toBe(false)
    })
  })
})

describe('setters', () => {
  it('setMissionsFilter clears the sorted list, stores the filter and asks for a re-sort', () => {
    setup({ missions: { filteredAndSortedMissions: [buildMission()] } })
    const filter = { sortBy: SortBy.Name, reversed: false }

    state().setMissionsFilter(filter)

    expect(state()).toMatchObject({
      filteredAndSortedMissions: null,
      missionsFilter: filter,
      triggerFilterAndSortMissions: true,
    })
  })

  it('resortMissions clears the sorted list and asks for a re-sort, keeping the filter', () => {
    const { missionsFilter } = setup({ missions: { filteredAndSortedMissions: [buildMission()] } })

    state().resortMissions()

    expect(state()).toMatchObject({
      filteredAndSortedMissions: null,
      missionsFilter,
      triggerFilterAndSortMissions: true,
    })
  })

  it('stores the tab, join step and ships count', () => {
    setup()

    state().setSelectedMissionsTab(2)
    state().setJoinMissionStep(3)
    state().setMissionShipsCount(5)

    expect(state()).toMatchObject({
      selectedMissionsTab: 2,
      joinMissionStep: 3,
      missionShipsCount: 5,
    })
  })
})

describe('joinMission', () => {
  const joiner = buildUserWallet('0xjoiner')
  const joinSetup = () =>
    setup({
      missions: {
        recentMissions: [buildMission({ id: '7', attributes: { spaceshipCost: 10000 } })],
        selectedMissionId: '7',
      },
      wallet: { userWallet: joiner },
    })

  it('approves the TLM, waits, sends the spacecrafts, then reloads the missions', async () => {
    jest.useFakeTimers()
    contracts.getAllowance.mockResolvedValue(BigNumber.from(5000))
    joinSetup()

    const done = state().joinMission(3)
    await flush()

    expect(state().joinMissionStep).toBe(1)
    expect(state().missionShipsCount).toBe(3)
    expect(contracts.getAllowance).toHaveBeenCalledWith(joiner.provider, '0xjoiner')
    expect(contracts.setAllowance).toHaveBeenCalledWith(BigNumber.from(30000), joiner.provider)
    expect(contracts.joinMission).not.toHaveBeenCalled()
    expect(mockCollectEvent).toHaveBeenCalledWith({ name: Constants.GA_MISSIONS_JOIN })
    expect(mockCollectEvent).toHaveBeenCalledWith({ name: Constants.GA_MISSIONS_SET_ALLOWANCE })

    await advance(5000)
    expect(contracts.joinMission).toHaveBeenCalledWith('7', 3, joiner.provider)
    expect(state().joinMissionStep).toBe(3)
    expect(state().recentMissions).not.toBeNull()

    await advance(1000)
    await expect(done).resolves.toBe(true)
    expect(state().recentMissions).toBeNull()
    expect(mockCollectEvent).toHaveBeenCalledWith({ name: Constants.GA_MISSIONS_JOIN_SUCCESS })
  })

  it('skips the approval when the allowance already covers the cost', async () => {
    jest.useFakeTimers()
    contracts.getAllowance.mockResolvedValue(BigNumber.from(30000))
    joinSetup()

    const done = state().joinMission(3)
    await advance(5000)
    await advance(1000)
    await done

    expect(contracts.setAllowance).not.toHaveBeenCalled()
  })

  it('moves to the failed step and clears the ships when sending fails', async () => {
    jest.useFakeTimers()
    jest.spyOn(console, 'error').mockImplementation(() => {})
    contracts.getAllowance.mockResolvedValue(BigNumber.from(30000))
    contracts.joinMission.mockRejectedValue(new Error('user rejected'))
    joinSetup()

    const done = state().joinMission(3)
    await advance(5000)

    await expect(done).resolves.toBe(false)
    expect(state().joinMissionStep).toBe(4)
    expect(state().missionShipsCount).toBeNull()
  })

  it('fails straight away when the approval is rejected', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {})
    contracts.setAllowance.mockRejectedValue(new Error('user rejected'))
    joinSetup()

    await expect(state().joinMission(3)).resolves.toBe(false)
    expect(state().joinMissionStep).toBe(4)
    expect(contracts.joinMission).not.toHaveBeenCalled()
  })
})

describe('loadMissionRewards', () => {
  it('loads the rewards for the mission, flagging while it loads', async () => {
    let resolve: (value: { tlm: string; nft: string }) => void
    contracts.getMissionRewards.mockReturnValue(
      new Promise((r) => {
        resolve = r
      })
    )
    const userWallet = buildUserWallet()
    setup({ wallet: { userWallet } })

    const done = state().loadMissionRewards('7')
    expect(state().missionRewardsLoading).toBe(true)

    resolve({ tlm: '12.5', nft: '1' })
    await done

    expect(contracts.getMissionRewards).toHaveBeenCalledWith('7', userWallet.provider)
    expect(state().missionRewards).toEqual({ tlm: '12.5', nft: '1' })
    expect(state().missionRewardsLoading).toBe(false)
  })

  it('does nothing without a BSC wallet, and stops loading on an error', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {})
    contracts.getMissionRewards.mockRejectedValue(new Error('rpc down'))

    setup({ wallet: { userWallet: null } })
    await state().loadMissionRewards('7')
    expect(contracts.getMissionRewards).not.toHaveBeenCalled()

    setup({ wallet: { userWallet: buildUserWallet() } })
    await state().loadMissionRewards('7')
    expect(state().missionRewardsLoading).toBe(false)
    expect(state().missionRewards).toBeNull()
  })
})

describe('claimMissionRewards', () => {
  it('claims, waits 8s, reloads the missions and shows the success message', async () => {
    jest.useFakeTimers()
    const userWallet = buildUserWallet()
    setup({ missions: { recentMissions: [buildMission()] }, wallet: { userWallet } })

    const done = state().claimMissionRewards('7')
    await flush()

    expect(messages().loadingMessage).toBe('Claiming your Mission rewards..')
    expect(contracts.claimMissionRewards).toHaveBeenCalledWith('7', userWallet.provider)
    expect(mockCollectEvent).toHaveBeenCalledWith({
      name: Constants.GA_MISSIONS_REWARDS_CLAIMED_SUCCESS,
    })

    await advance(8000)
    await expect(done).resolves.toBe(true)
    expect(messages().loadingMessage).toBeNull()
    expect(messages().infoMessage).toBe('Your Mission reward has been claimed.')
    expect(state().recentMissions).toBeNull()
  })

  it.each([
    [new Error('User denied transaction signature'), 'User denied transaction'],
    [new Error('execution reverted'), 'Error has occured!'],
    // Without a message it used to show the TypeError from reading it.
    [{ code: 4001 }, 'Error has occured!'],
  ])('shows an error for %p and reports failure', async (chainError, shown) => {
    jest.useFakeTimers()
    jest.spyOn(console, 'error').mockImplementation(() => {})
    contracts.claimMissionRewards.mockRejectedValue(chainError)
    setup({
      missions: { recentMissions: [buildMission()] },
      wallet: { userWallet: buildUserWallet() },
    })

    const done = state().claimMissionRewards('7')
    await advance(8000)

    await expect(done).resolves.toBe(false)
    expect(messages()).toMatchObject({
      errorMessage: shown,
      loadingMessage: null,
      infoMessage: null,
    })
    expect(state().recentMissions).not.toBeNull()
    expect(mockCollectEvent).toHaveBeenCalledWith({
      name: Constants.GA_MISSIONS_REWARDS_CLAIMED_ERROR,
    })
  })
})

describe('newsletter', () => {
  it('remembers that the newsletter was shown', () => {
    setup()

    state().storeNewsletterWasShown()

    expect(state().newsletterWasShown).toBe(true)
    expect(localStorage.getItem('alienworlds-missions-newsletter')).toBe('true')
  })

  it('stores and removes the subscribed email, reporting each', () => {
    setup()

    state().storeSubscribedEmail('me@example.com')
    expect(state().subscribedEmail).toBe('me@example.com')
    expect(localStorage.getItem('alienworlds-missions-email')).toBe('me@example.com')
    expect(mockCollectEvent).toHaveBeenCalledWith({ name: Constants.GA_MISSIONS_NEWSLETTER_SUB })

    state().storeSubscribedEmail(null)
    expect(state().subscribedEmail).toBeNull()
    expect(localStorage.getItem('alienworlds-missions-email')).toBeNull()
    expect(mockCollectEvent).toHaveBeenCalledWith({ name: Constants.GA_MISSIONS_NEWSLETTER_UNSUB })
  })
})

describe('sync', () => {
  it('loads what the page shows, then sorts and refreshes it', async () => {
    api.getRecentMissions.mockResolvedValue([
      buildMission({ raw: true, id: '1' }),
      buildMission({ raw: true, id: '2' }),
    ])
    setup({ missions: { triggerFilterAndSortMissions: true } })

    state().sync('/missions')
    await flush()
    expect(api.getTemplatePinatas).toHaveBeenCalled()
    expect(ids(state().recentMissions)).toEqual(['1', '2'])

    state().sync('/missions')
    expect(ids(state().filteredAndSortedMissions)).toEqual(['2', '1'])
    expect(state().explorer.id).toBe('demoExplorer')
  })

  it('only loads the template NFTs off the pages that show missions', async () => {
    setup({ wallet: { userWallet: buildUserWallet() } })

    state().sync('/mining')
    await flush()

    expect(api.getTemplatePinatas).toHaveBeenCalled()
    expect(api.getRecentMissions).not.toHaveBeenCalled()
    expect(api.getExplorer).not.toHaveBeenCalled()
    expect(contracts.getBscTlmBalance).not.toHaveBeenCalled()
  })
})
