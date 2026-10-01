import { useInventoryStore } from 'features/inventory/store/inventoryStore'
import { useMiningStore } from 'features/mining/store/miningStore'
import { DateTime } from 'luxon'
import { createOvermindMock } from 'overmind'
import { namespaced } from 'overmind/config'
import { getInitialAssetsState, useAssetsStore } from 'shared/store/assetsStore'
import { getInitialMinerState, useMinerStore } from 'shared/store/minerStore'
import * as atomic from 'store/atomic'
import { getDefaultSyncAi } from 'store/main/helpers'

// Runs the atomic loaders against stub wax/main namespaces (the full config pulls in the Wharf
// wallet plugins, which don't run under jsdom) and checks what they write to the Zustand stores.

const realStore = useAssetsStore.getState()
const realMinerStore = useMinerStore.getState()

const mockFetchLandBoostsByDay = jest.fn()
jest.mock('features/mining/utils/landBoosts', () => ({
  fetchLandBoostsByDay: (...args: unknown[]) => mockFetchLandBoostsByDay(...args),
}))

// Every loader due now, so shouldExecute lets it run.
const dueSyncAi = () => {
  const syncAi = getDefaultSyncAi()
  Object.values(syncAi).forEach((info) => {
    info.executeAfter = DateTime.now().minus({ minutes: 1 })
  })
  return syncAi
}

const asset = (id: string, schema = 'tool.worlds') => ({
  asset_id: id,
  name: `Asset ${id}`,
  schema: { schema_name: schema },
  template: { template_id: `t${id}` },
  data: {},
})

// createOvermindMock only replaces effects the config declares, so these go in both places.
const waxApi = {
  getBag: async () => ({ items: ['1', '2'] }),
  getMiner: async () => ({ current_land: '42' }),
  getPlayer: async () => ({ avatar: '7' }),
}

const setup = ({
  wax = {},
  effects = {},
}: { wax?: Record<string, any>; effects?: Record<string, any> } = {}) => {
  const config = namespaced({
    atomic,
    wax: {
      state: { isLoggedIn: true, isDemoUser: false, walletId: 'miner.wam', ...wax },
      effects: { api: waxApi },
    },
    main: { state: { isFocusedWindow: true, syncAi: dueSyncAi() } },
  })
  const overmind = createOvermindMock(config as any, {
    wax: { api: waxApi },
    atomic: { api: { getAssets: async () => null, getAssetById: async () => null, ...effects } },
  })
  return { actions: (overmind.actions as any).atomic, state: overmind.state as any }
}

beforeEach(() => {
  useAssetsStore.setState({ ...realStore, ...getInitialAssetsState() }, true)
  useMinerStore.setState({ ...realMinerStore, ...getInitialMinerState() }, true)
  mockFetchLandBoostsByDay.mockReset().mockResolvedValue([])
})

describe('atomic.initializeOrReloadAssets', () => {
  it('loads the assets, owned lands, boost NFTs and land boosts into their stores', async () => {
    const land = asset('10', 'land.worlds')
    const boost = { ...asset('11', 'items.worlds'), name: 'MEGA Boost' }
    const getAssets = jest.fn(async (page: number) => (page === 1 ? [asset('1'), land, boost] : []))
    const { actions } = setup({ effects: { getAssets } })

    await actions.initializeOrReloadAssets()

    const { assets, ownedLandsAssets } = useAssetsStore.getState()
    expect(assets.map((x) => x.asset_id)).toEqual(['1', '10', '11'])
    expect(ownedLandsAssets.map((x) => x.asset_id)).toEqual(['10'])
    expect(useMiningStore.getState().ownedLandBoostsAssets.map((x) => x.asset_id)).toEqual(['11'])
    expect(mockFetchLandBoostsByDay).toHaveBeenCalledWith('10', expect.any(Number))
    expect(useInventoryStore.getState().ownedLandsAssetsDayBoosts).toEqual([
      { landId: '10', boosts: [] },
    ])
  })

  it('shows AlienAvatars NFTs as avatars', async () => {
    const { actions } = setup({
      effects: { getAssets: async () => [asset('1', 'alienavatars')] },
    })

    await actions.initializeOrReloadAssets()

    expect(useAssetsStore.getState().assets[0].schema.schema_name).toBe('faces.worlds')
  })

  it('asks for a re-sort when the assets change', async () => {
    useAssetsStore.setState({ assets: [asset('1')] as any })
    const { actions } = setup({ effects: { getAssets: async () => [asset('2')] } })

    await actions.initializeOrReloadAssets()

    expect(useAssetsStore.getState().assets.map((x) => x.asset_id)).toEqual(['2'])
    expect(useAssetsStore.getState().triggerFilterAndSortAssets).toBe(true)
  })

  // Current behaviour: an unchanged poll clears the assets, so the next poll reloads them.
  it('clears unchanged assets so the next poll reloads them', async () => {
    useAssetsStore.setState({ assets: [asset('1')] as any, triggerFilterAndSortAssets: true })
    const { actions } = setup({ effects: { getAssets: async () => [asset('1')] } })

    await actions.initializeOrReloadAssets()

    expect(useAssetsStore.getState().assets).toBeNull()
    expect(useAssetsStore.getState().triggerFilterAndSortAssets).toBe(false)
  })

  it('clears the assets when logged out', async () => {
    useAssetsStore.setState({ assets: [asset('1')] as any })
    const { actions } = setup({ wax: { isLoggedIn: false } })

    await actions.initializeOrReloadAssets()

    expect(useAssetsStore.getState().assets).toBeNull()
  })
})

describe('atomic.initializeOrReloadBag', () => {
  it('loads the bag tools into the assets store', async () => {
    const { actions } = setup({ effects: { getAssetById: async (id: string) => asset(id) } })

    await actions.initializeOrReloadBag()

    expect(useAssetsStore.getState().bag).toEqual({ items: ['1', '2'] })
    expect(useAssetsStore.getState().bagAssets.map((x) => x.asset_id)).toEqual(['1', '2'])
  })

  it('asks for a re-sort when the bag changes', async () => {
    useAssetsStore.setState({ bagAssets: [asset('9')] as any })
    const { actions } = setup({ effects: { getAssetById: async (id: string) => asset(id) } })

    await actions.initializeOrReloadBag()

    expect(useAssetsStore.getState().triggerFilterAndSortAssets).toBe(true)
  })
})

describe('atomic.initializeOrReloadMiningLand', () => {
  it('loads the mining land into the assets store', async () => {
    const { actions } = setup({ effects: { getAssetById: async (id: string) => asset(id) } })

    await actions.initializeOrReloadMiningLand()

    expect(useMinerStore.getState().miner).toEqual({ current_land: '42' })
    expect(useAssetsStore.getState().landAsset.asset_id).toBe('42')
  })

  it('keeps a demo user on the land they already have', async () => {
    useAssetsStore.setState({ landAsset: asset('5') as any })
    const { actions } = setup({
      wax: { isDemoUser: true },
      effects: { getAssetById: async (id: string) => asset(id) },
    })

    await actions.initializeOrReloadMiningLand()

    expect(useAssetsStore.getState().landAsset.asset_id).toBe('5')
  })
})

describe('atomic.initializeOrReloadTagAndAvatar', () => {
  it('waits for the assets, then sets an owned avatar', async () => {
    const { actions } = setup({ effects: { getAssetById: async (id: string) => asset(id) } })

    const loading = actions.initializeOrReloadTagAndAvatar()
    await Promise.resolve()
    expect(useAssetsStore.getState().avatarAsset).toBeNull()

    useAssetsStore.getState().setAssets([asset('7')] as any)
    await loading

    expect(useAssetsStore.getState().avatarAsset.asset_id).toBe('7')
  })

  it('clears an avatar the player no longer owns', async () => {
    useAssetsStore.setState({ assets: [asset('1')] as any, avatarAsset: asset('7') as any })
    const { actions } = setup({ effects: { getAssetById: async (id: string) => asset(id) } })

    await actions.initializeOrReloadTagAndAvatar()

    expect(useAssetsStore.getState().avatarAsset).toBeNull()
  })
})

describe('atomic.filterAndSortAssets', () => {
  it('rebuilds the list with the Overmind login state', () => {
    const filterAndSortAssets = jest.fn()
    useAssetsStore.setState({ filterAndSortAssets })
    const { actions } = setup({ wax: { isLoggedIn: false } })

    actions.filterAndSortAssets()

    expect(filterAndSortAssets).toHaveBeenCalledWith({ isLoggedIn: false })
  })
})
