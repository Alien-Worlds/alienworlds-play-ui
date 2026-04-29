import { useEffect, useState } from 'react'

import { useQuery } from '@tanstack/react-query'
import { useEffects } from 'store'
import { WaxUserPoints } from 'store/wax/types'

const LOAD_USER_POINTS_UPDATE_INTERVAL = 1000 * 60 * 5 // 5 minutes
const LOAD_USER_POINTS_UPDATE_FAST_INTERVAL = 1000 * 10 // 10 seconds
const LOAD_USER_POINTS_UPDATE_FAST_ATTEMPTS = 3
export const LOAD_USER_POINTS_QUERY_KEY = 'user-points'

/**
 * If query was "reset" via `resetQueries`, we make several burst refetches,
 * to give enough time for data on chain to propagate, then fallback to default update interval
 * after a decided number of calls and delays have passed.
 *
 * Has local useState and useEffect to prevent "data flickering" when we reset this query,
 * as data becomes `undefined` when we use `resetQueries` to hard reset the query
 * and set internal `dataUpdateCount` to 0, which we can read in `refetchInterval`.
 * This comes with cost of additional re-renders for each hook instance,
 * but makes data update flow "not showing loading again" for the user,
 * same the regular background updates with `invalidateQueries` would go.
 */
export const useLoadUserPoints = () => {
  const effects = useEffects()
  const [userPoints, setUserPoints] = useState<WaxUserPoints>()

  const queryResult = useQuery({
    queryKey: [LOAD_USER_POINTS_QUERY_KEY],
    refetchInterval: (_data, query) => {
      return query.state.dataUpdateCount < LOAD_USER_POINTS_UPDATE_FAST_ATTEMPTS
        ? LOAD_USER_POINTS_UPDATE_FAST_INTERVAL
        : LOAD_USER_POINTS_UPDATE_INTERVAL
    },
    queryFn: async () => {
      // this is a mock for a valid case for new users who has not gathered any points yet,
      // so they don't have a record in the table yet thus the mock
      let userPointsResult: WaxUserPoints = {
        user: '',
        total_points: 0,
        redeemable_points: 0,
        daily_points: 0,
        weekly_points: 0,
        top_level_claimed: 1,
        last_action_timestamp: '',
        milestones: [],
      }

      const result = await effects.wax.api.getUserPoints()

      if (result) {
        userPointsResult = result
      }

      return userPointsResult
    },
  })

  useEffect(() => {
    if (queryResult.data) {
      setUserPoints(queryResult.data)
    }
  }, [queryResult.data])

  return { data: userPoints }
}
