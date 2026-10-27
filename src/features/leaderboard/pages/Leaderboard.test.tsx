import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { LeaderboardItem } from 'features/leaderboard/types/leaderboardTypes'

import { Leaderboard } from './Leaderboard'

const mockUseLeaderboardListQuery = jest.fn()
const mockUseLeaderboardFindQuery = jest.fn()
jest.mock('features/leaderboard/utils/leaderboardQueries', () => ({
  useLeaderboardListQuery: (params: unknown) => mockUseLeaderboardListQuery(params),
  useLeaderboardFindQuery: (params: unknown) => mockUseLeaderboardFindQuery(params),
}))

const mockGetPlayer = jest.fn()
jest.mock('shared/wax/players', () => ({
  getPlayer: (walletId: string) => mockGetPlayer(walletId),
}))

const mockGetAssetById = jest.fn()
jest.mock('shared/util/atomicassets', () => ({
  getAssetById: (id: string) => mockGetAssetById(id),
}))

jest.mock('shared/util/nft', () => ({
  getNftImage: (asset: { asset_id: string } | null) =>
    asset ? `img-${asset.asset_id}` : undefined,
}))

let mockParams: { id?: string } = {}
jest.mock('react-router', () => ({
  ...jest.requireActual('react-router'),
  useParams: () => mockParams,
}))

const mockNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}))

jest.mock('shared/util/hooks', () => ({
  useScreenSize: () => ({ isMobile: false, isNotDesktop: false }),
}))

jest.mock('@alien-worlds/uikit', () => ({
  Dropdown: ({ options, onChange }) => (
    <select
      aria-label="Sort by"
      onChange={(e) => onChange(options.find((o) => o.value === e.target.value))}
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  ),
  Paginator: ({ onPageSelected }) => <button onClick={() => onPageSelected(3)}>page 3</button>,
}))

jest.mock('@alien-worlds/icons', () => ({
  CrossIcon: () => <span data-testid="clear-search" />,
  Search2Icon: () => null,
}))

jest.mock('features/leaderboard/components/LeaderBoardTable/LeaderBoardTable', () => ({
  LeaderBoardTable: ({ items, isLoadingNewPage }) => (
    <ul data-testid="table" data-loading={String(isLoadingNewPage)}>
      {items.map((item: LeaderboardItem) => (
        <li key={item.wallet_id}>
          {`${item.position} ${item.wallet_id} ${item.tag} ${item.avatar}`}
        </li>
      ))}
    </ul>
  ),
}))

jest.mock('features/leaderboard/components/LeaderboardTimeSwitch/LeaderboardTimeSwitch', () => ({
  LeaderboardTimeSwitch: ({ onChange }) => (
    <button onClick={() => onChange('weekly')}>Weekly</button>
  ),
}))

jest.mock('features/leaderboard/components/ReverseSortingFilter', () => ({
  ReverseSortingFilter: ({ onToggle }) => <button onClick={() => onToggle(true)}>reverse</button>,
}))

jest.mock('features/mining/components/MiningSelect/MiningSelect', () => ({
  MiningSelect: () => null,
}))

jest.mock('features/mining/components/MiningTabs/MiningTabs', () => ({
  MiningTabs: () => null,
  MiningTabPanelMotion: ({ children }) => <>{children}</>,
}))

const row = (position: number, wallet_id: string) => ({ position, wallet_id } as LeaderboardItem)

const players = {
  'alice.wam': { account: 'alice.wam', tag: 'Alice', avatar: '11' },
  'bob.wam': { account: 'bob.wam', tag: 'Bob', avatar: '22' },
  'carol.wam': { account: 'carol.wam', tag: 'Carol', avatar: '33' },
}

const listQuery = () => mockUseLeaderboardListQuery.mock.lastCall[0]
const findQuery = () => mockUseLeaderboardFindQuery.mock.lastCall[0]
const rows = () => screen.queryAllByRole('listitem').map((li) => li.textContent)
// Lets the page's async player/avatar lookups finish, for tests that assert before they do.
const settle = () => act(async () => {})

describe('Leaderboard', () => {
  let listData: { results: LeaderboardItem[]; total: number }
  let findData: { results: LeaderboardItem[] } | undefined

  beforeEach(() => {
    jest.clearAllMocks()
    mockParams = {}
    listData = { results: [row(2, 'bob.wam'), row(1, 'alice.wam')], total: 25 }
    findData = undefined
    mockUseLeaderboardListQuery.mockImplementation(() => ({ data: listData }))
    mockUseLeaderboardFindQuery.mockImplementation(() => ({ data: findData }))
    mockGetPlayer.mockImplementation(async (walletId: string) => players[walletId] ?? null)
    mockGetAssetById.mockImplementation(async (id: string) => (id ? { asset_id: id } : null))
  })

  it('loads the daily list, sorted by TLM mined, highest first', async () => {
    render(<Leaderboard />)

    expect(listQuery()).toEqual({
      timeframe: 'daily',
      sort: 'tlm_gains_total',
      offset: 0,
      limit: 10,
      order: -1,
    })
    expect(findQuery()).toEqual({ timeframe: 'daily', sort: 'tlm_gains_total', user: '' })
    await settle()
  })

  it("shows each row with the player's tag and avatar, in position order", async () => {
    render(<Leaderboard />)

    await waitFor(() =>
      expect(rows()).toEqual(['1 alice.wam Alice img-11', '2 bob.wam Bob img-22'])
    )
    expect(mockGetPlayer).toHaveBeenCalledWith('alice.wam')
    expect(mockGetPlayer).toHaveBeenCalledWith('bob.wam')
    expect(mockGetAssetById).toHaveBeenCalledWith('11')
    expect(mockGetAssetById).toHaveBeenCalledWith('22')
  })

  it('leaves the tag and avatar empty for a wallet with no player row', async () => {
    listData = { results: [row(1, 'nobody.wam')], total: 1 }

    render(<Leaderboard />)

    await waitFor(() => expect(rows()).toEqual(['1 nobody.wam null null']))
  })

  it('shows an empty table when the list has no results', async () => {
    listData = { results: [], total: 0 }

    render(<Leaderboard />)

    await waitFor(() => expect(screen.getByTestId('table')).toBeEmptyDOMElement())
    expect(mockGetPlayer).not.toHaveBeenCalled()
  })

  it('searches for the typed account in lowercase, monthly, and shows the search results', async () => {
    findData = { results: [row(7, 'carol.wam')] }

    render(<Leaderboard />)
    await userEvent.type(screen.getByPlaceholderText('WAM Account'), 'Carol.WAM')

    expect(findQuery()).toEqual({
      timeframe: 'monthly',
      sort: 'tlm_gains_total',
      user: 'carol.wam',
    })
    await waitFor(() => expect(rows()).toEqual(['7 carol.wam Carol img-33']))
  })

  it('clears the search and goes back to the leaderboard route', async () => {
    render(<Leaderboard />)
    const input = screen.getByPlaceholderText('WAM Account')
    await userEvent.type(input, 'carol')

    await userEvent.click(screen.getByTestId('clear-search'))

    expect(input).toHaveValue('')
    expect(mockNavigate).toHaveBeenCalledWith('/mining/leaderboard')
    await waitFor(() =>
      expect(rows()).toEqual(['1 alice.wam Alice img-11', '2 bob.wam Bob img-22'])
    )
  })

  it("searches for the wallet in the route, e.g. from a player's profile link", async () => {
    mockParams = { id: 'carol.wam' }

    render(<Leaderboard />)

    expect(screen.getByPlaceholderText('WAM Account')).toHaveValue('carol.wam')
    expect(findQuery()).toEqual({
      timeframe: 'monthly',
      sort: 'tlm_gains_total',
      user: 'carol.wam',
    })
    await settle()
  })

  it('changes the sort, order and timeframe of the list', async () => {
    render(<Leaderboard />)

    await userEvent.selectOptions(screen.getByLabelText('Sort by'), 'total_nft_points')
    await userEvent.click(screen.getByText('reverse'))
    await userEvent.click(screen.getByText('Weekly'))

    expect(listQuery()).toEqual({
      timeframe: 'weekly',
      sort: 'total_nft_points',
      offset: 0,
      limit: 10,
      order: 1,
    })
    await settle()
  })

  it('loads the selected page, showing loading until its rows are mapped', async () => {
    const page3 = { results: [row(21, 'carol.wam')], total: 25 }
    mockUseLeaderboardListQuery.mockImplementation(({ offset }) => ({
      data: offset === 20 ? page3 : listData,
    }))
    let resolveCarol: (player: unknown) => void
    mockGetPlayer.mockImplementation((walletId: string) =>
      walletId === 'carol.wam'
        ? new Promise((resolve) => (resolveCarol = resolve))
        : Promise.resolve(players[walletId])
    )

    render(<Leaderboard />)
    await waitFor(() => expect(rows()).toHaveLength(2))
    await userEvent.click(screen.getByText('page 3'))

    expect(listQuery().offset).toBe(20)
    expect(screen.getByTestId('table')).toHaveAttribute('data-loading', 'true')

    await act(async () => resolveCarol(players['carol.wam']))

    await waitFor(() => expect(rows()).toEqual(['21 carol.wam Carol img-33']))
    expect(screen.getByTestId('table')).toHaveAttribute('data-loading', 'false')
  })
})
