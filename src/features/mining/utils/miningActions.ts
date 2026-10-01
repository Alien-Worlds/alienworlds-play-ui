import { IAsset } from 'atomicassets/build/API/Explorer/Objects'
import { MainBoostLevels } from 'features/mining/utils/constants'
import { Constants } from 'shared/util/constants'
import { ShineData } from 'store/wax/types'

/**
 * Builders for mining's land-management and shining transactions. Ported from Overmind's
 * `wax.api` (`submitShine`, `setCommission`, `applyMainBoost`, `setMinBoost`, `boostSlot`,
 * `unlockSlot`). Amounts are TLM strings, e.g. "4.0000 TLM".
 */

const auth = (walletId: string) => [{ actor: walletId, permission: 'active' }]

/** Pays the shine cost and sends the NFTs being shined to s.federation. */
export const buildShineActions = (walletId: string, assetIds: string[], shineData: ShineData) => [
  {
    account: Constants.CONTRACT_ALIEN_WORLDS,
    name: Constants.CONTRACT_TABLE_TRANSFER,
    authorization: auth(walletId),
    data: {
      from: walletId,
      to: Constants.CONTRACT_S_FEDERATION,
      quantity: shineData.info.cost,
      memo: 'Shining',
    },
  },
  {
    account: Constants.CONTRACT_ATOMIC_ASSETS,
    name: Constants.CONTRACT_TABLE_TRANSFER,
    authorization: auth(walletId),
    data: {
      from: walletId,
      to: Constants.CONTRACT_S_FEDERATION,
      asset_ids: assetIds,
      memo: 'Shining',
    },
  },
]

/** `commission` is the on-chain integer (percent * 100) as a string. */
export const buildSetCommissionActions = (walletId: string, landId: string, commission: string) => [
  {
    account: Constants.CONTRACT_LAND_RATINGS,
    name: Constants.CONTRACT_FEDERATION_ACTION_SETPROFITSHR,
    authorization: auth(walletId),
    data: { owner: walletId, land_id: landId, profit_share: commission },
  },
]

/** Burns a MEGA or SUPER boost NFT on a land. */
export const buildApplyMainBoostActions = (walletId: string, landId: string, boost: IAsset) => [
  {
    account: Constants.CONTRACT_ATOMIC_ASSETS,
    name: Constants.CONTRACT_TABLE_TRANSFER,
    authorization: auth(walletId),
    data: {
      from: walletId,
      to: Constants.CONTRACT_LAND_RATINGS,
      asset_ids: [boost.asset_id],
      memo: `<${boost.name}> for land id ${landId}`,
    },
  },
  {
    account: Constants.CONTRACT_LAND_RATINGS,
    name:
      boost.name === MainBoostLevels[0].name
        ? Constants.CONTRACT_LAND_RATINGS_ACTION_MEGABOOST
        : Constants.CONTRACT_LAND_RATINGS_ACTION_SUPERBOOST,
    authorization: auth(walletId),
    data: { land_id: landId },
  },
]

export const buildSetMinBoostActions = (walletId: string, landId: string, minBoost: string) => [
  {
    account: Constants.CONTRACT_LAND_RATINGS,
    name: Constants.CONTRACT_LAND_RATINGS_ACTION_SETMINBOOST,
    authorization: auth(walletId),
    data: { owner: walletId, land_id: landId, minboost: minBoost },
  },
]

/** Pays for a boost in the land's next open slot. */
export const buildBoostSlotActions = (walletId: string, landId: string, cost: string) => [
  {
    account: Constants.CONTRACT_ALIEN_WORLDS,
    name: Constants.CONTRACT_TABLE_TRANSFER,
    authorization: auth(walletId),
    data: {
      from: walletId,
      to: Constants.CONTRACT_BOOST_WORLDS,
      quantity: cost,
      memo: `landrating - boostslot for ${landId}`,
    },
  },
  {
    account: Constants.CONTRACT_LAND_RATINGS,
    name: Constants.CONTRACT_LAND_RATINGS_ACTION_BOOST,
    authorization: auth(walletId),
    data: { payer: walletId, land_id: landId, amount: cost },
  },
]

/** Pays to open the land's next locked slot. */
export const buildUnlockSlotActions = (walletId: string, landId: string, cost: string) => [
  {
    account: Constants.CONTRACT_ALIEN_WORLDS,
    name: Constants.CONTRACT_TABLE_TRANSFER,
    authorization: auth(walletId),
    data: {
      from: walletId,
      to: Constants.CONTRACT_BOOST_WORLDS,
      quantity: cost,
      memo: `landrating - openslot for ${landId}`,
    },
  },
  {
    account: Constants.CONTRACT_LAND_RATINGS,
    name: Constants.CONTRACT_LAND_RATINGS_ACTION_OPENSLOT,
    authorization: auth(walletId),
    data: { owner: walletId, land_id: landId },
  },
]
