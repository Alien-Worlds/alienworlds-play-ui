import { getTablePage, getTableRows } from './tables'

const mockGetTableRowsRpc = jest.fn()
jest.mock('eosjs', () => ({
  JsonRpc: class {
    get_table_rows = (query: unknown) => mockGetTableRowsRpc(query)
  },
}))

jest.mock('shared/util/config', () => ({ config: { WaxFetchApiUrl: 'https://wax.example' } }))

describe('getTableRows', () => {
  const query = { code: 'm.federation', scope: 'm.federation', table: 'miners' }

  it('returns the rows of the query', async () => {
    mockGetTableRowsRpc.mockResolvedValue({ rows: [{ miner: 'a' }] })

    expect(await getTableRows(query)).toEqual([{ miner: 'a' }])
    expect(mockGetTableRowsRpc).toHaveBeenCalledWith(query)
  })

  it('returns null without rows', async () => {
    mockGetTableRowsRpc.mockResolvedValue({})

    expect(await getTableRows(query)).toBeNull()
  })
})

describe('getTablePage', () => {
  const query = { code: 'uspts.worlds', scope: 'uspts.worlds', table: 'premintoffrs', limit: 2 }

  it('returns the rows with more and next_key', async () => {
    mockGetTableRowsRpc.mockResolvedValue({ rows: [{ offer_id: 1 }], more: true, next_key: '7' })

    expect(await getTablePage(query)).toEqual({
      rows: [{ offer_id: 1 }],
      more: true,
      next_key: '7',
    })
    expect(mockGetTableRowsRpc).toHaveBeenCalledWith(query)
  })

  it('returns an empty last page without a result', async () => {
    mockGetTableRowsRpc.mockResolvedValue({})

    expect(await getTablePage(query)).toEqual({ rows: [], more: false, next_key: '' })
  })
})
