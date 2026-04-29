import { useQuery } from '@apollo/client'
import { DAO_TREASURIES_QUERY } from 'graphql/queries/daoTreasury'

const useDaoTreasuries = (memoizedSelectedDacIds: string[]) => {
  const shouldFetch = memoizedSelectedDacIds && memoizedSelectedDacIds.length > 0
  const { data, loading, error, refetch } = useQuery(DAO_TREASURIES_QUERY, {
    variables: {
      formatted: true,
      dacIds: memoizedSelectedDacIds,
    },
    fetchPolicy: 'cache-first',
    skip: !shouldFetch,
    // Uses cache if available, no extra request
    // Fetches fresh data when needed
  })

  const dacTreasury = data?.daoTreasuries
  return { dacTreasury, loading, error, refetch }
}

export { useDaoTreasuries }
