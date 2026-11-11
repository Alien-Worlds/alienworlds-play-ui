import missionsMappings from 'features/missions/data/missionsMappings.json'
import { buildMission, buildPinata } from 'features/missions/testUtils/fixtures'
import { api } from 'store/missions/effects'

// The missions REST and IPFS reads, as the Overmind effects make them today.

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

describe('missions api', () => {
  it('loads the 100 most recent missions', async () => {
    const missions = [buildMission({ raw: true })]
    mockFetch.mockReturnValue(respond({ data: missions }))

    await expect(api.getRecentMissions()).resolves.toEqual(missions)
    expect(mockFetch).toHaveBeenCalledWith(
      'https://missions.test/missions?page[limit]=100&page[number]=0&page[order]=desc'
    )
  })

  it("loads an account's explorer, or nothing without an account", async () => {
    const explorer = { id: 'e1', type: 'explorers', attributes: { missions: [] } }
    mockFetch.mockReturnValue(respond({ data: explorer }))

    await expect(api.getExplorer('0xabc')).resolves.toEqual(explorer)
    expect(mockFetch).toHaveBeenCalledWith(
      'https://missions.test/explorers/0xabc?page[limit]=5000&page[number]=0&page[order]=desc'
    )

    mockFetch.mockClear()
    await expect(api.getExplorer(null)).resolves.toBeNull()
    expect(mockFetch).not.toHaveBeenCalled()
  })

  it('returns null when a missions request fails', async () => {
    mockFetch.mockRejectedValue(new Error('offline'))

    await expect(api.getRecentMissions()).resolves.toBeNull()
    await expect(api.getExplorer('0xabc')).resolves.toBeNull()
  })

  it('requests a template NFT from IPFS for every mapped mission', async () => {
    const pinata = buildPinata()
    mockFetch.mockReturnValue(respond(pinata))

    const templates = await api.getTemplatePinatas()

    expect(mockFetch).toHaveBeenCalledTimes(missionsMappings.length)
    expect(mockFetch).toHaveBeenCalledWith(`https://ipfs.test/${missionsMappings[0].IPFSHash}`)
    // The fetches aren't awaited: the list fills in after it is returned.
    expect(templates).toEqual([])
    await new Promise((resolve) => setTimeout(resolve, 0))
    expect(templates).toHaveLength(missionsMappings.length)
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

    const result = await api.mapPinatasToMissions([mission, unmapped], [other, template])

    expect(result[0].pinataNft).toBe(template)
    expect(result[1].pinataNft).toBeUndefined()
    await expect(api.mapPinatasToMissions(null, [template])).resolves.toBeNull()
  })
})
