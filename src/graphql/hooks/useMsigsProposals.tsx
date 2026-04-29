import { useQuery } from '@apollo/client'
import { MSIGS_QUERY } from 'graphql/queries/msigs'
import { get } from 'lodash'
//import { get } from 'lodash'

const useMsigsProposals = (memoizedSelectedDacId: string) => {
  const shouldFetch = memoizedSelectedDacId && memoizedSelectedDacId.length > 0
  const { data, loading, error, refetch } = useQuery(MSIGS_QUERY, {
    variables: {
      dacId: memoizedSelectedDacId,
      sortBy: 'proposal_id',
      reverse: true,
      limit: 1000,
    },
    fetchPolicy: 'cache-first',
    skip: !shouldFetch,
  })

  const msigsProposals = get(data, 'msigs', [])

  return { msigsProposals, loading, error, refetch }
}

export { useMsigsProposals }
