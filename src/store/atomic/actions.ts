import mappings from 'assets/data/cardDescMappings.json'
import { IAsset } from 'atomicassets/build/API/Explorer/Objects'
import { LandBoost, LandBoostsDay } from 'features/mining/types/LandownerTypes'
import { MainBoostLevels } from 'features/mining/utils/constants'
import { cloneDeep, find, forEach, map, toUpper } from 'lodash'
import { DateTime } from 'luxon'
import { catchError, debounce, pipe, waitUntil } from 'overmind'
import { matchRoutes } from 'react-router'
import { router } from 'routes'
import { today25hDay } from 'shared/util/helpers'
import { levelTemplateIdsAsOre } from 'shared/util/nft'
import {
  bindAssetsFilterView,
  DEFAULT_COMMISSION_RANGE,
  DEFAULT_EASE_RANGE,
  DEFAULT_LUCK_RANGE,
  DEFAULT_POW_RANGE,
  DEFAULT_RECHARGE_RANGE,
  getDefaultLandAssetsFilter,
} from 'store/atomic/helpers'
import {
  AssetSchema,
  AssetsFilter,
  filterLandRarities,
  LandAssetsFilter,
  SortBy,
  AssetType,
  FilterByToolType,
} from 'store/atomic/types'
import { executeAfter, shouldExecute } from 'store/main/helpers'
import { PagePath, Rarity } from 'store/main/types'
import { v4 } from 'uuid'

import { Context } from '..'
import { Constants } from '../../shared/util/constants'

export const onInitializeOvermind = async ({ state, effects }: Context) => {
  effects.atomic.api.initialize({
    getWalletId() {
      return state.wax.walletId
    },
  })
}

export const initializeOrReloadAssets = pipe(
  async ({ state, actions, effects }: Context) => {
    if (!state.wax.isLoggedIn) {
      state.atomic.assets = null
    }

    if (
      !shouldExecute(state.main.syncAi.assets, state.main.isFocusedWindow && state.wax.isLoggedIn)
    ) {
      return
    }

    state.main.syncAi.assets.isInProgress = true
    state.main.loreReadMe = await effects.main.getLoreReadMe()
    state.main.lorePullRequests = await effects.main.getLorePullRequests()
    let page = Constants.WAX_DEFAULT_PAGE_NUMBER
    let allAssets: IAsset[] = []

    while (page > 0) {
      const assets = await effects.atomic.api.getAssets(page)
      if (assets) {
        allAssets = allAssets.concat(assets)
        const ownedLandsAssets = []
        const ownedLandBoostsAssets = []

        // Map NFT images and descriptions
        forEach(allAssets, (asset) => {
          // Set AlienAvatars as avatar assets
          if (asset.schema.schema_name === Constants.CONTRACT_ALIEN_AVATARS) {
            asset.schema.schema_name = AssetSchema.FACES
          }

          // Add description for items.worlds assets
          if (asset.schema.schema_name === AssetType.ITEMS) {
            asset.data.description = find(
              mappings,
              (m) => m.Cardid === asset.data.cardid
            )?.description

            // set Land Boosts available
            const isLandBoostAsset = find(MainBoostLevels, (x) => x.name === asset.name)
            if (isLandBoostAsset) {
              ownedLandBoostsAssets.push(asset)
            }
          }

          // Set all owned Lands
          if (asset.schema.schema_name === AssetType.LAND) {
            ownedLandsAssets.push(asset)
          }

          // Add description for faces.worlds assets
          if (asset.schema.schema_name === AssetType.FACES) {
            // Set description for Female Cyborg NFT
            if (asset.data.cardid === 2) {
              asset.data.description = find(mappings, (m) => m.Cardid === 2)?.description
            }
          }
        })
        state.atomic.ownedLandsAssets = [...ownedLandsAssets]
        state.atomic.ownedLandBoostsAssets = [...ownedLandBoostsAssets]

        page = assets.length < 1000 ? 0 : page + 1
      } else {
        page = 0
      }
    }

    if (
      !state.atomic.assets ||
      allAssets.some((v, i) => v.asset_id !== state.atomic.assets[i]?.asset_id)
    ) {
      if (state.atomic.assets) {
        state.atomic.triggerFilterAndSortAssets = true
      }

      state.atomic.assets = allAssets
    } else {
      state.atomic.assets = null
      state.atomic.triggerFilterAndSortAssets = false
    }

    if (state.atomic.ownedLandsAssets?.length > 0) {
      const boosts: LandBoostsDay[] = []
      const ownedLands: IAsset[] = [...state.atomic.ownedLandsAssets]

      // fetch all daily boosts applied to all owned Lands
      await Promise.all(
        map(ownedLands, async (asset) => {
          const dayBoosts: LandBoost[] = await actions.wax.getLandBoostsByDay({
            landId: asset.asset_id,
            isManagingLand: false,
            day: today25hDay(),
          })

          boosts.push({
            landId: asset.asset_id,
            boosts: dayBoosts,
          })

          if (boosts?.length === state.atomic.ownedLandsAssets?.length) {
            state.atomic.ownedLandsAssetsDayBoosts = boosts
          }
        })
      )
    }

    if (!state.atomic.assets || state.atomic.assets?.length === 0) {
      executeAfter(state.main.syncAi.assets, DateTime.now().plus({ seconds: 3 }))
    } else {
      executeAfter(state.main.syncAi.assets, DateTime.now().plus({ minutes: 2 }))
    }
  },
  catchError(({ state }: Context, error) => {
    console.error(error)
    state.main.syncAi.assets.isInProgress = false
  })
)

export const initializeOrReloadTagAndAvatar = pipe(
  waitUntil((state: any) => state.atomic.assets?.length > 0),
  async ({ state, effects }: Context) => {
    if (!state.wax.isLoggedIn) {
      state.wax.player = null
      state.atomic.avatarAsset = null
    }

    if (
      !shouldExecute(state.main.syncAi.avatar, state.main.isFocusedWindow && state.wax.isLoggedIn)
    ) {
      return
    }
    state.main.syncAi.avatar.isInProgress = true

    state.wax.player = await effects.wax.api.getPlayer(state.wax.walletId)

    if (!state.wax.player) {
      state.atomic.avatarAsset = null
      executeAfter(state.main.syncAi.avatar, DateTime.now().plus({ seconds: 1 }))
    } else {
      const currentAvatar = await effects.atomic.api.getAssetById(state.wax.player.avatar)
      if (find(state.atomic.assets, (ob) => ob.asset_id === currentAvatar.asset_id)) {
        if (state.wax.isDemoUser && state.atomic.avatarAsset === null) {
          state.atomic.avatarAsset = currentAvatar
          executeAfter(state.main.syncAi.avatar, DateTime.now().plus({ minutes: 2 }))
        } else {
          state.atomic.avatarAsset = currentAvatar
          executeAfter(state.main.syncAi.avatar, DateTime.now().plus({ minutes: 2 }))
        }
      } else {
        if (state.wax.isDemoUser && state.atomic.avatarAsset === null) {
          executeAfter(state.main.syncAi.avatar, DateTime.now().plus({ seconds: 10 }))
        } else {
          state.atomic.avatarAsset = null
          executeAfter(state.main.syncAi.avatar, DateTime.now().plus({ seconds: 10 }))
        }
      }
    }
  },
  catchError(({ state }: Context, error) => {
    console.error(error)
    state.main.syncAi.avatar.isInProgress = false
  })
)

export const validateAccount = pipe(
  async ({ state, effects }: Context) => {
    if (
      !shouldExecute(
        state.main.syncAi.accountStatus,
        state.wax.isLoggedIn && !state.wax.isValidated
      )
    ) {
      return
    }
    // Check if account has been validated (5WAXP transfer)
    const isAccountValidated: boolean = await effects.wax.api.isAccountValidated()

    // If account is not validated yet, keep trying every 5secs to update the account status
    if (!isAccountValidated) {
      executeAfter(state.main.syncAi.accountStatus, DateTime.now().plus({ seconds: 5 }))
    } else {
      state.wax.isValidated = true
    }
  },
  catchError(({ state }: Context, error) => {
    console.error(error)
    state.main.syncAi.accountStatus.isInProgress = false
  })
)

export const initializeOrReloadBag = pipe(
  async ({ state, effects }: Context) => {
    if (!state.wax.isLoggedIn) {
      state.wax.bag = null
      state.atomic.bagAssets = null
    }

    if (!shouldExecute(state.main.syncAi.bag, state.main.isFocusedWindow && state.wax.isLoggedIn)) {
      return
    }
    state.main.syncAi.bag.isInProgress = true

    if (state.wax.isDemoUser) {
      // for demo user, fetch bag items only once at first load, afterwards skip loading new tools
      // so the ones switched remain available in the UI while in demo mode.
      if (!state.wax.bag || !state.wax.bag?.items || state.wax.bag?.items?.length === 0) {
        state.wax.bag = await effects.wax.api.getBag()
      }
    } else {
      state.wax.bag = await effects.wax.api.getBag()
    }

    if (!state.wax.bag) {
      state.atomic.bagAssets = null
      return
    }

    const bagAssets = await Promise.all(
      state.wax.bag.items.map((item) => {
        return effects.atomic.api.getAssetById(item)
      })
    )

    if (
      !state.atomic.bagAssets ||
      bagAssets.some((v, i) => v.asset_id !== state.atomic.bagAssets[i]?.asset_id)
    ) {
      if (state.atomic.bagAssets) {
        state.atomic.triggerFilterAndSortAssets = true
      }

      state.atomic.bagAssets = bagAssets
    }

    executeAfter(state.main.syncAi.bag, DateTime.now().plus({ minutes: 1 }))
  },
  catchError(({ state }: Context, error) => {
    console.error(error)
    state.main.syncAi.bag.isInProgress = false
  })
)

export const initializeOrReloadMiningLand = pipe(
  async ({ state, actions, effects }: Context) => {
    if (!state.wax.isLoggedIn) {
      state.wax.miner = null
      state.atomic.landAsset = null
    }

    if (!shouldExecute(state.main.syncAi.land, state.wax.isLoggedIn)) {
      return
    }
    state.main.syncAi.land.isInProgress = true

    state.wax.miner = await effects.wax.api.getMiner()

    if (!state.wax.miner) {
      state.atomic.landAsset = null
    } else {
      if (!state.wax.isDemoUser)
        state.atomic.landAsset = await effects.atomic.api.getAssetById(state.wax.miner.current_land)
      else if (state.wax.isDemoUser && state.atomic.landAsset === null) {
        state.atomic.landAsset = await effects.atomic.api.getAssetById(state.wax.miner.current_land)
      }
    }
    if (!state.wax.isDemoUser) actions.wax.setPlanetSelectedForMining()
    else if (state.wax.isDemoUser && state.atomic.landAsset === null) {
      actions.wax.setPlanetSelectedForMining()
    }

    if (state.wax.isDemoUser)
      executeAfter(state.main.syncAi.land, DateTime.now().plus({ minutes: 5 }))
    else executeAfter(state.main.syncAi.land, DateTime.now().plus({ minutes: 1 }))
  },
  catchError(({ state }: Context, error) => {
    console.error(error)
    state.main.syncAi.land.isInProgress = false
  })
)

export const filterAndSortAssets = pipe(
  ({ state }: Context) => {
    const isAssetsRelatedPage = matchRoutes(
      [
        { path: PagePath.Inventory },
        { path: PagePath.Shining },
        { path: PagePath.Tools },
        { path: PagePath.LandMgtSubpage },
      ],
      router.state.location.pathname
    )

    if (!state.wax.isLoggedIn) {
      state.atomic.filteredAndSortedAssets = null
    }

    if (!state.atomic.triggerFilterAndSortAssets || !isAssetsRelatedPage || !state.wax.isLoggedIn) {
      return null
    }

    const { assets, assetsFilter } = state.atomic

    if (!assets || !assetsFilter) {
      state.atomic.filteredAndSortedAssets = null
      return null
    }

    state.atomic.triggerFilterAndSortAssets = false

    let filteredAndSortedAssets: IAsset[] = assets.filter(
      (x) =>
        assetsFilter.assetSchema === null ||
        assetsFilter.assetSchema === x.schema.schema_name ||
        // additional case to add and show specific LEVEL type nfts as ORE type
        (assetsFilter.assetSchema === AssetSchema.ORE &&
          x.schema.schema_name === AssetSchema.LEVEL &&
          levelTemplateIdsAsOre.find((id) => id === x.template.template_id))
    )

    // Exclude bag items for Mining/Tools page
    const excludedAssets = []
    if (router.state.location.pathname === PagePath.Tools && state.atomic.bagAssets) {
      const bagAssetsIds = state.atomic.bagAssets.map((x) => x.asset_id)

      filteredAndSortedAssets = filteredAndSortedAssets.filter((x) => {
        let result
        if (!bagAssetsIds.includes(x.asset_id)) {
          result = true
        } else {
          x.total_of_type = 1
          excludedAssets.push(x)
          result = false
        }
        return result
      })
    }

    if (assetsFilter.groupByTemplate) {
      const groupedAssets: IAsset[] = []

      filteredAndSortedAssets.reduce((result, asset) => {
        const index = result.findIndex((x) => x.template.template_id === asset.template.template_id)

        if (index < 0 || asset.schema.schema_name === AssetSchema.LAND) {
          const groupedAsset: IAsset = cloneDeep(asset)
          groupedAsset.total_of_type = 1
          result.push(groupedAsset)
        } else {
          result[index].total_of_type += 1
        }

        return result
      }, groupedAssets)

      filteredAndSortedAssets = groupedAssets
    }

    if (router.state.location.pathname === PagePath.Tools && state.atomic.bagAssets) {
      filteredAndSortedAssets = filteredAndSortedAssets.concat(excludedAssets)
    }

    filteredAndSortedAssets = filteredAndSortedAssets.sort((a, b) => {
      let aValue: string = null
      let bValue: string = null

      switch (assetsFilter.sortBy) {
        case SortBy.NAME:
          aValue = a.data?.name
          bValue = b.data?.name
          break
        case SortBy.RARITY:
          aValue = Rarity[toUpper(a.data?.rarity) ?? 0]?.toString()
          bValue = Rarity[toUpper(b.data?.rarity) ?? 0]?.toString()
          break
        case SortBy.SHINE:
          aValue = a.data?.shine ? a.data?.shine.toString() : assetsFilter.reversed ? '000' : '100'
          bValue = b.data?.shine ? b.data?.shine.toString() : assetsFilter.reversed ? '000' : '100'
          break
        case SortBy.AFFINITY:
          aValue = a.data?.affinity ?? ''
          bValue = b.data?.affinity ?? ''
          break
        case SortBy.ARTIFACT_TYPE:
          aValue = a.data?.artifact_type ?? ''
          bValue = b.data?.artifact_type ?? ''
          break
        // delay can go up to 4 digits, so localeCompare does not produce
        // correct results when values are parsed to string (i.e '10' vs '100', etc)
        case SortBy.DELAY:
          aValue = a.data?.delay ? (a.data?.delay > b.data?.delay ? '1' : '0') : '0'
          bValue = a.data?.delay ? (a.data?.delay < b.data?.delay ? '1' : '0') : '1'
          break
        case SortBy.EASE:
          aValue = a.data?.ease
            ? a.data?.ease.toString().padStart(3, '0')
            : assetsFilter.reversed
            ? '000'
            : '100'
          bValue = b.data?.ease
            ? b.data?.ease.toString().padStart(3, '0')
            : assetsFilter.reversed
            ? '000'
            : '100'
          break
        case SortBy.LUCK:
          aValue = a.data?.luck
            ? a.data?.luck.toString().padStart(3, '0')
            : assetsFilter.reversed
            ? '000'
            : '100'
          bValue = b.data?.luck
            ? b.data?.luck.toString().padStart(3, '0')
            : assetsFilter.reversed
            ? '000'
            : '100'
          break
        case SortBy.ATTACK:
          aValue = a.data?.attack
            ? a.data?.attack.toString().padStart(3, '0')
            : assetsFilter.reversed
            ? '000'
            : '100'
          bValue = b.data?.attack
            ? b.data?.attack.toString().padStart(3, '0')
            : assetsFilter.reversed
            ? '000'
            : '100'
          break
        case SortBy.DEFENSE:
          aValue = a.data?.defense
            ? a.data?.defense.toString().padStart(3, '0')
            : assetsFilter.reversed
            ? '000'
            : '100'
          bValue = b.data?.defense
            ? b.data?.defense.toString().padStart(3, '0')
            : assetsFilter.reversed
            ? '000'
            : '100'
          break
        case SortBy.MOVE_COST:
          aValue = a.data?.movecost
            ? a.data?.movecost.toString().padStart(3, '0')
            : assetsFilter.reversed
            ? '000'
            : '100'
          bValue = b.data?.movecost
            ? b.data?.movecost.toString().padStart(3, '0')
            : assetsFilter.reversed
            ? '000'
            : '100'
          break
        case SortBy.KEY:
          aValue = (toUpper(a.data?.key) ?? 0).toString()
          bValue = (toUpper(b.data?.key) ?? 0).toString()
          break
        case SortBy.ELEMENT:
          aValue = a.data?.element
            ? a.data?.element.toString()
            : assetsFilter.reversed
            ? '000'
            : '100'
          bValue = b.data?.element
            ? b.data?.element.toString()
            : assetsFilter.reversed
            ? '000'
            : '100'
          break
        case SortBy.PROCESS:
          aValue = a.data?.process
            ? a.data?.process.toString()
            : assetsFilter.reversed
            ? '000'
            : '100'
          bValue = b.data?.process
            ? b.data?.process.toString()
            : assetsFilter.reversed
            ? '000'
            : '100'
          break
        default:
          aValue = ''
          bValue = ''
      }

      return aValue.localeCompare(bValue)
    })

    if (assetsFilter.reversed) {
      filteredAndSortedAssets = filteredAndSortedAssets.reverse()
    }

    return [...filteredAndSortedAssets]
  },
  debounce(300),
  ({ state }: Context, assets: IAsset[]) => {
    if (assets) {
      state.atomic.filteredAndSortedAssets = assets
    }
  }
)

export const setAssetsFilter = pipe(
  ({ state }: Context, assetsFilter: AssetsFilter) => {
    // TODO: Discuss animation here. Also fix error in DetailsOnHover first.
    state.atomic.filteredAndSortedAssets = null
    bindAssetsFilterView(assetsFilter, router.state.location.pathname)
    state.atomic.assetsFilter = assetsFilter
    state.atomic.triggerFilterAndSortAssets = true
  },
  catchError((_: Context, error) => {
    console.error(error)
  })
)

export const setFilterByToolType = pipe(
  ({ state }: Context, assetsFilter: FilterByToolType) => {
    state.atomic.filterByToolType = assetsFilter
  },
  catchError((_: Context, error) => {
    console.error(error)
  })
)

export const filterLandAssets = ({ state }: Context) => {
  const planetTitle = state.wax.whereToMine
  let filteredLands = state.wax.planetLandsAssets[planetTitle]
  if (!filteredLands) {
    state.atomic.landAssetsFilter.filteredLands = []
    return
  }

  const filter = state.atomic.landAssetsFilter

  filteredLands = filteredLands.filter((x) => {
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

  filteredLands = filteredLands.sort((a, b) => {
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
        aValue = filterLandRarities.indexOf(a.data.rarity)
        bValue = filterLandRarities.indexOf(b.data.rarity)
        break
      case 'Recharge Multiplier':
        aValue = a.data.delay
        bValue = a.data.delay
        break
      case 'Terrain':
        aValue = a.data.name.split(' on ')[0].toString()
        bValue = b.data.name.split(' on ')[0].toString()
        break
      default:
        aValue = null
        bValue = null
    }

    if (aValue === bValue || typeof aValue !== typeof bValue) return 0

    return aValue < bValue ? -1 : 1
  })

  if (filter.reversed) {
    filteredLands = filteredLands.reverse()
  }

  state.atomic.landAssetsFilter.filteredLands = [...filteredLands]
}

export const setLandAssetsFilter = pipe(
  ({ state }: Context, landAssetsFilter: LandAssetsFilter) => {
    state.atomic.landAssetsFilter = landAssetsFilter
  },
  ({ state }: Context) => {
    state.atomic.landAssetsFilter = {
      ...state.atomic.landAssetsFilter,
      isLoading: true,
    }
  },
  debounce(200),
  filterLandAssets,
  ({ state }: Context) => {
    state.atomic.landAssetsFilter = {
      ...state.atomic.landAssetsFilter,
      isLoading: false,
    }
  },
  catchError((_: Context, error) => {
    console.error(error)
  })
)

export const resetLandAssetsFilter = pipe(
  ({ state }: Context) => {
    state.atomic.landAssetsFilter = getDefaultLandAssetsFilter()
  },
  ({ state }: Context) => {
    state.atomic.landAssetsFilter = {
      ...state.atomic.landAssetsFilter,
      isLoading: true,
    }
  },
  debounce(200),
  filterLandAssets,
  ({ state }: Context) => {
    state.atomic.landAssetsFilter = {
      ...state.atomic.landAssetsFilter,
      isLoading: false,
    }
  },
  catchError((_: Context, error) => {
    console.error(error)
  })
)
