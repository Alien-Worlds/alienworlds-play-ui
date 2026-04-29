import { useEffect, useState } from 'react'

import { LeaderboardService } from 'features/leaderboard/services/leaderboardService'
import {
  LeaderboardFilter,
  LeaderboardResponse,
  LeaderboardSortOrder,
} from 'features/leaderboard/types/leaderboardTypes'
import {
  useLeaderboardFindQuery,
  useLeaderboardListQuery,
} from 'features/leaderboard/utils/leaderboardQueries'
import { isEmpty } from 'lodash'
import { useEffects } from 'store'

type Params = {
  timeframe: LeaderboardFilter | string
  sort: string
  offset: number
  limit: number
  isSortReversed: boolean
  searchValue: string
}

export const useLeaderboardData = ({
  timeframe,
  sort,
  offset,
  limit,
  isSortReversed,
  searchValue,
}: Params) => {
  const {
    wax: {
      api: { getPlayer },
    },
    atomic: {
      api: { getAssetById },
    },
  } = useEffects()

  const [gridData, setGridData] = useState<any[]>([])
  const [isLoadingNewPage, setIsLoadingNewPage] = useState<boolean>(false)

  const { data: searchData } = useLeaderboardFindQuery({ timeframe, sort, user: searchValue })
  const { data: listData } = useLeaderboardListQuery({
    timeframe,
    sort,
    offset,
    limit,
    order: isSortReversed ? LeaderboardSortOrder.ASC : LeaderboardSortOrder.DESC,
  })

  useEffect(() => {
    const process = async (data?: LeaderboardResponse) => {
      if (!data?.results || data.results.length === 0) {
        setGridData([])
        setIsLoadingNewPage(false)
        return
      }
      const mapped = await LeaderboardService.mapAvatarAndTag(data.results, getPlayer, getAssetById)
      setGridData(mapped)
      setIsLoadingNewPage(false)
    }

    if (!isEmpty(searchValue)) {
      process(searchData)
    } else {
      process(listData)
    }
  }, [listData?.results, searchData?.results, searchValue])

  return {
    gridData,
    listTotal: listData?.total || 0,
    isLoadingNewPage,
    setIsLoadingNewPage,
  }
}
