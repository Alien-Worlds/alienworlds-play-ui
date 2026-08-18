import { IAsset } from 'atomicassets/build/API/Explorer/Objects'
import { NftRarity } from 'features/mining/utils/constants'
import { isNull, sumBy } from 'lodash'
import { DateTime } from 'luxon'
import { toBigNumber } from 'shared/util/numbers'
import { AssetSchema } from 'store/atomic/types'
import { SyncAI, SyncInfo } from 'store/main/state'

type MiningParams = {
  delay: number
  difficulty: number
  ease: number
}

export const showOnboardingNewsletter = () => {
  if (!isNull(localStorage.getItem('alienworlds-onboarding-newsletter'))) {
    return localStorage.getItem('alienworlds-onboarding-newsletter') === 'false'
  }
  return false
}

export const mapBagToMiningParams = (bag: IAsset[]) => {
  const miningParams: MiningParams = {
    delay: 0,
    difficulty: 0,
    ease: 0,
  }

  let minDelay = 65535

  for (let b = 0; b < bag.length; b += 1) {
    if (bag[b].data.delay < minDelay) {
      minDelay = bag[b].data.delay
    }
    miningParams.delay += bag[b].data.delay
    miningParams.difficulty += bag[b].data.difficulty
    miningParams.ease += bag[b].data.ease / 10
  }

  if (bag.length === 2) {
    miningParams.delay -= Math.floor(minDelay / 2)
  } else if (bag.length === 3) {
    miningParams.delay -= minDelay
  }

  return miningParams
}

export const mapLandToMiningParams = (land: IAsset) =>
  <MiningParams>{
    delay: land.data.delay,
    difficulty: land.data.difficulty,
    ease: land.data.ease,
  }

export const calculateMineDelay = (
  lastMineTx: string,
  lastMine: string,
  bagParams: MiningParams,
  landParams: MiningParams
) => {
  const INITIAL_MINE_TRANSACTION =
    '0000000000000000000000000000000000000000000000000000000000000000'

  // First mine - return random delay
  if (lastMineTx === INITIAL_MINE_TRANSACTION) {
    return 0
  }

  const delay = bagParams.delay * (landParams.delay / 10)
  const now = new Date().getTime()
  const lastMineInMs = Date.parse(`${lastMine}.000Z`)
  const mineDelay = lastMineInMs + delay * 1000 - now
  return mineDelay < 0 ? 0 : mineDelay
}

export const calculateChargeTime = (bag: IAsset[], land: IAsset) => {
  if (!bag || !land) return -1

  const bagParams = mapBagToMiningParams(bag)
  const landParams = mapLandToMiningParams(land)

  return Math.round(bagParams.delay * (landParams.delay / 10))
}

export const calculateMiningPower = (bag: IAsset[], land: IAsset) => {
  let power = toBigNumber(0)
  if (bag && land) {
    // Calculate the sum of bag data.ease / 10 for all items in the bag array
    const sumBagEase = sumBy(bag, (item) => toBigNumber(item.data.ease).dividedBy(10).toNumber())
    // Calculate the power by multiplying the sumBagEase value with land's data.ease / 10
    power = toBigNumber(land.data.ease).dividedBy(10).multipliedBy(sumBagEase)
  }

  return power.toFixed(2)
}

export const calculateNftLuck = (bag: IAsset[], land: IAsset) => {
  let luck = 0.0

  if (bag && land) {
    bag.forEach((x) => {
      if (x.data.rarity === NftRarity.abundant && x.schema.schema_name === AssetSchema.TOOL) {
        luck += 0
      } else {
        luck += x.data.luck / 10
      }
    })

    luck *= land.data.luck / 10
  }
  return luck.toFixed(2)
}

export const calculatePow = (bag: IAsset[], land: IAsset) => {
  let difficulty = ''

  if (bag && land) {
    difficulty =
      (bag.reduce((prev, item) => {
        return item?.data?.difficulty + prev
      }, 0) ?? 0) + (land?.data?.difficulty ?? 0)
  }

  return difficulty
}

export const shouldExecute = (syncInfo: SyncInfo, isFocused: boolean) =>
  isFocused && !syncInfo.isInProgress && syncInfo.executeAfter < DateTime.now()

export const executeAfter = (syncInfo: SyncInfo, dateTime: DateTime) => {
  syncInfo.isInProgress = false
  syncInfo.executeAfter = dateTime
}

export const getDefaultSyncAi = () =>
  <SyncAI>{
    bag: {
      isInProgress: false,
      executeAfter: DateTime.now(),
    },
    land: {
      isInProgress: false,
      executeAfter: DateTime.now(),
    },
    avatar: {
      isInProgress: false,
      executeAfter: DateTime.now(),
    },
    assets: {
      isInProgress: false,
      executeAfter: DateTime.now(),
    },
    planets: {
      isInProgress: false,
      executeAfter: DateTime.now(),
    },
    tlmBalance: {
      isInProgress: false,
      executeAfter: DateTime.now(),
    },
    resources: {
      isInProgress: false,
      executeAfter: DateTime.now(),
    },
    terms: {
      isInProgress: false,
      executeAfter: DateTime.now(),
    },
    refunds: {
      isInProgress: false,
      executeAfter: DateTime.now(),
    },
    recentMissions: {
      isInProgress: false,
      executeAfter: DateTime.now(),
    },
    explorer: {
      isInProgress: false,
      executeAfter: DateTime.now(),
    },
    missionNfts: {
      isInProgress: false,
      executeAfter: DateTime.now(),
    },
    bscBalance: {
      isInProgress: false,
      executeAfter: DateTime.now(),
    },
    selectedDacCandidatesCustodians: {
      isInProgress: false,
      executeAfter: DateTime.now(),
    },
    rewardsClaims: {
      isInProgress: false,
      executeAfter: DateTime.now(),
    },
    accountStatus: {
      isInProgress: false,
      executeAfter: DateTime.now(),
    },
  }
