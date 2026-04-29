import { ExplorerApi } from 'atomicassets'

import { config } from '../../shared/util/config'
import { Constants } from '../../shared/util/constants'

interface AtomicOptions {
  getWalletId: () => string
}

export const api = (() => {
  let options: AtomicOptions = null
  let client: ExplorerApi

  return {
    initialize(_options: AtomicOptions) {
      options = _options

      client = new ExplorerApi(config.AtomicAssetsApiUrl, 'atomicassets', {
        fetch,
      })
    },
    async getAssets(pageNumber: number) {
      if (!options.getWalletId()) return null

      const alienWorldsAssets = await client.getAssets(
        {
          owner: options.getWalletId(),
          collection_name: Constants.CONTRACT_ALIEN_WORLDS,
        },
        pageNumber,
        Constants.WAX_PAGE_LIMIT
      )
      const alienAvatarsAssets = await client.getAssets(
        {
          owner: options.getWalletId(),
          schema_name: Constants.CONTRACT_ALIEN_AVATARS,
          collection_name: Constants.CONTRACT_ALIEN_AVATARS,
        },
        pageNumber,
        Constants.WAX_PAGE_LIMIT
      )

      const allAssets = [...alienWorldsAssets, ...alienAvatarsAssets]
      return allAssets ?? null
    },
    async getAssetById(id: string) {
      if (!id) return null

      const alienWorldsResult = await client.getAssets({
        asset_id: id,
        collection_name: Constants.CONTRACT_ALIEN_WORLDS,
      })

      if (alienWorldsResult[0]) return alienWorldsResult[0]

      const alienAvatarsResult = await client.getAssets({
        asset_id: id,
        schema_name: Constants.CONTRACT_ALIEN_AVATARS,
        collection_name: Constants.CONTRACT_ALIEN_AVATARS,
      })

      return alienAvatarsResult[0] ?? null
    },
    async getAssetsByIds(ids: string[]) {
      const result = await client.getAssets(
        { ids: ids.join(','), collection_name: Constants.CONTRACT_ALIEN_WORLDS },
        1,
        100
      )
      return result
    },
    async getTemplateById(id: string) {
      if (!id) return null

      const result = await client.getTemplate(Constants.CONTRACT_ALIEN_WORLDS, id)

      return result ?? null
    },
    async getTemplatesByIds(ids: string) {
      if (!ids) return null
      const result = await client.getTemplates({ ids })
      return result ?? null
    },
  }
})()
