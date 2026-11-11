import missionsMappings from 'features/missions/data/missionsMappings.json'
import { buildMission, buildPinata } from 'features/missions/testUtils/fixtures'
import { MissionStatus } from 'features/missions/types/missionsTypes'

import {
  getExplorer,
  getRecentMissions,
  getTemplatePinatas,
  matchMissionsToTemplates,
} from './missionsApi'

// The missions REST and IPFS reads (formerly the Overmind missions effects).

jest.mock('shared/util/config', () => ({
  config: {
    ...jest.requireActual('shared/util/config').config,
    IpfsApiUrl: 'https://ipfs.test',
    MissionsApiUrl: 'https://missions.test',
  },
}))

const mockFetch = jest.fn()

beforeEach(() => {
  mockFetch.mockReset()
  global.fetch = mockFetch
})

const respond = (body: unknown) => Promise.resolve({ json: async () => body } as Response)

describe('missionsApi', () => {
  it('loads the 100 most recent missions', async () => {
    const missions = [buildMission({ raw: true })]
    mockFetch.mockReturnValue(respond({ data: missions }))

    await expect(getRecentMissions()).resolves.toEqual(missions)
    expect(mockFetch).toHaveBeenCalledWith(
      'https://missions.test/missions?page[limit]=100&page[number]=0&page[order]=desc'
    )
  })

  it("loads an account's explorer, or nothing without an account", async () => {
    const explorer = { id: 'e1', type: 'explorers', attributes: { missions: [] } }
    mockFetch.mockReturnValue(respond({ data: explorer }))

    await expect(getExplorer('0xabc')).resolves.toEqual(explorer)
    expect(mockFetch).toHaveBeenCalledWith(
      'https://missions.test/explorers/0xabc?page[limit]=5000&page[number]=0&page[order]=desc'
    )

    mockFetch.mockClear()
    await expect(getExplorer(null)).resolves.toBeNull()
    await expect(getExplorer(undefined)).resolves.toBeNull()
    expect(mockFetch).not.toHaveBeenCalled()
  })

  it('returns null when a missions request fails', async () => {
    mockFetch.mockRejectedValue(new Error('offline'))

    await expect(getRecentMissions()).resolves.toBeNull()
    await expect(getExplorer('0xabc')).resolves.toBeNull()
  })

  it('returns null when a missions response has no data', async () => {
    mockFetch.mockReturnValue(respond({ errors: [] }))

    await expect(getRecentMissions()).resolves.toBeNull()
    await expect(getExplorer('0xabc')).resolves.toBeNull()
  })

  it('loads a template NFT from IPFS for every mapped mission', async () => {
    mockFetch.mockReturnValue(respond(buildPinata()))

    const templates = await getTemplatePinatas()

    expect(mockFetch).toHaveBeenCalledTimes(missionsMappings.length)
    expect(mockFetch).toHaveBeenCalledWith(`https://ipfs.test/${missionsMappings[0].IPFSHash}`)
    // It used to return an empty list that filled in afterwards.
    expect(templates).toHaveLength(missionsMappings.length)
  })

  it('moves template images onto the AW IPFS gateway, and leaves out those that fail', async () => {
    jest.spyOn(console, 'log').mockImplementation(() => {})
    mockFetch
      .mockReturnValueOnce(respond({ ...buildPinata(), image: 'https://ipfs.io/ipfs/QmImage' }))
      .mockRejectedValueOnce(new Error('offline'))
      .mockReturnValue(respond(null))

    const templates = await getTemplatePinatas()

    expect(templates).toHaveLength(1)
    expect(templates[0].image).toBe('https://ipfs.test/QmImage')
  })

  it('matches each mission to its template NFT by series (token URI) and card number (name)', async () => {
    const [first] = missionsMappings
    const template = buildPinata({ series: first.series, cardNumber: first.cardNumber })
    const other = buildPinata({ series: 9, cardNumber: 9 })
    const mission = buildMission({
      raw: true,
      pinataNft: null,
      attributes: { name: first.title, nftTokenURI: first.IPFSHash },
    })
    const unmapped = buildMission({ raw: true, id: '2', pinataNft: null })

    const result = matchMissionsToTemplates([mission, unmapped], [other, template])

    expect(result[0].pinataNft).toBe(template)
    expect(result[1].pinataNft).toBeUndefined()
    expect(matchMissionsToTemplates(null, [template])).toBeNull()
  })

  it('returns copies with their views', () => {
    const mission = buildMission({ raw: true, status: MissionStatus.Departed })

    const [result] = matchMissionsToTemplates([mission], [])

    expect(result).not.toBe(mission)
    expect(mission.view).toBeUndefined()
    expect(result.view.status).toBe(MissionStatus.Departed)
  })
})
