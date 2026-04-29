import { useQuery } from '@tanstack/react-query'
import {
  LeaderboardFindQueryParams,
  LeaderboardListQueryParams,
  LeaderboardResponse,
} from 'features/leaderboard/types/leaderboardTypes'
import { isEmpty, trim } from 'lodash'
import { config } from 'shared/util/config'

export const fetchLeaderboardFind = async ({
  timeframe,
  sort,
  user,
}: LeaderboardFindQueryParams): Promise<LeaderboardResponse> => {
  const url = `${config.LeaderboardApiUrl}/find?${new URLSearchParams({
    timeframe,
    user,
    sort,
  })}`
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error('leaderboard search fail')
  }
  return response.json()
}

export const useLeaderboardFindQuery = ({ timeframe, sort, user }: LeaderboardFindQueryParams) =>
  useQuery({
    queryKey: [
      'leaderboardFindQuery',
      {
        timeframe,
        sort,
        user,
      },
    ],
    queryFn: () => fetchLeaderboardFind({ timeframe, sort, user: trim(user) }),
    keepPreviousData: true,
    enabled: !isEmpty(user),
  })

export const fetchLeaderboardList = async ({
  timeframe,
  sort,
  offset,
  limit,
  order,
}: LeaderboardListQueryParams): Promise<LeaderboardResponse> => {
  const url = `${config.LeaderboardApiUrl}/list?${new URLSearchParams({
    timeframe: `${timeframe}`,
    sort: `${sort}`,
    order: `${order}`,
    offset: `${offset}`,
    limit: `${limit}`,
  })}`
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error('leaderboard list fail')
  }
  return response.json()
}

export const useLeaderboardListQuery = ({
  timeframe,
  sort,
  offset,
  limit,
  order,
}: LeaderboardListQueryParams) =>
  useQuery({
    queryKey: [
      'leaderboardListQuery',
      {
        timeframe,
        sort,
        offset,
        limit,
        order,
      },
    ],
    queryFn: () => fetchLeaderboardList({ timeframe, sort, offset, limit, order }),
    keepPreviousData: true,
  })
