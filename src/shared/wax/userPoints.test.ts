import { getLevelOffers, getPointsOffers } from './userPoints'

const mockGetTableRows = jest.fn()
const mockGetTablePage = jest.fn()
jest.mock('./tables', () => ({
  getTableRows: (query: unknown) => mockGetTableRows(query),
  getTablePage: (query: unknown) => mockGetTablePage(query),
}))

const pointsOffersQuery = {
  table: 'pointoffers',
  scope: 'uspts.worlds',
  code: 'uspts.worlds',
  key_type: '',
  limit: 500,
  reverse: true,
}

describe('userPoints', () => {
  beforeEach(() => jest.clearAllMocks())

  it('reads the level offers', async () => {
    mockGetTableRows.mockResolvedValue([{ id: 1, level: 2 }])

    expect(await getLevelOffers()).toEqual([{ id: 1, level: 2 }])
    expect(mockGetTableRows).toHaveBeenCalledWith({
      table: 'leveloffers',
      scope: 'uspts.worlds',
      code: 'uspts.worlds',
      limit: 100,
    })
  })

  it('reads the AW NFT offers, newest first', async () => {
    mockGetTablePage.mockResolvedValue({ rows: [{ id: 2 }, { id: 1 }], more: false, next_key: '' })

    expect(await getPointsOffers()).toEqual([{ id: 2 }, { id: 1 }])
    expect(mockGetTablePage).toHaveBeenCalledWith(pointsOffersQuery)
  })

  it('reads every page of AW NFT offers', async () => {
    mockGetTablePage
      .mockResolvedValueOnce({ rows: [{ id: 9 }, { id: 8 }], more: true, next_key: '7' })
      .mockResolvedValueOnce({ rows: [{ id: 7 }], more: false, next_key: '' })

    expect(await getPointsOffers()).toEqual([{ id: 9 }, { id: 8 }, { id: 7 }])
    expect(mockGetTablePage).toHaveBeenNthCalledWith(2, { ...pointsOffersQuery, upper_bound: '7' })
  })

  it('returns null when there are no AW NFT offers', async () => {
    mockGetTablePage.mockResolvedValue({ rows: [], more: false, next_key: '' })
    expect(await getPointsOffers()).toBeNull()
  })
})
