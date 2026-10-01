import { getRarityPools, getShineInfo } from './chainReads'

const mockGetTableRows = jest.fn()
jest.mock('shared/wax/tables', () => ({
  getTableRows: (query: unknown) => mockGetTableRows(query),
}))

beforeEach(() => mockGetTableRows.mockReset())

describe('getShineInfo', () => {
  it("reads the template's shine lookup from s.federation", async () => {
    mockGetTableRows.mockResolvedValue([{ to: 777, cost: '40.0000 TLM', qty: 4 }])

    expect(await getShineInfo('123')).toEqual({ to: 777, cost: '40.0000 TLM', qty: 4 })
    expect(mockGetTableRows).toHaveBeenCalledWith(
      expect.objectContaining({
        table: 'lookups',
        scope: 's.federation',
        code: 's.federation',
        lower_bound: '123',
        upper_bound: '123',
        limit: 1,
      })
    )
  })

  it('returns null without a template or a row', async () => {
    expect(await getShineInfo('')).toBeNull()
    mockGetTableRows.mockResolvedValue([])
    expect(await getShineInfo('123')).toBeNull()
  })
})

describe('getRarityPools', () => {
  it("reads the planet treasury's pools from m.federation", async () => {
    mockGetTableRows.mockResolvedValue([{ pool_buckets: [] }])

    expect(await getRarityPools('eyeke.world')).toEqual({ pool_buckets: [] })
    expect(mockGetTableRows).toHaveBeenCalledWith({
      table: 'pools',
      code: 'm.federation',
      scope: 'eyeke.world',
      limit: 1,
    })
  })
})
