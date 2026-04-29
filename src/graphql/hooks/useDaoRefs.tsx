import { useQuery } from '@apollo/client'
import { DAO_REF_QUERY } from 'graphql/queries/daoRefs'
import { get } from 'lodash'

const useDaoRefs = (memoizedSelectedDacId: string) => {
  const shouldFetch = memoizedSelectedDacId && memoizedSelectedDacId.length > 0
  const { data, loading, error, refetch } = useQuery(DAO_REF_QUERY, {
    variables: {
      dacId: memoizedSelectedDacId,
    },
    fetchPolicy: 'cache-first',
    skip: !shouldFetch,
    // Uses cache if available, no extra request
    // Fetches fresh data when needed
  })

  const daoRefs = get(data, 'dao_details.refs', null)

  return { daoRefs, loading, error, refetch }
}

export { useDaoRefs }
