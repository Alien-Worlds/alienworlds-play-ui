import { useQuery } from '@tanstack/react-query'
import { RarityPool } from 'features/mining/types/RarityPoolTypes'
import { RarityPoolColors } from 'features/mining/utils/constants'
import { find, keys, map } from 'lodash'
import { toBigNumber } from 'shared/util/numbers'
import { useEffects } from 'store'

const RARITY_POOL_UPDATE_INTERVAL = 1000 * 20 // 20 seconds
const RARITY_POOL_QUERY_KEY = 'rarity-pools'

export const useRarityPools = (planet: string) => {
  const effects = useEffects()

  return useQuery({
    queryKey: [RARITY_POOL_QUERY_KEY, planet],
    refetchInterval: RARITY_POOL_UPDATE_INTERVAL,
    enabled: !!planet,
    queryFn: async (): Promise<RarityPool[]> => {
      const result = await effects.wax.api.getRarityPools(planet)
      if (!result) return []

      // Sort by rarity level based on RarityPoolColors and format the data
      const formattedRarityPools: RarityPool[] = map(keys(RarityPoolColors), (rarity) => {
        const { key, value } = find(result.pool_buckets, (r) => r.key === rarity)
        const rate = find(result.rates, (r) => r.key === key)

        return {
          rarityName: key,
          amount: value,
          rawAmount: toBigNumber(value).toNumber(),
          percentage: toBigNumber(rate?.value ?? 0).toNumber(),
        }
      })

      return formattedRarityPools
    },
  })
}
