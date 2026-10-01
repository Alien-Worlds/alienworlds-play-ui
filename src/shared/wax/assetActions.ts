import { Constants } from 'shared/util/constants'

/**
 * Builders for the transactions that change the player's mining setup. Ported from Overmind's
 * `wax.api` (`setBag`, `setLand`, `setAvatar`).
 */

const auth = (walletId: string) => [{ actor: walletId, permission: 'active' }]

export const buildSetBagActions = (walletId: string, items: string[]) => [
  {
    account: Constants.CONTRACT_M_FEDERATION,
    name: Constants.CONTRACT_FEDERATION_ACTION_SETBAG,
    authorization: auth(walletId),
    data: { account: walletId, items },
  },
]

export const buildSetLandActions = (walletId: string, landId: string) => [
  {
    account: Constants.CONTRACT_M_FEDERATION,
    name: Constants.CONTRACT_FEDERATION_ACTION_SETLAND,
    authorization: auth(walletId),
    data: { account: walletId, land_id: landId },
  },
]

// Avatars 1 and 2 are the starter avatars, which need RAM bought for mint.worlds first.
const STARTER_AVATAR_IDS = [1, 2]

export const buildSetAvatarActions = (walletId: string, avatarId: string) => [
  ...(STARTER_AVATAR_IDS.includes(Number(avatarId))
    ? [
        {
          account: Constants.CONTRACT_EOSIO,
          name: Constants.CONTRACT_EOSIO_BUY_RAM_BYTES,
          authorization: auth(walletId),
          data: { payer: walletId, receiver: 'mint.worlds', bytes: 152 },
        },
      ]
    : []),
  {
    account: Constants.CONTRACT_FEDERATION,
    name: Constants.CONTRACT_FEDERATION_ACTION_SETAVATAR,
    authorization: auth(walletId),
    data: { account: walletId, avatar_id: avatarId },
  },
]
