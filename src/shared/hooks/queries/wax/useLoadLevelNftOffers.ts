import { useQuery } from '@tanstack/react-query'
import { useEffects } from 'store'

const LOAD_LEVEL_NFT_OFFERS_UPDATE_INTERVAL = 1000 * 60 * 5 // 5 minutes
export const LOAD_LEVEL_NFT_OFFERS_QUERY_KEY = 'level-nft-offers'

export const useLoadLevelNftOffers = () => {
  const effects = useEffects()

  return useQuery({
    queryKey: [LOAD_LEVEL_NFT_OFFERS_QUERY_KEY],
    refetchInterval: LOAD_LEVEL_NFT_OFFERS_UPDATE_INTERVAL,
    queryFn: () => effects.wax.api.getLevelOffers(),
  })
}
