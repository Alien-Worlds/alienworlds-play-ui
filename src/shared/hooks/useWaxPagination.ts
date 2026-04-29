import { useState } from 'react'

import { WaxResponse } from 'store/wax/types'

type WaxPaginationResult<T> = {
  items: T[]
  fetchMore: () => void
  isLoading: boolean
  isLastPage: boolean
}

type FetchItemsParams = {
  lowerBound: any
  fetchLimit: number
}

/**
 * Custom hook for EOS pagination.
 *
 * @template T
 * @param {T[]} limit - The number of items to retrieve per page.
 * @param {(lastItem: T | null, limit: number) => Promise<<WaxResponse<T>>} fetchItems - A function to fetch items, taking the last retrieved item and limit as parameters.
 * @returns {WaxPaginationResult<T>} Returns an object containing paginated results, along with related pagination info.
 */
function useWaxPagination<T>(
  limit: number,
  fetchItems: ({ lowerBound, fetchLimit }: FetchItemsParams) => Promise<WaxResponse<T>>
): WaxPaginationResult<T> {
  const [items, setItems] = useState<T[]>([])
  const [nextKey, setNextKey] = useState<string | number>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isLastPage, setIsLastPage] = useState(false)

  const fetchMore = async () => {
    setIsLoading(true)

    try {
      const {
        more,
        next_key: nextKeyResult,
        rows,
      } = await fetchItems({
        lowerBound: nextKey,
        fetchLimit: limit,
      })

      if (rows.length) {
        setItems([...items, ...rows])
        setNextKey(nextKeyResult)
      }

      if (!more) {
        setIsLastPage(true)
      }
    } catch (error) {
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  return { items, fetchMore, isLoading, isLastPage }
}

export { useWaxPagination }
