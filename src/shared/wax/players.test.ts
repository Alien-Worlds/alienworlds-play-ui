import { getPlayer } from './players'

const mockGetTableRows = jest.fn()
jest.mock('./tables', () => ({
  getTableRows: (query: unknown) => mockGetTableRows(query),
}))

describe('getPlayer', () => {
  beforeEach(() => mockGetTableRows.mockReset())

  it("reads the wallet's row from federation's players table", async () => {
    mockGetTableRows.mockResolvedValue([{ account: 'player.wam', tag: 'Neo', avatar: '42' }])

    expect(await getPlayer('player.wam')).toEqual({
      account: 'player.wam',
      tag: 'Neo',
      avatar: '42',
    })
    expect(mockGetTableRows).toHaveBeenCalledWith({
      table: 'players',
      scope: 'federation',
      code: 'federation',
      upper_bound: 'player.wam',
      lower_bound: 'player.wam',
      limit: 10,
    })
  })

  it('returns null when the player has no row', async () => {
    mockGetTableRows.mockResolvedValue([])
    expect(await getPlayer('nobody.wam')).toBeNull()
  })

  it('returns null without a wallet id, without reading the chain', async () => {
    expect(await getPlayer('')).toBeNull()
    expect(mockGetTableRows).not.toHaveBeenCalled()
  })
})
