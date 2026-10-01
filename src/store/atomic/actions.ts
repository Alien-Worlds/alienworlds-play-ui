import mappings from 'assets/data/cardDescMappings.json'
import { IAsset } from 'atomicassets/build/API/Explorer/Objects'
import { useInventoryStore } from 'features/inventory/store/inventoryStore'
import { useMiningStore } from 'features/mining/store/miningStore'
import { LandBoost, LandBoostsDay } from 'features/mining/types/LandownerTypes'
import { MainBoostLevels } from 'features/mining/utils/constants'
import { find, forEach, map } from 'lodash'
import { DateTime } from 'luxon'
import { catchError, pipe } from 'overmind'
import { useAssetsStore } from 'shared/store/assetsStore'
import { today25hDay } from 'shared/util/helpers'
import { AssetSchema, AssetType } from 'store/atomic/types'
import { executeAfter, shouldExecute } from 'store/main/helpers'

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
    const assetsStore = useAssetsStore.getState()

    if (!state.wax.isLoggedIn) {
      assetsStore.setAssets(null)
    }

    if (
      !shouldExecute(state.main.syncAi.assets, state.main.isFocusedWindow && state.wax.isLoggedIn)
    ) {
      return
    }

    state.main.syncAi.assets.isInProgress = true
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
        assetsStore.setOwnedLandsAssets([...ownedLandsAssets])
        useMiningStore.getState().setOwnedLandBoostsAssets([...ownedLandBoostsAssets])

        page = assets.length < 1000 ? 0 : page + 1
      } else {
        page = 0
      }
    }

    const currentAssets = useAssetsStore.getState().assets
    if (!currentAssets || allAssets.some((v, i) => v.asset_id !== currentAssets[i]?.asset_id)) {
      if (currentAssets) {
        assetsStore.setTriggerFilterAndSortAssets(true)
      }

      assetsStore.setAssets(allAssets)
    } else {
      // Unchanged since the last poll. Clearing here makes the next poll (3s later) reload them.
      assetsStore.setAssets(null)
      assetsStore.setTriggerFilterAndSortAssets(false)
    }

    const { ownedLandsAssets: ownedLandsAtStart } = useAssetsStore.getState()
    if (ownedLandsAtStart?.length > 0) {
      const boosts: LandBoostsDay[] = []
      const ownedLands: IAsset[] = [...ownedLandsAtStart]

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

          if (boosts?.length === useAssetsStore.getState().ownedLandsAssets?.length) {
            useInventoryStore.getState().setOwnedLandsAssetsDayBoosts(boosts)
          }
        })
      )
    }

    if (!useAssetsStore.getState().assets?.length) {
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

// Resolves once the player's assets are loaded. Stands in for Overmind's waitUntil, which can
// only watch Overmind state: like it, this holds the rest of updateWorld until assets exist.
const assetsLoaded = () =>
  new Promise<void>((resolve) => {
    if (useAssetsStore.getState().assets?.length) {
      resolve()
      return
    }
    const unsubscribe = useAssetsStore.subscribe((state) => {
      if (state.assets?.length) {
        unsubscribe()
        resolve()
      }
    })
  })

export const initializeOrReloadTagAndAvatar = pipe(
  async ({ state, effects }: Context) => {
    await assetsLoaded()

    const assetsStore = useAssetsStore.getState()

    if (!state.wax.isLoggedIn) {
      state.wax.player = null
      assetsStore.setAvatarAsset(null)
    }

    if (
      !shouldExecute(state.main.syncAi.avatar, state.main.isFocusedWindow && state.wax.isLoggedIn)
    ) {
      return
    }
    state.main.syncAi.avatar.isInProgress = true

    state.wax.player = await effects.wax.api.getPlayer(state.wax.walletId)

    if (!state.wax.player) {
      assetsStore.setAvatarAsset(null)
      executeAfter(state.main.syncAi.avatar, DateTime.now().plus({ seconds: 1 }))
    } else {
      const currentAvatar = await effects.atomic.api.getAssetById(state.wax.player.avatar)
      const { assets, avatarAsset } = useAssetsStore.getState()
      if (find(assets, (ob) => ob.asset_id === currentAvatar.asset_id)) {
        assetsStore.setAvatarAsset(currentAvatar)
        executeAfter(state.main.syncAi.avatar, DateTime.now().plus({ minutes: 2 }))
      } else {
        if (state.wax.isDemoUser && avatarAsset === null) {
          executeAfter(state.main.syncAi.avatar, DateTime.now().plus({ seconds: 10 }))
        } else {
          assetsStore.setAvatarAsset(null)
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
    const assetsStore = useAssetsStore.getState()

    if (!state.wax.isLoggedIn) {
      state.wax.bag = null
      assetsStore.setBagAssets(null)
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
      assetsStore.setBagAssets(null)
      return
    }

    const bagAssets = await Promise.all(
      state.wax.bag.items.map((item) => {
        return effects.atomic.api.getAssetById(item)
      })
    )

    const currentBag = useAssetsStore.getState().bagAssets
    if (!currentBag || bagAssets.some((v, i) => v.asset_id !== currentBag[i]?.asset_id)) {
      if (currentBag) {
        assetsStore.setTriggerFilterAndSortAssets(true)
      }

      assetsStore.setBagAssets(bagAssets)
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
    const assetsStore = useAssetsStore.getState()

    if (!state.wax.isLoggedIn) {
      state.wax.miner = null
      assetsStore.setLandAsset(null)
    }

    if (!shouldExecute(state.main.syncAi.land, state.wax.isLoggedIn)) {
      return
    }
    state.main.syncAi.land.isInProgress = true

    state.wax.miner = await effects.wax.api.getMiner()

    if (!state.wax.miner) {
      assetsStore.setLandAsset(null)
    } else if (!state.wax.isDemoUser || useAssetsStore.getState().landAsset === null) {
      // Demo users keep the first land they load, so switching land in demo mode sticks.
      assetsStore.setLandAsset(await effects.atomic.api.getAssetById(state.wax.miner.current_land))
    }
    if (!state.wax.isDemoUser) actions.wax.setPlanetSelectedForMining()
    else if (state.wax.isDemoUser && useAssetsStore.getState().landAsset === null) {
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

export const filterAndSortAssets = ({ state }: Context) => {
  useAssetsStore.getState().filterAndSortAssets({ isLoggedIn: state.wax.isLoggedIn })
}
