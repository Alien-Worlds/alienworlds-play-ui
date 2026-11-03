import { useSessionStore } from 'shared/store/sessionStore'
import { Constants } from 'shared/util/constants'
import { transact } from 'shared/wax/transact'

/**
 * Outpost's shard redemptions: AW NFT offers, community (premint) offers and level rewards.
 * Ported from Overmind's `wax.api` (`redeemAWNftOffer`, `redeemCommunityNftOffer`,
 * `redeemLevelOffer`). They throw on failure, so React Query's `onError` runs.
 */

const auth = (walletId: string) => [{ actor: walletId, permission: 'active' }]

// Minting an AW NFT needs RAM bought for mint.worlds first.
const buyMintRam = (walletId: string) => ({
  account: Constants.CONTRACT_EOSIO,
  name: Constants.CONTRACT_EOSIO_BUY_RAM_BYTES,
  authorization: auth(walletId),
  data: { payer: walletId, receiver: 'mint.worlds', bytes: 152 },
})

export const buildRedeemAWNftOfferActions = (walletId: string, offerId: number) => [
  buyMintRam(walletId),
  {
    account: Constants.CONTRACT_USER_POINTS,
    name: Constants.CONTRACT_USER_POINTS_ACTION_REDEEMPNTNFT,
    authorization: auth(walletId),
    data: { user: walletId, offer_id: offerId },
  },
]

export const buildRedeemCommunityNftOfferActions = (walletId: string, offerId: number) => [
  {
    account: Constants.CONTRACT_USER_POINTS,
    name: Constants.CONTRACT_USER_POINTS_ACTION_REDEEMPRENFT,
    authorization: auth(walletId),
    data: { user: walletId, offer_id: offerId },
  },
]

export const buildRedeemLevelOfferActions = (walletId: string, levelOfferId: number) => [
  buyMintRam(walletId),
  {
    account: Constants.CONTRACT_USER_POINTS,
    name: Constants.CONTRACT_USER_POINTS_ACTION_REDEEMLVLNFT,
    authorization: auth(walletId),
    data: { user: walletId, id: levelOfferId },
  },
]

const signAsPlayer = (build: (walletId: string) => Parameters<typeof transact>[0]) => {
  const walletId = useSessionStore.getState().walletId
  if (!walletId) throw new Error('No wallet id')
  return transact(build(walletId))
}

export const redeemAWNftOffer = async (offerId: number) =>
  signAsPlayer((walletId) => buildRedeemAWNftOfferActions(walletId, offerId))

export const redeemCommunityNftOffer = async (offerId: number) =>
  signAsPlayer((walletId) => buildRedeemCommunityNftOfferActions(walletId, offerId))

export const redeemLevelOffer = async (levelOfferId: number) =>
  signAsPlayer((walletId) => buildRedeemLevelOfferActions(walletId, levelOfferId))
