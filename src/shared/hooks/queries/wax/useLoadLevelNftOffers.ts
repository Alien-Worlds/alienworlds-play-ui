import { useQuery } from '@tanstack/react-query'
import { useSessionStore } from 'shared/store/sessionStore'
import { getLevelOffers } from 'shared/wax/userPoints'

const LOAD_LEVEL_NFT_OFFERS_UPDATE_INTERVAL = 1000 * 60 * 5 // 5 minutes
export const LOAD_LEVEL_NFT_OFFERS_QUERY_KEY = 'level-nft-offers'

export const useLoadLevelNftOffers = () =>
  useQuery({
    queryKey: [LOAD_LEVEL_NFT_OFFERS_QUERY_KEY],
    refetchInterval: LOAD_LEVEL_NFT_OFFERS_UPDATE_INTERVAL,
    // Without a wallet there are no offers to show, as with Overmind's effect.
    queryFn: () => (useSessionStore.getState().walletId ? getLevelOffers() : null),
  })
