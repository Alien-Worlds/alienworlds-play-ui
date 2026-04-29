import { IAsset } from 'atomicassets/build/API/Explorer/Objects'
import { Serialize } from 'eosjs'
import { GlossaryContentDetails } from 'features/glossary/types/GlossaryTypes'
import { Octokit } from 'octokit'
import { json } from 'overmind'
import { config } from 'shared/util/config'
import showdown from 'showdown'
import { PullRequest } from 'store/main/types'

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
export const getLorePullRequests = async (): Promise<Array<PullRequest> | null> => {
  try {
    const octokit = new Octokit()

    const response = await octokit.request('GET /repos/Alien-Worlds/the-lore/pulls', {
      owner: 'Alien-Worlds',
      repo: 'the-lore',
      headers: {
        'X-GitHub-Api-Version': '2022-11-28',
      },
    })

    if (response.status === 200) {
      return response.data
    }
    return null
  } catch (error) {
    console.log(error)
    return null
  }
}
export const getLorePullCommit = async ({
  pullNumber,
}: {
  pullNumber: number
}): Promise<string | null> => {
  try {
    const octokit = new Octokit()

    const response = await octokit.request(
      `GET /repos/Alien-Worlds/the-lore/pulls/${pullNumber}/commits`,
      {
        owner: 'Alien-Worlds',
        repo: 'the-lore',
        headers: {
          'X-GitHub-Api-Version': '2022-11-28',
        },
      }
    )

    if (response.status === 200) {
      return response.data[0].commit.message
    }
    return null
  } catch (error) {
    console.log(error)
    return null
  }
}
export const getLoreReadMe = async (): Promise<string | null> => {
  try {
    const octokit = new Octokit()

    const response = await octokit.request('GET /repos/Alien-Worlds/the-lore/contents/README.md', {
      owner: 'Alien-Worlds',
      repo: 'the-lore',
      headers: {
        'X-GitHub-Api-Version': '2022-11-28',
        'Content-Type': 'application/json',
      },
    })
    const converter = new showdown.Converter()

    if (response.status === 200) {
      const html = converter.makeHtml(atob(response.data.content))

      return html
    }

    return null
  } catch (error) {
    console.log(error)
    return null
  }
}
