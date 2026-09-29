import { IAsset } from 'atomicassets/build/API/Explorer/Objects'
import { Serialize } from 'eosjs'
import { GlossaryContentDetails } from 'features/glossary/types/GlossaryTypes'
import { json } from 'overmind'
import { config } from 'shared/util/config'

import { mapBagToMiningParams, mapLandToMiningParams } from './helpers'

interface MainOptions {
  getBagAssets(): IAsset[]
  getLandAsset(): IAsset
  getLastMineTx(): string
  getWalletId(): string
  onGetMiningRandomString(value: string): void
  onRuntimeTick(): void
}

const mapToArray = (name) => {
  const sb = new Serialize.SerialBuffer({
    textEncoder: new TextEncoder(),
    textDecoder: new TextDecoder(),
  })

  sb.pushName(name)

  return sb.array
}

export const api = (() => {
  let options: MainOptions = null
  setInterval(() => {
    if (options !== null) {
      options.onRuntimeTick()
    }
  }, 1000)

  return {
    initialize(_options: MainOptions) {
      options = _options
    },
    async runMineWorker() {
      const worker = new Worker(`${process.env.PUBLIC_URL}/mine-worker.js`)

      worker.addEventListener('message', (evt) => {
        options.onGetMiningRandomString(evt.data)
        worker.terminate()
      })

      const bagParams = mapBagToMiningParams(options.getBagAssets())
      const landParams = mapLandToMiningParams(options.getLandAsset())

      const request = {
        bagParams,
        landParams,
        lastMine: json(options.getLastMineTx()),
        account: mapToArray(options.getWalletId()).slice(0, 8),
      }

      worker.postMessage(request)
    },
  }
})()

export const getZendeskArticle = async (
  zendeskId: number
): Promise<GlossaryContentDetails | null> => {
  try {
    const response = await fetch(`${config.ArticlesApiUrl}?filters[zendeskId][$eq]=${zendeskId}`, {
      headers: { Authorization: `Bearer ${config.CMSApiToken}` },
    })

    const responseJson = await response.json()
    if (responseJson?.data?.length > 0) {
      return {
        title: responseJson.data[0].attributes.title,
        description: responseJson.data[0].attributes.content,
        id: zendeskId,
      }
    }

    return null
  } catch (error) {
    console.log(error)
    return null
  }
}
