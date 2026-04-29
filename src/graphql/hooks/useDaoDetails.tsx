import { useQuery } from '@apollo/client'
import { DAO_DETAILS_QUERY } from 'graphql/queries/daoDetails'
import { get } from 'lodash'

const useDaoDetails = (memoizedSelectedDacId: string) => {
  const shouldFetch = memoizedSelectedDacId && memoizedSelectedDacId.length > 0
  const { data, loading, error, refetch } = useQuery(DAO_DETAILS_QUERY, {
    variables: {
      dacId: memoizedSelectedDacId,
      sortBy: 'decay_rank',
      activeCandidates: true,
      reverse: false,
      limit: 100,
      custodiansSortBy2: 'decay_rank',
      custodiansReverse2: false,
      custodiansLimit2: 10,
    },
    fetchPolicy: 'cache-first', // Uses cache if available, no extra request
    nextFetchPolicy: 'cache-and-network',
    skip: !shouldFetch,
    // Fetches fresh data when needed
  })
  const daoDetails = get(data, 'dao_details', null)

  return { daoDetails, loading, error, refetch }
}

export { useDaoDetails }
