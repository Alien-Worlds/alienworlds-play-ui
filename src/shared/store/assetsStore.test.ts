import { getInitialAssetsState, useAssetsStore } from 'shared/store/assetsStore'
import { useMinerStore } from 'shared/store/minerStore'
import { useModalStore } from 'shared/store/modalStore'
import { useSessionStore } from 'shared/store/sessionStore'
import {
  buildSetAvatarActions,
  buildSetBagActions,
  buildSetLandActions,
} from 'shared/wax/assetActions'
import { AssetSchema, AssetsFilter, SortBy } from 'store/atomic/types'

const mockTransact = jest.fn()
jest.mock('shared/wax/transact', () => ({
  transact: (actions: unknown) => mockTransact(actions),
}))

const mockGetAssetById = jest.fn()
jest.mock('shared/util/atomicassets', () => ({
  getAssetById: (id: string) => mockGetAssetById(id),
}))

const mockToastMessage = jest.fn()
const mockToastErrorMessage = jest.fn()
jest.mock('shared/util/toast', () => ({
  toastMessage: (message: string) => mockToastMessage(message),
  toastErrorMessage: (message: string) => mockToastErrorMessage(message),
}))

const mockScheduleSync = jest.fn()
jest.mock('shared/store/syncScheduler', () => ({
  scheduleSync: (...args: unknown[]) => mockScheduleSync(...args),
}))

const realStore = useAssetsStore.getState()

const setPath = (pathname: string) => window.history.pushState({}, '', pathname)

// Seeds the store and exposes it in the shape these tests were written against:
// `state.atomic` is the current store state; `actions` call the store with the login state.
const seedStore = (
  mutateState: (state: any) => void = () => {},
  { isLoggedIn = true }: { isLoggedIn?: boolean } = {}
) => {
  const seed: any = { atomic: getInitialAssetsState() }
  mutateState(seed)
  useAssetsStore.setState({ ...realStore, ...seed.atomic }, true)

  return {
    state: {
      get atomic() {
        return useAssetsStore.getState()
      },
    } as any,
    actions: {
      filterAndSortAssets: () => useAssetsStore.getState().filterAndSortAssets({ isLoggedIn }),
      setAssetsFilter: (filter: AssetsFilter) => useAssetsStore.getState().setAssetsFilter(filter),
    },
  }
}

const makeAsset = (
  id: string,
  { schema = AssetSchema.TOOL, template = `t${id}`, ...data }: Record<string, any> = {}
) => ({
  asset_id: id,
  schema: { schema_name: schema },
  template: { template_id: template },
  data: { name: `Asset ${id}`, ...data },
})

const makeFilter = (overrides: Partial<AssetsFilter> = {}): AssetsFilter => ({
  assetSchema: null,
  sortBy: SortBy.NAME,
  groupByTemplate: false,
  reversed: false,
  view: null,
  ...overrides,
})

const run = async (action: () => unknown) => {
  await action()
}

const setup = (
  assets: any[],
  filter: Partial<AssetsFilter> = {},
  extra: Record<string, any> = {}
) =>
  seedStore((state) => {
    state.atomic.assets = assets
    state.atomic.assetsFilter = makeFilter(filter)
    state.atomic.triggerFilterAndSortAssets = true
    Object.assign(state.atomic, extra)
  })

const ids = (state: any) => state.atomic.filteredAndSortedAssets.map((x: any) => x.asset_id)

beforeEach(() => {
  setPath('/inventory')
})

describe('assetsStore.filterAndSortAssets', () => {
  describe('when it runs', () => {
    it('does nothing until triggered', async () => {
      const previous = [makeAsset('1')]
      const { state, actions } = seedStore((s) => {
        s.atomic.assets = [makeAsset('2')]
        s.atomic.assetsFilter = makeFilter()
        s.atomic.filteredAndSortedAssets = previous
      })

      await run(() => actions.filterAndSortAssets())

      expect(ids(state)).toEqual(['1'])
    })

    it('does nothing outside the asset pages and keeps the trigger set', async () => {
      setPath('/mining')
      const { state, actions } = setup([makeAsset('1')])

      await run(() => actions.filterAndSortAssets())

      expect(state.atomic.filteredAndSortedAssets).toBeNull()
      expect(state.atomic.triggerFilterAndSortAssets).toBe(true)
    })

    it.each(['/inventory', '/shining', '/mining/tools', '/landMgt/42'])(
      'runs on %s and clears the trigger',
      async (path) => {
        setPath(path)
        const { state, actions } = setup([makeAsset('1')])

        await run(() => actions.filterAndSortAssets())

        expect(ids(state)).toEqual(['1'])
        expect(state.atomic.triggerFilterAndSortAssets).toBe(false)
      }
    )

    it('clears the result when logged out', async () => {
      const { state, actions } = seedStore(
        (s) => {
          s.atomic.assets = [makeAsset('1')]
          s.atomic.assetsFilter = makeFilter()
          s.atomic.filteredAndSortedAssets = [makeAsset('1')]
          s.atomic.triggerFilterAndSortAssets = true
        },
        { isLoggedIn: false }
      )

      await run(() => actions.filterAndSortAssets())

      expect(state.atomic.filteredAndSortedAssets).toBeNull()
    })

    it('clears the result when there is no filter', async () => {
      const { state, actions } = setup(
        [makeAsset('1')],
        {},
        { assetsFilter: null, filteredAndSortedAssets: [] }
      )

      await run(() => actions.filterAndSortAssets())

      expect(state.atomic.filteredAndSortedAssets).toBeNull()
    })
  })

  describe('filtering', () => {
    it('keeps every schema when no schema is selected', async () => {
      const { state, actions } = setup([
        makeAsset('1', { schema: AssetSchema.TOOL }),
        makeAsset('2', { schema: AssetSchema.CREW }),
      ])

      await run(() => actions.filterAndSortAssets())

      expect(ids(state)).toEqual(['1', '2'])
    })

    it('keeps only the selected schema', async () => {
      const { state, actions } = setup(
        [
          makeAsset('1', { schema: AssetSchema.TOOL }),
          makeAsset('2', { schema: AssetSchema.CREW }),
        ],
        { assetSchema: AssetSchema.CREW }
      )

      await run(() => actions.filterAndSortAssets())

      expect(ids(state)).toEqual(['2'])
    })

    it('shows the whitelisted level templates under Ore', async () => {
      const { state, actions } = setup(
        [
          makeAsset('1', { schema: AssetSchema.ORE }),
          makeAsset('2', { schema: AssetSchema.LEVEL, template: '515558' }),
          makeAsset('3', { schema: AssetSchema.LEVEL, template: '999999' }),
        ],
        { assetSchema: AssetSchema.ORE }
      )

      await run(() => actions.filterAndSortAssets())

      expect(ids(state)).toEqual(['1', '2'])
    })
  })

  describe('grouping by template', () => {
    it('collapses assets with the same template and counts them', async () => {
      const { state, actions } = setup(
        [
          makeAsset('1', { template: 'drill' }),
          makeAsset('2', { template: 'drill' }),
          makeAsset('3', { template: 'axe' }),
        ],
        { groupByTemplate: true }
      )

      await run(() => actions.filterAndSortAssets())

      expect(
        state.atomic.filteredAndSortedAssets.map((x: any) => [x.asset_id, x.total_of_type])
      ).toEqual([
        ['1', 2],
        ['3', 1],
      ])
    })

    it('never groups land', async () => {
      const { state, actions } = setup(
        [
          makeAsset('1', { schema: AssetSchema.LAND, template: 'land' }),
          makeAsset('2', { schema: AssetSchema.LAND, template: 'land' }),
        ],
        { groupByTemplate: true }
      )

      await run(() => actions.filterAndSortAssets())

      expect(ids(state)).toEqual(['1', '2'])
    })

    it('keeps every asset when grouping is off', async () => {
      const { state, actions } = setup([
        makeAsset('1', { template: 'drill' }),
        makeAsset('2', { template: 'drill' }),
      ])

      await run(() => actions.filterAndSortAssets())

      expect(ids(state)).toEqual(['1', '2'])
    })

    it('keeps bag items out of the groups on the tools page', async () => {
      setPath('/mining/tools')
      const { state, actions } = setup(
        [
          makeAsset('1', { template: 'drill' }),
          makeAsset('2', { template: 'drill' }),
          makeAsset('3', { template: 'drill' }),
        ],
        { groupByTemplate: true },
        { bagAssets: [makeAsset('3', { template: 'drill' })] }
      )

      await run(() => actions.filterAndSortAssets())

      expect(
        state.atomic.filteredAndSortedAssets.map((x: any) => [x.asset_id, x.total_of_type])
      ).toEqual([
        ['1', 2],
        ['3', 1],
      ])
    })
  })

  describe('sorting', () => {
    it('sorts by name', async () => {
      const { state, actions } = setup([
        makeAsset('1', { name: 'Drill' }),
        makeAsset('2', { name: 'Axe' }),
        makeAsset('3', { name: 'Shovel' }),
      ])

      await run(() => actions.filterAndSortAssets())

      expect(ids(state)).toEqual(['2', '1', '3'])
    })

    it('sorts by rarity rank, not alphabetically', async () => {
      const { state, actions } = setup(
        [
          makeAsset('1', { rarity: 'Legendary' }),
          makeAsset('2', { rarity: 'Abundant' }),
          makeAsset('3', { rarity: 'Epic' }),
        ],
        { sortBy: SortBy.RARITY }
      )

      await run(() => actions.filterAndSortAssets())

      expect(ids(state)).toEqual(['2', '3', '1'])
    })

    it('reverses the order when reversed', async () => {
      const { state, actions } = setup(
        [makeAsset('1', { name: 'Drill' }), makeAsset('2', { name: 'Axe' })],
        { reversed: true }
      )

      await run(() => actions.filterAndSortAssets())

      expect(ids(state)).toEqual(['1', '2'])
    })

    it('sorts by charge time numerically', async () => {
      const { state, actions } = setup(
        [
          makeAsset('1', { delay: 100 }),
          makeAsset('2', { delay: 20 }),
          makeAsset('3', { delay: 1000 }),
        ],
        { sortBy: SortBy.DELAY }
      )

      await run(() => actions.filterAndSortAssets())

      expect(ids(state)).toEqual(['2', '1', '3'])
    })

    it.each([
      ['ease', SortBy.EASE],
      ['luck', SortBy.LUCK],
      ['attack', SortBy.ATTACK],
      ['defense', SortBy.DEFENSE],
      ['movecost', SortBy.MOVE_COST],
    ])('sorts by %s and puts assets without it last', async (field, sortBy) => {
      const { state, actions } = setup(
        [makeAsset('1', { [field]: 25 }), makeAsset('2'), makeAsset('3', { [field]: 5 })],
        { sortBy }
      )

      await run(() => actions.filterAndSortAssets())

      expect(ids(state)).toEqual(['3', '1', '2'])
    })

    it('keeps assets without the stat last when reversed', async () => {
      const { state, actions } = setup(
        [makeAsset('1', { ease: 25 }), makeAsset('2'), makeAsset('3', { ease: 5 })],
        { sortBy: SortBy.EASE, reversed: true }
      )

      await run(() => actions.filterAndSortAssets())

      expect(ids(state)).toEqual(['1', '3', '2'])
    })
  })
})

describe('assetsStore.setAssetsFilter', () => {
  it('stores the filter with its view for the current page and triggers a re-run', () => {
    setPath('/mining/tools')
    const { state, actions } = seedStore((s) => {
      s.atomic.filteredAndSortedAssets = [makeAsset('1')]
    })

    actions.setAssetsFilter(makeFilter({ assetSchema: AssetSchema.TOOL, sortBy: SortBy.LUCK }))

    expect(state.atomic.filteredAndSortedAssets).toBeNull()
    expect(state.atomic.triggerFilterAndSortAssets).toBe(true)
    expect(state.atomic.assetsFilter.sortBy).toBe(SortBy.LUCK)
    expect(state.atomic.assetsFilter.view.selectedSortByOption.name).toBe('Luck')
    expect(state.atomic.assetsFilter.view.tabOptions).toHaveLength(5)
  })
})

describe('assetsStore.syncLandRating', () => {
  it('copies the new rating onto the loaded and filtered assets', () => {
    const land = { asset_id: '42', mutable_data: { landrating: '10' } }
    seedStore((s) => {
      s.atomic.assets = [land, makeAsset('1')]
      s.atomic.filteredAndSortedAssets = [land]
    })

    useAssetsStore
      .getState()
      .syncLandRating({ asset_id: '42', mutable_data: { landrating: '99' } } as any)

    const { assets, filteredAndSortedAssets } = useAssetsStore.getState()
    expect(assets[0].mutable_data.landrating).toBe('99')
    expect(filteredAndSortedAssets[0].mutable_data.landrating).toBe('99')
  })

  it('leaves unloaded assets alone', () => {
    seedStore()

    useAssetsStore.getState().syncLandRating({ asset_id: '42', mutable_data: {} } as any)

    expect(useAssetsStore.getState().assets).toBeNull()
  })
})

describe('assetsStore transactions', () => {
  const realAssets = useAssetsStore.getState()

  beforeEach(() => {
    jest.clearAllMocks()
    mockTransact.mockResolvedValue({})
    mockGetAssetById.mockImplementation(async (id: string) => ({ asset_id: id, data: {} }))
    useSessionStore.getState().setWalletId('miner.wam')
    useAssetsStore.setState({ ...realAssets, ...getInitialAssetsState() }, true)
    useModalStore.setState({ miningToolsDrawer: { isOpen: true, activeSlotIndex: 1 } })
  })

  describe('setBag', () => {
    it('equips the tools, loads them and asks for a re-sort', async () => {
      useAssetsStore.setState({ bag: { items: ['1'] } as any })

      await useAssetsStore.getState().setBag(['1', '2'])

      expect(mockTransact).toHaveBeenCalledWith(buildSetBagActions('miner.wam', ['1', '2']))
      expect(mockToastMessage).toHaveBeenCalledWith('Tool Slot #2 equipped successfully.')
      expect(useAssetsStore.getState().bag.items).toEqual(['1', '2'])
      expect(useAssetsStore.getState().bagAssets.map((x) => x.asset_id)).toEqual(['1', '2'])
      expect(useAssetsStore.getState().triggerFilterAndSortAssets).toBe(true)
      expect(mockScheduleSync).toHaveBeenCalledWith(['bag'], 5)
    })

    it.each([
      [['1', '2'], ['1', '3'], 'Tool Slot #2 updated successfully.'],
      [['1', '2'], ['1'], 'Tool Slot #2 cleared successfully.'],
    ])('says whether the slot was updated or cleared', async (before, after, message) => {
      useAssetsStore.setState({ bag: { items: before } as any })

      await useAssetsStore.getState().setBag(after)

      expect(mockToastMessage).toHaveBeenCalledWith(message)
    })

    it('shows the chain error and changes nothing when the transaction fails', async () => {
      mockTransact.mockRejectedValue(new Error('assertion failure: BAG_MUST_OWN'))
      useAssetsStore.setState({ bag: { items: ['1'] } as any })

      await useAssetsStore.getState().setBag(['1', '2'])

      expect(mockToastErrorMessage).toHaveBeenCalledWith('Error: assertion failure: BAG_MUST_OWN')
      expect(useAssetsStore.getState().bag.items).toEqual(['1'])
      expect(mockScheduleSync).not.toHaveBeenCalled()
    })

    it('does nothing without a wallet', async () => {
      useSessionStore.getState().setWalletId(null)

      await useAssetsStore.getState().setBag(['1'])

      expect(mockTransact).not.toHaveBeenCalled()
    })
  })

  describe('setLand', () => {
    it('sets the mining land and its planet', async () => {
      mockGetAssetById.mockResolvedValue({ asset_id: '42', data: { name: 'Plains on Kavian' } })
      useMinerStore.getState().setMiner({} as any)

      await useAssetsStore.getState().setLand('42')

      expect(mockTransact).toHaveBeenCalledWith(buildSetLandActions('miner.wam', '42'))
      expect(mockToastMessage).toHaveBeenCalledWith('Mining Land updated successfully.')
      expect(useAssetsStore.getState().landAsset.asset_id).toBe('42')
      expect(useMinerStore.getState().planetSelectedForMining).toBe('kavian')
      expect(mockScheduleSync).toHaveBeenCalledWith(['land'], 15)
    })

    it('shows the chain error when the transaction fails', async () => {
      mockTransact.mockRejectedValue(new Error('no'))

      await useAssetsStore.getState().setLand('42')

      expect(mockToastErrorMessage).toHaveBeenCalledWith('Error: no')
      expect(useAssetsStore.getState().landAsset).toBeNull()
    })
  })

  describe('setAvatar', () => {
    it('sets the avatar', async () => {
      await useAssetsStore.getState().setAvatar('1099')

      expect(mockTransact).toHaveBeenCalledWith(buildSetAvatarActions('miner.wam', '1099'))
      expect(mockToastMessage).toHaveBeenCalledWith('Avatar updated successfully.')
      expect(useAssetsStore.getState().avatarAsset.asset_id).toBe('1099')
      expect(mockScheduleSync).toHaveBeenCalledWith(['avatar'], 15)
    })
  })
})

describe('assetsStore.presetAssetsFilter', () => {
  it.each([
    ['/inventory', SortBy.NAME, null],
    ['/mining/tools', SortBy.RARITY, AssetSchema.TOOL],
    ['/shining', SortBy.NAME, null],
  ])('sets the default filter for %s', (path, sortBy, assetSchema) => {
    setPath(path)
    seedStore((s) => {
      s.atomic.assetsFilter = makeFilter({ sortBy: SortBy.LUCK, reversed: true })
    })

    useAssetsStore.getState().presetAssetsFilter()

    expect(useAssetsStore.getState().assetsFilter).toMatchObject({
      sortBy,
      assetSchema,
      groupByTemplate: true,
      reversed: false,
    })
  })

  it('starts from the page default when there is no filter yet', () => {
    setPath('/mining/tools')
    seedStore()

    useAssetsStore.getState().presetAssetsFilter()

    expect(useAssetsStore.getState().assetsFilter).toMatchObject({
      sortBy: SortBy.RARITY,
      assetSchema: AssetSchema.TOOL,
    })
  })

  it('keeps the filter on other pages', () => {
    setPath('/landMgt/42')
    seedStore((s) => {
      s.atomic.assetsFilter = makeFilter({ sortBy: SortBy.LUCK, reversed: true })
    })

    useAssetsStore.getState().presetAssetsFilter()

    expect(useAssetsStore.getState().assetsFilter).toMatchObject({
      sortBy: SortBy.LUCK,
      reversed: true,
    })
  })
})
