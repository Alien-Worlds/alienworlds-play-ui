import { ExplorerApi } from 'atomicassets'

import { config } from './config'

export const getAtomicAssetsApi = () => {
  const api = new ExplorerApi(config.AtomicAssetsApiUrl, 'atomicassets', {
    fetch,
  })

  return api
}
