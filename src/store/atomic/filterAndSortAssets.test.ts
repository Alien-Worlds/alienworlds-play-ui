import { router } from 'routes'
import { createAtomicMock } from 'store/atomic/testUtils/createAtomicMock'
import { AssetSchema, AssetsFilter, SortBy } from 'store/atomic/types'

jest.mock('routes', () => ({ router: { state: { location: { pathname: '/inventory' } } } }))

const setPath = (pathname: string) => {
  ;(router.state.location as { pathname: string }).pathname = pathname
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

// filterAndSortAssets writes its result after a 300ms debounce.
const run = async (action: () => Promise<unknown>) => {
  const promise = action()
  jest.advanceTimersByTime(300)
  await promise
}

const setup = (
  assets: any[],
  filter: Partial<AssetsFilter> = {},
  extra: Record<string, any> = {}
) =>
  createAtomicMock((state) => {
    state.atomic.assets = assets
    state.atomic.assetsFilter = makeFilter(filter)
    state.atomic.triggerFilterAndSortAssets = true
    Object.assign(state.atomic, extra)
  })

const ids = (state: any) => state.atomic.filteredAndSortedAssets.map((x: any) => x.asset_id)

beforeEach(() => {
  jest.useFakeTimers()
  setPath('/inventory')
})

afterEach(() => {
  jest.useRealTimers()
})

describe('atomic.filterAndSortAssets', () => {
  describe('when it runs', () => {
    it('does nothing until triggered', async () => {
      const previous = [makeAsset('1')]
      const { state, actions } = createAtomicMock((s) => {
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
      const { state, actions } = createAtomicMock(
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

describe('atomic.setAssetsFilter', () => {
  it('stores the filter with its view for the current page and triggers a re-run', () => {
    setPath('/mining/tools')
    const { state, actions } = createAtomicMock((s) => {
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
