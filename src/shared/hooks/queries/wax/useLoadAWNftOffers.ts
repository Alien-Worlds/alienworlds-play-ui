import { useQuery } from '@tanstack/react-query'
import { useEffects } from 'store'

const LOAD_AW_NFT_OFFERS_UPDATE_INTERVAL = 1000 * 60 // 60 seconds
export const LOAD_AW_NFT_OFFERS_QUERY_KEY = 'aw-nft-offers'

export const useLoadAWNftOffers = () => {
  const effects = useEffects()

  return useQuery({
    queryKey: [LOAD_AW_NFT_OFFERS_QUERY_KEY],
    refetchInterval: LOAD_AW_NFT_OFFERS_UPDATE_INTERVAL,
    queryFn: () => effects.wax.api.getPointsOffers(),
  })
}
