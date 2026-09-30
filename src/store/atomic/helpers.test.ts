import {
  bindAssetsFilterView,
  DEFAULT_COMMISSION_RANGE,
  DEFAULT_EASE_RANGE,
  DEFAULT_LUCK_RANGE,
  DEFAULT_POW_RANGE,
  DEFAULT_RECHARGE_RANGE,
  defaultSortByNameOption,
  defaultSortByRarityOption,
  getDefaultAssetsFilter,
  getDefaultLandAssetsFilter,
  mapToSelectedSortByOption,
  mapToSortByOptions,
} from 'store/atomic/helpers'
import { AssetSchema, AssetsFilter, SortBy } from 'store/atomic/types'

const names = (schema: AssetSchema) => mapToSortByOptions(schema).map((x) => x.name)

describe('mapToSortByOptions', () => {
  it('lists every option once, alphabetically, for all schemas', () => {
    expect(names(null)).toEqual([
      'Affinity',
      'Attack',
      'Charge',
      'Defense',
      'Element',
      'Item Type',
      'Key',
      'Luck',
      'Mine',
      'Move Cost',
      'Name',
      'POW',
      'Process',
      'Rarity',
      'Shine',
    ])
  })

  it.each([
    [AssetSchema.TOOL, ['Charge', 'Luck', 'Mine', 'Name', 'POW', 'Rarity', 'Shine']],
    [AssetSchema.LAND, ['Charge', 'Luck', 'Mine', 'Name', 'POW', 'Rarity']],
    [AssetSchema.CREW, ['Attack', 'Defense', 'Move Cost', 'Name', 'Rarity', 'Shine']],
    [AssetSchema.ARMS, ['Attack', 'Defense', 'Name', 'Rarity', 'Shine']],
    [AssetSchema.ORE, ['Element', 'Key', 'Name', 'Process', 'Rarity', 'Shine']],
    [AssetSchema.ITEMS, ['Affinity', 'Element', 'Item Type', 'Name', 'Rarity']],
    [AssetSchema.FACES, ['Name', 'Rarity', 'Shine']],
  ])('lists the options for %s', (schema, expected) => {
    expect(names(schema)).toEqual(expected)
  })
})

describe('mapToSelectedSortByOption', () => {
  it('returns the matching option for the schema', () => {
    expect(mapToSelectedSortByOption(AssetSchema.TOOL, SortBy.LUCK)).toEqual({
      name: 'Luck',
      sortBy: SortBy.LUCK,
    })
  })

  it('falls back to Rarity for tools when the sort is not offered', () => {
    expect(mapToSelectedSortByOption(AssetSchema.TOOL, SortBy.ATTACK)).toEqual(
      defaultSortByRarityOption
    )
  })

  it('falls back to Name for other schemas when the sort is not offered', () => {
    expect(mapToSelectedSortByOption(AssetSchema.CREW, SortBy.LUCK)).toEqual(
      defaultSortByNameOption
    )
  })
})

describe('bindAssetsFilterView', () => {
  const makeFilter = (assetSchema: AssetSchema, sortBy = SortBy.NAME): AssetsFilter => ({
    assetSchema,
    sortBy,
    groupByTemplate: true,
    reversed: false,
    view: null,
  })

  it('returns a falsy filter unchanged', () => {
    expect(bindAssetsFilterView(null, '/inventory')).toBeNull()
  })

  it('shows Ore, Items and Land tabs on the inventory page', () => {
    const filter = bindAssetsFilterView(makeFilter(AssetSchema.LAND), '/inventory')

    expect(filter.view.tabOptions.map((x) => x.name)).toEqual([
      'All',
      'Equipment',
      'Avatars',
      'Weapons',
      'Minions',
      'Ore',
      'Items',
      'Land',
    ])
    expect(filter.view.selectedTabIndex).toBe(7)
  })

  it('hides Ore, Items and Land tabs outside the inventory page', () => {
    const filter = bindAssetsFilterView(makeFilter(AssetSchema.TOOL), '/mining/tools')

    expect(filter.view.tabOptions.map((x) => x.name)).toEqual([
      'All',
      'Equipment',
      'Avatars',
      'Weapons',
      'Minions',
    ])
    expect(filter.view.selectedTabIndex).toBe(1)
  })

  it('selects index -1 when the schema has no tab on the page', () => {
    const filter = bindAssetsFilterView(makeFilter(AssetSchema.LAND), '/shining')

    expect(filter.view.selectedTabIndex).toBe(-1)
  })

  it('binds the sort options and the selected sort to the filter in place', () => {
    const input = makeFilter(AssetSchema.TOOL, SortBy.LUCK)
    const filter = bindAssetsFilterView(input, '/inventory')

    expect(filter).toBe(input)
    expect(filter.view.sortByOptions).toEqual(mapToSortByOptions(AssetSchema.TOOL))
    expect(filter.view.selectedSortByOption).toEqual({ name: 'Luck', sortBy: SortBy.LUCK })
  })
})

describe('getDefaultAssetsFilter', () => {
  it.each(['/inventory', '/shining', '/landMgt/123'])('sorts all schemas by name on %s', (page) => {
    expect(getDefaultAssetsFilter(page)).toEqual({
      sortBy: SortBy.NAME,
      groupByTemplate: true,
      reversed: false,
      assetSchema: null,
      view: null,
    })
  })

  it('sorts tools by rarity on the tools page', () => {
    expect(getDefaultAssetsFilter('/mining/tools')).toEqual({
      sortBy: SortBy.RARITY,
      groupByTemplate: true,
      reversed: false,
      assetSchema: AssetSchema.TOOL,
      view: null,
    })
  })

  it('returns null on pages without an assets filter', () => {
    expect(getDefaultAssetsFilter('/mining')).toBeNull()
  })
})

describe('getDefaultLandAssetsFilter', () => {
  it('returns the default land filter using the shared default ranges', () => {
    const filter = getDefaultLandAssetsFilter()

    expect(filter).toEqual({
      isLoading: false,
      reversed: false,
      terrain: 'ALL',
      rarity: 'ALL',
      filteredLands: null,
      owner: null,
      sortBy: 'Random',
      recharge: [0.7, 5],
      miningPower: [0.6, 2.5],
      pow: [0, 2],
      luck: [0.5, 2.5],
      commission: [0, 25],
      x: null,
      y: null,
    })
    // filterLandAssets compares ranges to these constants by identity (see landAssetsFilter.test.ts).
    expect(filter.recharge).toBe(DEFAULT_RECHARGE_RANGE)
    expect(filter.miningPower).toBe(DEFAULT_EASE_RANGE)
    expect(filter.pow).toBe(DEFAULT_POW_RANGE)
    expect(filter.luck).toBe(DEFAULT_LUCK_RANGE)
    expect(filter.commission).toBe(DEFAULT_COMMISSION_RANGE)
  })
})
