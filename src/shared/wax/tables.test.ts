import { getTableRows } from './tables'

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
