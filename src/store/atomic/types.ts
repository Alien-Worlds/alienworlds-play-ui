import { Option } from '@alien-worlds/uikit'
import { IAsset } from 'atomicassets/build/API/Explorer/Objects'

export enum AssetSchema {
  CREW = 'crew.worlds',
  TOOL = 'tool.worlds',
  ITEMS = 'items.worlds',
  FACES = 'faces.worlds',
  LAND = 'land.worlds',
  ARMS = 'arms.worlds',
  LEVEL = 'level.worlds',
  // @TODO change ore schema to production value when we release nft with it
  ORE = 'ore.worlds',
}

export enum AssetShine {
  Stone = 0,
  Gold = 1,
  Stardust = 2,
  Antimatter = 3,
}

export enum SortBy {
  NAME,
  RARITY,
  SHINE,
  DELAY,
  EASE,
  DIFFICULTY,
  LUCK,
  ATTACK,
  DEFENSE,
  MOVE_COST,
  KEY,
  ELEMENT,
  PROCESS,
  AFFINITY,
  ARTIFACT_TYPE,
}

type TabOption = {
  name: string
  assetSchema: AssetSchema
}

type SortByOption = {
  name: string
  sortBy: SortBy
}

export type AssetsFilterView = {
  sortByOptions: SortByOption[]
  selectedSortByOption: SortByOption
  tabOptions: TabOption[]
  selectedTabIndex: number
}

export type AssetsFilter = {
  assetSchema: AssetSchema
  groupByTemplate: boolean
  sortBy: SortBy
  reversed: boolean
  view?: AssetsFilterView
}
export const filterTerrainsOptions: Option[] = [
  { value: 'ALL', label: 'ALL' },
  { value: 'Active Volcano', label: 'Active Volcano' },
  { value: 'Dormant Volcano', label: 'Dormant Volcano' },
  { value: 'Dunes', label: 'Dunes' },
  { value: 'Geothermal Springs', label: 'Geothermal Springs' },
  { value: 'Grass Coastline', label: 'Grass Coastline' },
  { value: 'Grassland', label: 'Grassland' },
  { value: 'Icy Desert', label: 'Icy Desert' },
  { value: 'Icy Mountains', label: 'Icy Mountains' },
  { value: 'Inland River', label: 'Inland River' },
  { value: 'Methane Swampland', label: 'Methane Swampland' },
  { value: 'Mountains', label: 'Mountains' },
  { value: 'Mushroom Forest', label: 'Mushroom Forest' },
  { value: 'Plains', label: 'Plains' },
  { value: 'Rocky Coastline', label: 'Rocky Coastline' },
  { value: 'Rocky Crater', label: 'Rocky Crater' },
  { value: 'Rocky Desert', label: 'Rocky Desert' },
  { value: 'Sandy Coastline', label: 'Sandy Coastline' },
  { value: 'Sandy Desert', label: 'Sandy Desert' },
  { value: 'Small Island', label: 'Small Island' },
  { value: 'Tree Forest', label: 'Tree Forest' },
]

export const filterLandRarities: Option[] = [
  { label: 'ALL', value: 'ALL' },
  { label: 'Common', value: 'Common' },
  { label: 'Rare', value: 'Rare' },
  { label: 'Epic', value: 'Epic' },
  { label: 'Legendary', value: 'Legendary' },
]

export const sortLandsByOptions: Option[] = [
  { label: 'Random', value: 'Random' },
  { label: 'Mining Power', value: 'Mining Power' },
  { label: 'NFT Power', value: 'NFT Power' },
  { label: 'Owner', value: 'Owner' },
  { label: 'Rarity', value: 'Rarity' },
  { label: 'Recharge Multiplier', value: 'Recharge Multiplier' },
  { label: 'POW', value: 'POW' },
  { label: 'Terrain', value: 'Terrain' },
  { label: 'Commission', value: 'Commission' },
]

export type LandAssetsFilter = {
  filteredLands: IAsset[]
  isLoading: boolean
  reversed: boolean
  terrain: string
  rarity: string
  sortBy: string
  owner: string
  recharge: number | number[]
  miningPower: number | number[]
  pow: number | number[]
  luck: number | number[]
  commission: number | number[]
  x: number
  y: number
}

export enum AssetType {
  CREW = 'crew.worlds',
  TOOL = 'tool.worlds',
  FACES = 'faces.worlds',
  LAND = 'land.worlds',
  ARMS = 'arms.worlds',
  LEVEL = 'level.worlds',
  ITEMS = 'items.worlds',
}

export enum AssetProcess {
  CATALYST = 'Catalyst',
  FUSION = 'Fusion',
  MATERIAL = 'Material',
}

export enum AssetElement {
  AIR = 'Air',
  FIRE = 'Fire',
  GEM = 'Gem',
  METAL = 'Metal',
  NATURE = 'Nature',
  NEUTRAL = 'Neutral',
}

export type FilterByOption = {
  name: string
  filterBy: ToolType
}

export type FilterByToolType = {
  filterByOptions: FilterByOption[]
  selectedFilterByOption: FilterByOption
}

export enum ToolType {
  ALL = 'ALL',
  MANIPULATOR = 'Manipulator',
  EXOTOOL = 'Exotool',
  EXPLOSIVE = 'Explosive',
  EXTRACTOR = 'Extractor',
}

export const filterByToolTypeDefaultOption: FilterByOption = {
  name: 'Tool Type',
  filterBy: null,
}

export const filterByToolTypeOptions: FilterByOption[] = [
  {
    name: ToolType.ALL,
    filterBy: ToolType.ALL,
  },
  {
    name: ToolType.MANIPULATOR,
    filterBy: ToolType.MANIPULATOR,
  },
  {
    name: ToolType.EXOTOOL,
    filterBy: ToolType.EXOTOOL,
  },
  {
    name: ToolType.EXPLOSIVE,
    filterBy: ToolType.EXPLOSIVE,
  },
  {
    name: ToolType.EXTRACTOR,
    filterBy: ToolType.EXTRACTOR,
  },
]
