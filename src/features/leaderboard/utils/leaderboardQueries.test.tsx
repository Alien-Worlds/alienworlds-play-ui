import { ReactNode } from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'

import {
  fetchLeaderboardFind,
  fetchLeaderboardList,
  useLeaderboardFindQuery,
} from './leaderboardQueries'

jest.mock('shared/util/config', () => ({
  config: { LeaderboardApiUrl: 'https://leaderboard.example' },
}))

const mockFetch = jest.fn()

const respond = (body: unknown, ok = true) =>
  mockFetch.mockResolvedValue({ ok, json: async () => body })

const wrapper = ({ children }: { children: ReactNode }) => (
  <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
    {children}
  </QueryClientProvider>
)

describe('leaderboardQueries', () => {
  beforeEach(() => {
    mockFetch.mockReset()
    global.fetch = mockFetch
  })

  describe('fetchLeaderboardList', () => {
    const params = { timeframe: 'daily', sort: 'tlm_gains_total', offset: 20, limit: 10, order: -1 }

    it('requests the page of the list', async () => {
      respond({ results: [], total: 0 })

      await expect(fetchLeaderboardList(params)).resolves.toEqual({ results: [], total: 0 })
      expect(mockFetch).toHaveBeenCalledWith(
        'https://leaderboard.example/list?timeframe=daily&sort=tlm_gains_total&order=-1&offset=20&limit=10'
      )
    })

    it('throws when the API fails', async () => {
      respond({}, false)
      await expect(fetchLeaderboardList(params)).rejects.toThrow('leaderboard list fail')
    })
  })

  describe('fetchLeaderboardFind', () => {
    const params = { timeframe: 'monthly', sort: 'tlm_gains_total', user: 'alice.wam' }

    it('searches for the account', async () => {
      respond({ results: [] })

      await fetchLeaderboardFind(params)
      expect(mockFetch).toHaveBeenCalledWith(
        'https://leaderboard.example/find?timeframe=monthly&user=alice.wam&sort=tlm_gains_total'
      )
    })

    it('throws when the API fails', async () => {
      respond({}, false)
      await expect(fetchLeaderboardFind(params)).rejects.toThrow('leaderboard search fail')
    })
  })

  describe('useLeaderboardFindQuery', () => {
    it('does not search until an account is typed', () => {
      renderHook(
        () => useLeaderboardFindQuery({ timeframe: 'monthly', sort: 'tlm_gains_total', user: '' }),
        { wrapper }
      )
      expect(mockFetch).not.toHaveBeenCalled()
    })

    it('searches for the trimmed account', async () => {
      respond({ results: [] })

      renderHook(
        () =>
          useLeaderboardFindQuery({
            timeframe: 'monthly',
            sort: 'tlm_gains_total',
            user: ' alice.wam ',
          }),
        { wrapper }
      )

      await waitFor(() => expect(mockFetch).toHaveBeenCalled())
      expect(mockFetch.mock.calls[0][0]).toContain('user=alice.wam&')
    })
  })
})
