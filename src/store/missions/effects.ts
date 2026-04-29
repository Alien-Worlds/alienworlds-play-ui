import missionsMappings from 'features/missions/data/missionsMappings.json'
import { find, forEach } from 'lodash'
import { config } from 'shared/util/config'
import { getNftTemplatePinata } from 'shared/util/nft'
import { Explorer, Mission, PinataNft } from 'store/missions/types'

interface MissionsOptions {
  getAccount: () => string
}

export const api = (() => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let options: MissionsOptions = null

  return {
    initialize(_options: MissionsOptions) {
      // eslint-disable-next-line
      options = _options
    },
    async getRecentMissions() {
      try {
        const response = await fetch(
          `${config.MissionsApiUrl}/missions?page[limit]=100&page[number]=0&page[order]=desc`
        )
        const missions: Mission[] = (await response.json())?.data

        return missions
      } catch (e) {
        return null
      }
    },
    async getExplorer(account: string) {
      if (account === null) return null
      try {
        const response = await fetch(
          `${config.MissionsApiUrl}/explorers/${account}?page[limit]=5000&page[number]=0&page[order]=desc`
        )
        const explorer: Explorer = (await response.json())?.data

        return explorer
      } catch (e) {
        return null
      }
    },
    async getTemplatePinatas() {
      const pinataTemplates: PinataNft[] = []

      forEach(missionsMappings, async (m) => {
        try {
          const response = await fetch(`${config.IpfsApiUrl}/${m.IPFSHash}`)

          if (response) {
            const pinataNft: PinataNft = await response.json()
            pinataTemplates.push(pinataNft)
          }
        } catch (e) {
          console.log(e)
        }
      })

      return pinataTemplates
    },
    async mapPinatasToMissions(missions: Mission[], templatePinatas: PinataNft[]) {
      if (!missions) return null

      forEach(missions, (m) => {
        // Find current mission series and number
        const missionNumber: number = find(
          missionsMappings,
          (b) => b.title === m.attributes.name
        )?.cardNumber
        const missionSeries: number = find(
          missionsMappings,
          (b) => b.IPFSHash === m.attributes.nftTokenURI
        )?.series

        // Find template in stored Pinatas that matches those attributes
        const templatePinataForMission: PinataNft = getNftTemplatePinata(
          templatePinatas,
          missionSeries,
          missionNumber
        )

        // Map matching template Pinata to current mission
        m.pinataNft = templatePinataForMission
      })
      return missions
    },
  }
})()
