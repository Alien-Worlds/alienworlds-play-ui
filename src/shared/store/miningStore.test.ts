import { useMiningStore, getInitialMiningState } from 'shared/store/miningStore'
import { AssetSchema, AssetsFilter, SortBy } from 'store/atomic/types'

const realStore = useMiningStore.getState()

const setPath = (pathname: string) => window.history.pushState({}, '', pathname)

// Seeds the store and exposes it in the shape these tests were written against:
// `state.atomic` is the current store state; `actions` call the store with the login state.
const seedStore = (
  mutateState: (state: any) => void = () => {},
  { isLoggedIn = true }: { isLoggedIn?: boolean } = {}
) => {
  const seed: any = { atomic: getInitialMiningState() }
  mutateState(seed)
  useMiningStore.setState({ ...realStore, ...seed.atomic }, true)

  return {
    state: {
      get atomic() {
        return useMiningStore.getState()
      },
    } as any,
    actions: {
      filterAndSortAssets: () => useMiningStore.getState().filterAndSortAssets({ isLoggedIn }),
      setAssetsFilter: (filter: AssetsFilter) => useMiningStore.getState().setAssetsFilter(filter),
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

describe('miningStore.filterAndSortAssets', () => {
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

describe('miningStore.setAssetsFilter', () => {
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

describe('miningStore land filter', () => {
  beforeEach(() => jest.useFakeTimers())
  afterEach(() => jest.useRealTimers())

  it('stores the land filter and reports loading briefly', () => {
    seedStore()
    const filter = { ...getInitialMiningState().landAssetsFilter, owner: 'bob' }

    useMiningStore.getState().setLandAssetsFilter(filter)

    expect(useMiningStore.getState().landAssetsFilter).toEqual({ ...filter, isLoading: true })
    jest.advanceTimersByTime(200)
    expect(useMiningStore.getState().landAssetsFilter).toEqual({ ...filter, isLoading: false })
  })

  it('resets the land filter to the defaults', () => {
    seedStore((s) => {
      s.atomic.landAssetsFilter = { ...s.atomic.landAssetsFilter, owner: 'bob', sortBy: 'Owner' }
    })

    useMiningStore.getState().resetLandAssetsFilter()
    jest.advanceTimersByTime(200)

    expect(useMiningStore.getState().landAssetsFilter).toEqual(
      getInitialMiningState().landAssetsFilter
    )
  })
})

describe('miningStore.syncLandRating', () => {
  it('copies the new rating onto the loaded and filtered assets', () => {
    const land = { asset_id: '42', mutable_data: { landrating: '10' } }
    seedStore((s) => {
      s.atomic.assets = [land, makeAsset('1')]
      s.atomic.filteredAndSortedAssets = [land]
    })

    useMiningStore
      .getState()
      .syncLandRating({ asset_id: '42', mutable_data: { landrating: '99' } } as any)

    const { assets, filteredAndSortedAssets } = useMiningStore.getState()
    expect(assets[0].mutable_data.landrating).toBe('99')
    expect(filteredAndSortedAssets[0].mutable_data.landrating).toBe('99')
  })

  it('leaves unloaded assets alone', () => {
    seedStore()

    useMiningStore.getState().syncLandRating({ asset_id: '42', mutable_data: {} } as any)

    expect(useMiningStore.getState().assets).toBeNull()
  })
})
