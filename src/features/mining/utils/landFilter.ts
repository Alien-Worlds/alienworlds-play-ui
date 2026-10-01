import { IAsset } from 'atomicassets/build/API/Explorer/Objects'
import { filterLandRarities, LandAssetsFilter } from 'store/atomic/types'
import { v4 } from 'uuid'

// A slider gives a [min, max] range (inclusive); a single value must match exactly.
const inRange = (value: number, range: number | number[]) =>
  Array.isArray(range) ? value >= range[0] && value <= range[1] : value === range

/**
 * Filters and sorts the lands of a planet for the Land page.
 *
 * Every range filter always applies, the defaults included. The ranges used to be skipped when
 * they were the DEFAULT_* constants, but under Overmind the filter came back as a proxy, so that
 * identity check never matched and the defaults filtered too. Checking always keeps that
 * behaviour now that the filter is a plain object.
 */
export const filterAndSortLands = (lands: IAsset[], filter: LandAssetsFilter) => {
  let filteredAssets = lands.filter((x) => {
    // Owner
    if (filter.owner?.length > 0) {
      if (!x.owner.includes(filter.owner)) return false
    }

    // Terrain
    if (filter.terrain !== 'ALL') {
      if (x.data.name.split(' on ')[0] !== filter.terrain) return false
    }

    // Rarity
    if (filter.rarity !== 'ALL') {
      if (x.data.rarity !== filter.rarity) return false
    }

    if (!inRange(x.mutable_data.commission / 100, filter.commission)) return false
    if (!inRange(x.data.delay / 10, filter.recharge)) return false
    if (!inRange(x.data.ease / 10, filter.miningPower)) return false
    if (!inRange(x.data.difficulty, filter.pow)) return false
    if (!inRange(x.data.luck / 10, filter.luck)) return false

    if (filter.x) {
      const isOk = x.immutable_data.x === filter.x

      if (!isOk) return false
    }

    if (filter.y) {
      const isOk = x.immutable_data.y === filter.y

      if (!isOk) return false
    }

    return true
  })

  // Apply sorting
  if (filter.sortBy) {
    filteredAssets = filteredAssets.sort((a, b) => {
      let aValue: string | number = null
      let bValue: string | number = null

      switch (filter.sortBy) {
        case 'Commission':
          aValue = a.mutable_data.commission
          bValue = b.mutable_data.commission
          break
        case 'Mining Power':
          aValue = a.data.ease
          bValue = b.data.ease
          break
        case 'NFT Power':
          aValue = a.data.luck
          bValue = b.data.luck
          break
        case 'Owner':
          aValue = a.owner
          bValue = b.owner
          break
        case 'POW':
          aValue = a.data.difficulty
          bValue = b.data.difficulty
          break
        case 'Random':
          aValue = v4()
          bValue = v4()
          break
        case 'Rarity':
          aValue = filterLandRarities.findIndex((r) => r.value === a.data.rarity)
          bValue = filterLandRarities.findIndex((r) => r.value === b.data.rarity)
          break
        case 'Recharge Multiplier':
          aValue = a.data.delay
          bValue = b.data.delay
          break
        case 'Terrain':
          aValue = a.data.name.split(' on ')[0].toString()
          bValue = b.data.name.split(' on ')[0].toString()
          break
        default:
          aValue = null
          bValue = null
      }

      if (aValue === null || bValue === null) return 0
      if (typeof aValue !== typeof bValue) return 0

      const comparison = aValue < bValue ? -1 : aValue > bValue ? 1 : 0
      return comparison
    })

    // Apply reverse if needed
    if (filter.reversed) {
      filteredAssets = filteredAssets.reverse()
    }
  }

  return filteredAssets
}
