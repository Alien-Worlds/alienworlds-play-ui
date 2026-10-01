import { useQuery } from '@tanstack/react-query'
import { IAsset } from 'atomicassets/build/API/Explorer/Objects'
import { getAssetsByIds } from 'shared/util/atomicassets'

const QUERY_KEY = 'asset-ids'

export const usePlanetAssets = (assetIds: string[]) => {
  return useQuery({
    queryKey: [QUERY_KEY, assetIds], // include assetIds to properly cache
    queryFn: async () => {
      let landAssets: IAsset[] = []
      let ids = [...assetIds] // clone so original array isn't mutated

      while (ids.length) {
        const currentIds = ids.splice(0, 100)
        const assets = await getAssetsByIds(currentIds)
        landAssets = landAssets.concat(assets)
      }

      return landAssets
    },
    enabled: assetIds.length > 0, // only fetch if there are IDs
  })
}
