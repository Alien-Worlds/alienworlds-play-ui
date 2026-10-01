import { ExplorerApi } from 'atomicassets'
import { IAsset, ITemplate } from 'atomicassets/build/API/Explorer/Objects'

import { config } from './config'
import { Constants } from './constants'

export const getAtomicAssetsApi = () => {
  const api = new ExplorerApi(config.AtomicAssetsApiUrl, 'atomicassets', {
    fetch,
  })

  return api
}

// Reads ported from Overmind's `atomic.api` effects, for code that has moved off Overmind.

/** Finds an Alien Worlds NFT by id, falling back to the AlienAvatars collection. */
export const getAssetById = async (id: string): Promise<IAsset | null> => {
  if (!id) return null
  const api = getAtomicAssetsApi()

  const [alienWorldsAsset] = await api.getAssets({
    asset_id: id,
    collection_name: Constants.CONTRACT_ALIEN_WORLDS,
  })
  if (alienWorldsAsset) return alienWorldsAsset

  const [avatarAsset] = await api.getAssets({
    asset_id: id,
    schema_name: Constants.CONTRACT_ALIEN_AVATARS,
    collection_name: Constants.CONTRACT_ALIEN_AVATARS,
  })
  return avatarAsset ?? null
}

/** Up to 100 Alien Worlds NFTs by id. */
export const getAssetsByIds = async (ids: string[]): Promise<IAsset[]> =>
  getAtomicAssetsApi().getAssets(
    { ids: ids.join(','), collection_name: Constants.CONTRACT_ALIEN_WORLDS },
    1,
    100
  )

export const getTemplateById = async (id: string): Promise<ITemplate | null> => {
  if (!id) return null
  return (await getAtomicAssetsApi().getTemplate(Constants.CONTRACT_ALIEN_WORLDS, id)) ?? null
}
