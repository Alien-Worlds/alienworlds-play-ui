import { IAsset } from 'atomicassets/build/API/Explorer/Objects'
import { LoreSortBy } from 'features/lore/types/loreTypes'
import { LoreProposal } from 'graphql/types'
import {
  DEFAULT_COMMISSION_RANGE,
  DEFAULT_EASE_RANGE,
  DEFAULT_LUCK_RANGE,
  DEFAULT_POW_RANGE,
  DEFAULT_RECHARGE_RANGE,
} from 'store/atomic/helpers'
import { filterLandRarities, LandAssetsFilter } from 'store/atomic/types'
import { v4 } from 'uuid'

interface FilterAndSortParams {
  lores: LoreProposal[]
  sortBy: LoreSortBy
  reversed: boolean
}
export function removeLastDecimalDigit(num: number) {
  const str = num.toString()
  if (str.includes('.')) {
    const [intPart, decPart] = str.split('.')
    const newDec = decPart.slice(0, -1)
    return newDec ? `${intPart}.${newDec}` : intPart
  }
  return str // no decimal part, return as string
}

export const filterAssets = (assets: IAsset[], filter: LandAssetsFilter) => {
  let filteredAssets = assets.filter((x) => {
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

    // Commission
    if (filter.commission !== DEFAULT_COMMISSION_RANGE) {
      const commission = x.mutable_data.commission / 100

      const isOk = Array.isArray(filter.commission)
        ? commission >= filter.commission[0] && commission <= filter.commission[1]
        : commission === filter.commission

      if (!isOk) return false
    }

    // Recharge
    if (filter.recharge !== DEFAULT_RECHARGE_RANGE) {
      const delay = x.data.delay / 10

      const isOk = Array.isArray(filter.recharge)
        ? delay >= filter.recharge[0] && delay <= filter.recharge[1]
        : delay === filter.recharge

      if (!isOk) return false
    }

    // Mining power
    if (filter.miningPower !== DEFAULT_EASE_RANGE) {
      const ease = x.data.ease / 10

      const isOk = Array.isArray(filter.miningPower)
        ? ease >= filter.miningPower[0] && ease <= filter.miningPower[1]
        : ease === filter.miningPower

      if (!isOk) return false
    }

    // Pow
    if (filter.pow !== DEFAULT_POW_RANGE) {
      const pow = x.data.difficulty

      const isOk = Array.isArray(filter.pow)
        ? pow >= filter.pow[0] && pow <= filter.pow[1]
        : pow === filter.pow

      if (!isOk) return false
    }

    // Nft Power
    if (filter.luck !== DEFAULT_LUCK_RANGE) {
      const luck = x.data.luck / 10

      const isOk = Array.isArray(filter.luck)
        ? luck >= filter.luck[0] && luck <= filter.luck[1]
        : luck === filter.luck

      if (!isOk) return false
    }

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

export const sortLores = ({ lores, sortBy, reversed }: FilterAndSortParams): LoreProposal[] => {
  const sortedLores = [...lores].sort((a, b) => {
    let aValue: any = ''
    let bValue: any = ''
    let result: number

    switch (sortBy) {
      case LoreSortBy.ID:
        aValue = a.proposal_id
        bValue = b.proposal_id
        result = bValue - aValue // Numeric comparison
        break
      case LoreSortBy.TITLE:
        aValue = a.title.toLowerCase()
        bValue = b.title.toLowerCase()
        result = aValue.localeCompare(bValue)
        break
      case LoreSortBy.CREATEDBY:
        aValue = a.proposer
        bValue = b.proposer
        result = aValue.localeCompare(bValue)
        break
      case LoreSortBy.SUBMITTED:
        aValue = a.submitted
        bValue = b.submitted
        aValue = !aValue ? new Date('12-31-1970').toISOString() : aValue
        bValue = !bValue ? new Date('12-31-1970').toISOString() : bValue
        result = aValue.localeCompare(bValue)
        break
      case LoreSortBy.VOTES:
        aValue = (a.total_yes_votes + a.total_no_votes).toString()
        bValue = (b.total_yes_votes + b.total_no_votes).toString()
        result = aValue.localeCompare(bValue)
        break
      case LoreSortBy.EXPIREDATE:
        aValue = a.expires
        bValue = b.expires
        aValue = !aValue ? new Date('12-31-1970').toISOString() : aValue
        bValue = !bValue ? new Date('12-31-1970').toISOString() : bValue
        result = aValue.localeCompare(bValue)
        break
      case LoreSortBy.STATUS:
        aValue = a.status
        bValue = b.status
        result = aValue.localeCompare(bValue)
        break
      default:
        result = 0
        break
    }

    return result
  })

  // Reverse if necessary
  if (reversed) {
    return sortedLores.reverse()
  }

  return sortedLores
}
