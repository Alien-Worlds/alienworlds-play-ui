import { useQuery } from '@tanstack/react-query'
import { useSessionStore } from 'shared/store/sessionStore'
import { getPointsOffers } from 'shared/wax/userPoints'

const LOAD_AW_NFT_OFFERS_UPDATE_INTERVAL = 1000 * 60 // 60 seconds
export const LOAD_AW_NFT_OFFERS_QUERY_KEY = 'aw-nft-offers'

export const useLoadAWNftOffers = () =>
  useQuery({
    queryKey: [LOAD_AW_NFT_OFFERS_QUERY_KEY],
    refetchInterval: LOAD_AW_NFT_OFFERS_UPDATE_INTERVAL,
    // Without a wallet there are no offers to show, as with Overmind's effect.
    queryFn: () => (useSessionStore.getState().walletId ? getPointsOffers() : null),
  })
