import { uniqBy, toUpper } from 'lodash'
import { matchPath, matchRoutes } from 'react-router'
import {
  AssetSchema,
  AssetsFilter,
  AssetsFilterView,
  LandAssetsFilter,
  SortBy,
} from 'store/atomic/types'
import { PagePath } from 'store/main/types'

export const mapToSortByOptions = (schema: AssetSchema) => {
  const sortByOptions = [
    {
      name: 'Name',
      sortBy: SortBy.NAME,
    },
    { name: 'Rarity', sortBy: SortBy.RARITY },
  ]

  if (schema !== AssetSchema.LAND && schema !== AssetSchema.ITEMS) {
    sortByOptions.push({
      name: 'Shine',
      sortBy: SortBy.SHINE,
    })
  }

  if (schema === null || schema === AssetSchema.TOOL || schema === AssetSchema.LAND) {
    sortByOptions.push({
      name: 'Charge',
      sortBy: SortBy.DELAY,
    })
    sortByOptions.push({
      name: 'Mine',
      sortBy: SortBy.EASE,
    })
    sortByOptions.push({
      name: 'POW',
      sortBy: SortBy.DIFFICULTY,
    })
    sortByOptions.push({
      name: 'Luck',
      sortBy: SortBy.LUCK,
    })
  }

  if (schema === null || schema === AssetSchema.CREW || schema === AssetSchema.ARMS) {
    sortByOptions.push({
      name: 'Attack',
      sortBy: SortBy.ATTACK,
    })
    sortByOptions.push({
      name: 'Defense',
      sortBy: SortBy.DEFENSE,
    })

    if (schema !== AssetSchema.ARMS) {
      sortByOptions.push({
        name: 'Move Cost',
        sortBy: SortBy.MOVE_COST,
      })
    }
  }

  if (schema === null || schema === AssetSchema.ORE) {
    sortByOptions.push({
      name: 'Key',
      sortBy: SortBy.KEY,
    })
    sortByOptions.push({
      name: 'Element',
      sortBy: SortBy.ELEMENT,
    })
    sortByOptions.push({
      name: 'Process',
      sortBy: SortBy.PROCESS,
    })
  }

  if (schema === null || schema === AssetSchema.ITEMS) {
    sortByOptions.push({
      name: 'Affinity',
      sortBy: SortBy.AFFINITY,
    })
    sortByOptions.push({
      name: 'Item Type',
      sortBy: SortBy.ARTIFACT_TYPE,
    })
    sortByOptions.push({
      name: 'Element',
      sortBy: SortBy.ELEMENT,
    })
  }

  sortByOptions.sort((a, b) => {
    const nameA = toUpper(a.name)
    const nameB = toUpper(b.name)
    if (nameA < nameB) return -1
    if (nameA > nameB) return 1
    return 0
  })

  // Some sortBy options are shared between multiple schemas (ie. 'Element' for Ore and Items),
  // so it is necessary to remove duplicates from the array generated to avoid those options
  // to appear multiple times in the sorting component.
  const uniqueSortByOptions = uniqBy(sortByOptions, 'name')

  return uniqueSortByOptions
}
export const defaultSortByNameOption = mapToSortByOptions(null).find(
  (x) => x.sortBy === SortBy.NAME
)
export const defaultSortByRarityOption = mapToSortByOptions(null).find(
  (x) => x.sortBy === SortBy.RARITY
)

export const mapToSelectedSortByOption = (schema: AssetSchema, sortBy: SortBy) => {
  const defaultOption =
    schema === AssetSchema.TOOL ? defaultSortByRarityOption : defaultSortByNameOption

  const finalOption = mapToSortByOptions(schema).find((x) => x.sortBy === sortBy) ?? defaultOption
  return finalOption
}
const mapToTabOptions = (page: string) => {
  const tabOptions = [
    { name: 'All', assetSchema: null },
    { name: 'Equipment', assetSchema: AssetSchema.TOOL },
    { name: 'Avatars', assetSchema: AssetSchema.FACES },
    { name: 'Weapons', assetSchema: AssetSchema.ARMS },
    { name: 'Minions', assetSchema: AssetSchema.CREW },
  ]

  const shouldOresTabBeVisible = page.startsWith(PagePath.Inventory)
  if (shouldOresTabBeVisible) {
    tabOptions.push({
      name: 'Ore',
      assetSchema: AssetSchema.ORE,
    })
  }

  const shouldItemsTabBeVisible = page.startsWith(PagePath.Inventory)
  if (shouldItemsTabBeVisible) {
    tabOptions.push({
      name: 'Items',
      assetSchema: AssetSchema.ITEMS,
    })
  }

  const shouldLandTabBeVisible = page.startsWith(PagePath.Inventory)
  if (shouldLandTabBeVisible) {
    tabOptions.push({
      name: 'Land',
      assetSchema: AssetSchema.LAND,
    })
  }

  return tabOptions
}

const mapToTabIndex = (schema: AssetSchema, currentPage: string) =>
  mapToTabOptions(currentPage)
    .map((tab) => tab.assetSchema)
    .indexOf(schema) ?? 0

export const bindAssetsFilterView = (filter: AssetsFilter, currentPage: string) => {
  if (!filter) return filter

  const filterView: AssetsFilterView = {
    sortByOptions: mapToSortByOptions(filter.assetSchema),
    selectedSortByOption: mapToSelectedSortByOption(filter.assetSchema, filter.sortBy),
    tabOptions: mapToTabOptions(currentPage),
    selectedTabIndex: mapToTabIndex(filter.assetSchema, currentPage),
  }

  filter.view = filterView

  return filter
}

export const getDefaultAssetsFilter = (currentPage: string): AssetsFilter => {
  const isToolsPage = matchPath(PagePath.Tools, currentPage)
  const isOtherPage = matchRoutes(
    [{ path: PagePath.Inventory }, { path: PagePath.Shining }, { path: PagePath.LandMgtSubpage }],
    currentPage
  )

  if (isOtherPage) {
    return {
      sortBy: SortBy.NAME,
      groupByTemplate: true,
      reversed: false,
      assetSchema: null,
      view: null,
    }
  }
  if (isToolsPage) {
    return {
      sortBy: SortBy.RARITY,
      groupByTemplate: true,
      reversed: false,
      assetSchema: AssetSchema.TOOL,
      view: null,
    }
  }

  return null
}

export const DEFAULT_RECHARGE_RANGE = [0.7, 5]
export const DEFAULT_EASE_RANGE = [0.6, 2.5]
export const DEFAULT_POW_RANGE = [0, 2]
export const DEFAULT_LUCK_RANGE = [0.5, 2.5]
export const DEFAULT_COMMISSION_RANGE = [0, 25]

export const getDefaultLandAssetsFilter = () =>
  <LandAssetsFilter>{
    isLoading: false,
    reversed: false,
    terrain: 'ALL',
    rarity: 'ALL',
    filteredLands: null,
    owner: null,
    sortBy: 'Random',
    recharge: DEFAULT_RECHARGE_RANGE,
    miningPower: DEFAULT_EASE_RANGE,
    pow: DEFAULT_POW_RANGE,
    luck: DEFAULT_LUCK_RANGE,
    commission: DEFAULT_COMMISSION_RANGE,
    x: null,
    y: null,
  }
