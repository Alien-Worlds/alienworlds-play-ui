import { IAsset } from 'atomicassets/build/API/Explorer/Objects'
import { map } from 'lodash'

export const updateLandRating = (assets: IAsset[], landDetails: IAsset) => {
  const landRating = landDetails?.mutable_data?.landrating

  if (!landRating) return assets

  return map(assets, (asset) => {
    if (asset.asset_id === landDetails.asset_id) {
      return {
        ...asset,
        mutable_data: { ...asset.mutable_data, landrating: landRating },
      }
    }
    return asset
  })
}
