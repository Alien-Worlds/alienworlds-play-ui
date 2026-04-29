import { useState } from 'react'

import {
  LeaderboardFilter,
  LeaderboardSortByOptions,
} from 'features/leaderboard/types/leaderboardTypes'

export const useLeaderboardState = () => {
  const [offset, setOffset] = useState<number>(0)
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [searchValue, setSearchValue] = useState<string>('')
  const [isSortReversed, setIsSortReversed] = useState<boolean>(false)
  const [sort, setSort] = useState<string>(LeaderboardSortByOptions[0].value)
  const [timeframe, setTimeframe] = useState<LeaderboardFilter | string>(LeaderboardFilter.DAILY)
  const [isLoadingNewPage, setIsLoadingNewPage] = useState<boolean>(false)

  return {
    offset,
    setOffset,
    currentPage,
    setCurrentPage,
    searchValue,
    setSearchValue,
    isSortReversed,
    setIsSortReversed,
    sort,
    setSort,
    timeframe,
    setTimeframe,
    isLoadingNewPage,
    setIsLoadingNewPage,
  }
}
