import missionsMappings from 'features/missions/data/missionsMappings.json'
import { Explorer, Mission, PinataNft } from 'features/missions/types/missionsTypes'
import { withMissionView } from 'features/missions/utils/missionHelpers'
import { find, replace } from 'lodash'
import { config } from 'shared/util/config'
import { getNftTemplatePinata } from 'shared/util/nft'

// Reads from the missions API and the missions NFTs' IPFS metadata. Formerly Overmind's
// missions.api effects.

/** The 100 most recent missions, or null if the request fails. */
export const getRecentMissions = async (): Promise<Mission[] | null> => {
  try {
    const response = await fetch(
      `${config.MissionsApiUrl}/missions?page[limit]=100&page[number]=0&page[order]=desc`
    )
    return (await response.json())?.data ?? null
  } catch (e) {
    return null
  }
}

/** A BSC address's explorer (the missions it joined), or null without one or if it fails. */
export const getExplorer = async (account: string | null | undefined): Promise<Explorer | null> => {
  if (!account) return null
  try {
    const response = await fetch(
      `${config.MissionsApiUrl}/explorers/${account}?page[limit]=5000&page[number]=0&page[order]=desc`
    )
    return (await response.json())?.data ?? null
  } catch (e) {
    return null
  }
}

/**
 * The template NFT of every mapped mission, from IPFS, with images on the AW IPFS gateway.
 * Templates that fail to load are left out.
 */
export const getTemplatePinatas = async (): Promise<PinataNft[]> => {
  const results = await Promise.allSettled(
    missionsMappings.map(async (mapping) => {
      const response = await fetch(`${config.IpfsApiUrl}/${mapping.IPFSHash}`)
      return (await response.json()) as PinataNft
    })
  )

  return results.flatMap((result) => {
    if (result.status === 'rejected') {
      console.log(result.reason)
      return []
    }
    if (!result.value) return []
    return [
      {
        ...result.value,
        image: replace(result.value.image, 'https://ipfs.io/ipfs', config.IpfsApiUrl),
      },
    ]
  })
}

/**
 * Gives each mission its template NFT, matched by series (the token URI) and card number (the
 * name), and its view. Returns copies; null stays null.
 */
export const matchMissionsToTemplates = (
  missions: Mission[] | null,
  templatePinatas: PinataNft[] | null
): Mission[] | null => {
  if (!missions) return null

  return missions.map((mission) => {
    const cardNumber = find(
      missionsMappings,
      (m) => m.title === mission.attributes.name
    )?.cardNumber
    const series = find(
      missionsMappings,
      (m) => m.IPFSHash === mission.attributes.nftTokenURI
    )?.series

    return withMissionView({
      ...mission,
      pinataNft: getNftTemplatePinata(templatePinatas, series, cardNumber),
    })
  })
}
