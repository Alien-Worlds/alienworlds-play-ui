import _, { toLower } from 'lodash'
import orderBy from 'lodash/orderBy'
import _shuffle from 'lodash/shuffle'

export type PlanetFiltersType = {
  owner: string
  pow: number[]
  recharge: number[]
  commission: number[]
  nftPower: number[]
  miningPower: number[]
  type: FilterLandTypesBy
  rarity: FilterLandRarityBy
  coordinates: { x: number | undefined; y: number | undefined }
}

enum FilterLandTypesBy {
  ALL = 'ALL',
  ACTIVE_VOLCANO = 'Active Volcano',
  DORMANT_VOLCANO = 'Dormant Volcano',
  DUNES = 'Dunes',
  GEOTHERMAL_SPRINGS = 'Geothermal Springs',
  GRASS_COASTLINE = 'Grass Coastline',
  GRASSLAND = 'Grassland',
  ICY_DESERT = 'Icy Desert',
  ICY_MOUNTAINS = 'Icy Mountains',
  INLAND_RIVER = 'Inland River',
  METHANE_SWAMPLAND = 'Methane Swampland',
  MOUNTAINS = 'Mountains',
  MUSHROOM_FOREST = 'Mushroom Forest',
  PLAINS = 'Plains',
  ROCKY_COASTLINE = 'Rocky Coastline',
  ROCKY_CRATER = 'Rocky Crater',
  ROCKY_DESERT = 'Rocky Desert',
  SANDY_COASTLINE = 'Sandy Coastline',
  SANDY_DESERT = 'Sandy Desert',
  SMALL_ISLAND = 'Small Island',
  TREE_FOREST = 'Tree Forest',
}

enum FilterLandRarityBy {
  ALL = 'ALL',
  COMMON = 'Common',
  RARE = 'Rare',
  EPIC = 'Epic',
  LEGENDARY = 'Legendary',
}

enum SorterLandsBy {
  COMMISSION = 'Commission',
  MINING_POWER = 'Mining Power',
  NFT_POWER = 'NFT Power',
  OWNER = 'Owner',
  RARITY = 'Rarity',
  RECHARGE_MULT = 'Recharge Multiplier',
  POW = 'POW',
  TYPE = 'Terrain',
  RANDOM = '',
}

enum FilterTypes {
  EMPTY = '',
  ALL = 'ALL',
  POW = 'pow',
  TYPE = 'type',
  OWNER = 'owner',
  RARITY = 'rarity',
  NFT_POWER = 'nftPower',
  COMMISSION = 'commission',
  RECHARGE_MULT = 'recharge',
  MINING_POWER = 'miningPower',
  COORDINATES = 'coordinates',
}

const rarityValues = {
  unknown: 0,
  abundant: 1,
  common: 2,
  rare: 3,
  epic: 4,
  legendary: 5,
  mythical: 6,
}

export const MEGA_BOOST_NFT_DESCRIPTION = `
Burn this NFT to raise a specific Land's Rating to the average Rating between all lands.
`

export const SUPER_BOOST_NFT_DESCRIPTION = `
Burn this NFT to raise a specific Land's Rating halfway between your own Rating and the top Rating.
`

function sorterLands(currentSorter: string, lands: any[], sortingReversed: boolean): any[] {
  if (!lands || lands.length === 0) return []

  const sortingDirection = sortingReversed ? 'asc' : 'desc'
  const sortingDirectionAlt = sortingReversed ? 'desc' : 'asc'

  switch (currentSorter) {
    case SorterLandsBy.TYPE:
      return orderBy(
        lands,
        [(item) => item?.data?.name?.split(' on ')[0] ?? 0],
        [sortingDirectionAlt]
      )

    case SorterLandsBy.RARITY: {
      const forSort = [...lands]
      forSort.sort(function raritySort(a, b) {
        const aRarity = toLower(a?.data?.rarity) ?? 'unknown'
        const bRarity = toLower(b?.data?.rarity) ?? 'unknown'
        let value = 0
        if (sortingDirection === 'desc') {
          value = rarityValues[aRarity] > rarityValues[bRarity] ? -1 : 1
        } else {
          value = rarityValues[aRarity] < rarityValues[bRarity] ? -1 : 1
        }
        return value
      })

      return forSort
    }
    case SorterLandsBy.OWNER:
      return orderBy(lands, [(item) => item?.owner ?? 0], [sortingDirectionAlt])

    case SorterLandsBy.RECHARGE_MULT:
      return orderBy(lands, [(item) => item?.data?.delay ?? 0], [sortingDirection])

    case SorterLandsBy.MINING_POWER:
      return orderBy(lands, [(item) => item?.data?.ease ?? 0], [sortingDirection])

    case SorterLandsBy.POW:
      return orderBy(lands, [(item) => item?.data?.difficulty ?? 0], [sortingDirection])

    case SorterLandsBy.NFT_POWER:
      return orderBy(lands, [(item) => item?.data?.luck ?? 0], [sortingDirection])

    case SorterLandsBy.COMMISSION:
      return orderBy(
        lands,
        [(item) => item?.mutable_data?.commission / 100 ?? 0],
        [sortingDirection]
      )

    default:
      break
  }

  return lands
}

function filterLands(currentFilter: any, filterType: string, filters: any, lands: any[]): any[] {
  let filterByRarity = filters.rarity
  let filterByType = filters.type
  let filterByOwner = filters.owner
  let filterByMiningPower = filters.miningPower
  let filterByNFTPower = filters.nftPower
  let filterByPoW = filters.pow
  let filterByRecharge = filters.recharge
  let filterByCommission = filters.commission
  const filterByCoordinates = filters.coordinates

  if (!lands || lands.length === 0) return []

  // rarity
  if (filterType === FilterTypes.RARITY) filterByRarity = currentFilter
  if (filterByRarity !== FilterLandRarityBy.ALL) {
    lands = _.filter(lands, (land) => land?.data?.rarity === filterByRarity)
  }

  //  type
  if (filterType === FilterTypes.TYPE) filterByType = currentFilter
  if (filterByType !== FilterLandTypesBy.ALL) {
    lands = _.filter(lands, (land) => land?.data?.name?.split(' on ')[0] === filterByType)
  }

  // owner
  if (filterType === FilterTypes.OWNER) filterByOwner = currentFilter
  if (filterByOwner !== FilterTypes.ALL && filterByOwner !== '' && filterByOwner.length > 0) {
    if (filterByOwner.length > 1) {
      lands = _.filter(lands, (land) => land?.owner.includes(filterByOwner))
    } else {
      lands = []
    }
  }

  // recharge
  if (filterType === FilterTypes.RECHARGE_MULT) filterByRecharge = currentFilter
  if (!filterByRecharge.length) {
    if (!Number.isNaN(filterByRecharge) && filterByRecharge !== 0) {
      lands = _.filter(lands, (land) => land?.data?.delay / 10 === filterByRecharge)
    }
  } else if (filterByRecharge.length === 2) {
    lands = _.filter(
      lands,
      (land) =>
        land?.data?.delay / 10 >= filterByRecharge[0] &&
        land?.data?.delay / 10 <= filterByRecharge[1]
    )
  }

  // mining power
  if (filterType === FilterTypes.MINING_POWER) filterByMiningPower = currentFilter
  if (!filterByMiningPower.length) {
    if (!Number.isNaN(filterByMiningPower) && filterByMiningPower !== 0) {
      lands = _.filter(lands, (land) => land?.data?.ease / 10 === filterByMiningPower)
    }
  } else if (filterByMiningPower.length === 2) {
    lands = _.filter(
      lands,
      (land) =>
        land?.data?.ease / 10 >= filterByMiningPower[0] &&
        land?.data?.ease / 10 <= filterByMiningPower[1]
    )
  }

  // nft power
  if (filterType === FilterTypes.NFT_POWER) filterByNFTPower = currentFilter
  if (!filterByNFTPower.length) {
    if (!Number.isNaN(filterByNFTPower) && filterByNFTPower !== 0) {
      lands = _.filter(lands, (land) => land?.data?.luck / 10 === filterByNFTPower)
    }
  } else if (filterByNFTPower.length === 2) {
    lands = _.filter(
      lands,
      (land) =>
        land?.data?.luck / 10 >= filterByNFTPower[0] && land?.data?.luck / 10 <= filterByNFTPower[1]
    )
  }

  // pow
  if (filterType === FilterTypes.POW) filterByPoW = currentFilter
  if (!filterByPoW.length) {
    if (!Number.isNaN(filterByPoW)) {
      lands = _.filter(lands, (land) => land?.data?.difficulty === filterByPoW)
    }
  } else if (filterByPoW.length === 2) {
    lands = _.filter(
      lands,
      (land) => land?.data?.difficulty >= filterByPoW[0] && land?.data?.difficulty <= filterByPoW[1]
    )
  }

  // commission
  if (filterType === FilterTypes.COMMISSION) filterByCommission = currentFilter
  if (!filterByCommission.length) {
    if (!Number.isNaN(filterByCommission)) {
      lands = _.filter(lands, (land) => land?.mutable_data?.commission / 100 === filterByCommission)
    }
  } else if (filterByCommission.length === 2) {
    lands = _.filter(
      lands,
      (land) =>
        land?.mutable_data?.commission / 100 >= filterByCommission[0] &&
        land?.mutable_data?.commission / 100 <= filterByCommission[1]
    )
  }

  // coordinates
  if (filterByCoordinates.x !== undefined && filterByCoordinates.y !== undefined) {
    lands = _.filter(
      lands,
      (land) =>
        land?.immutable_data.x === filterByCoordinates.x &&
        land?.immutable_data.y === filterByCoordinates.y
    )
  }

  return lands
}

function selectFilterLands(
  value: string,
  type: string,
  filters: PlanetFiltersType,
  allLands: any[],
  sortedBy: string,
  sortingReversed: boolean,
  setFilters: any,
  setSortedLands: any
) {
  let orderedLands = []
  let filteredLands = []
  let shuffledLands = []
  let preorderedLands = []

  switch (type) {
    case FilterTypes.EMPTY:
      filteredLands = filterLands(filters.type, FilterTypes.TYPE, filters, allLands)
      shuffledLands = _shuffle([...filteredLands])
      setSortedLands(shuffledLands)
      break
    case FilterTypes.RARITY:
      setFilters({ ...filters, rarity: value })
      preorderedLands = sorterLands(sortedBy, allLands, sortingReversed)
      filteredLands = filterLands(value, FilterTypes.RARITY, filters, preorderedLands)
      shuffledLands = _shuffle([...filteredLands])
      orderedLands = sorterLands(sortedBy, shuffledLands, sortingReversed)
      setSortedLands(orderedLands)
      break
    case FilterTypes.TYPE:
      setFilters({ ...filters, type: value })
      preorderedLands = sorterLands(sortedBy, allLands, sortingReversed)
      filteredLands = filterLands(value, FilterTypes.TYPE, filters, preorderedLands)
      shuffledLands = _shuffle([...filteredLands])
      orderedLands = sorterLands(sortedBy, shuffledLands, sortingReversed)
      setSortedLands(orderedLands)
      break
    case FilterTypes.RECHARGE_MULT:
      setFilters({ ...filters, recharge: value })
      preorderedLands = sorterLands(sortedBy, allLands, sortingReversed)
      filteredLands = filterLands(value, FilterTypes.RECHARGE_MULT, filters, preorderedLands)
      shuffledLands = _shuffle([...filteredLands])
      orderedLands = sorterLands(sortedBy, shuffledLands, sortingReversed)
      setSortedLands(orderedLands)
      break
    case FilterTypes.MINING_POWER:
      setFilters({ ...filters, miningPower: value })
      preorderedLands = sorterLands(sortedBy, allLands, sortingReversed)
      filteredLands = filterLands(value, FilterTypes.MINING_POWER, filters, preorderedLands)
      shuffledLands = _shuffle([...filteredLands])
      orderedLands = sorterLands(sortedBy, shuffledLands, sortingReversed)
      setSortedLands(orderedLands)
      break
    case FilterTypes.NFT_POWER:
      setFilters({ ...filters, nftPower: value })
      preorderedLands = sorterLands(sortedBy, allLands, sortingReversed)
      filteredLands = filterLands(value, FilterTypes.NFT_POWER, filters, preorderedLands)
      shuffledLands = _shuffle([...filteredLands])
      orderedLands = sorterLands(sortedBy, shuffledLands, sortingReversed)
      setSortedLands(orderedLands)
      break
    case FilterTypes.POW:
      setFilters({ ...filters, pow: value })
      preorderedLands = sorterLands(sortedBy, allLands, sortingReversed)
      filteredLands = filterLands(value, FilterTypes.POW, filters, preorderedLands)
      shuffledLands = _shuffle([...filteredLands])
      orderedLands = sorterLands(sortedBy, shuffledLands, sortingReversed)
      setSortedLands(orderedLands)
      break
    case FilterTypes.COMMISSION:
      setFilters({ ...filters, commission: value })
      preorderedLands = sorterLands(sortedBy, allLands, sortingReversed)
      filteredLands = filterLands(value, FilterTypes.COMMISSION, filters, preorderedLands)
      shuffledLands = _shuffle([...filteredLands])
      orderedLands = sorterLands(sortedBy, shuffledLands, sortingReversed)
      setSortedLands(orderedLands)
      break
    default:
      break
  }
}

export {
  filterLands,
  sorterLands,
  selectFilterLands,
  rarityValues,
  SorterLandsBy,
  FilterTypes,
  FilterLandTypesBy,
  FilterLandRarityBy,
}
