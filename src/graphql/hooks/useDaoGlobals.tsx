import { useQuery } from '@apollo/client'
import { DAO_DETAILS_DAC_GLOBALS } from 'graphql/queries/daoDetails'
import { get } from 'lodash'

const useDaoGlobals = (memoizedSelectedDacId: string) => {
  const shouldFetch = memoizedSelectedDacId && memoizedSelectedDacId.length > 0
  const { data, loading, error, refetch } = useQuery(DAO_DETAILS_DAC_GLOBALS, {
    variables: {
      dacId: memoizedSelectedDacId,
    },
    fetchPolicy: 'cache-first',
    skip: !shouldFetch,
    // Uses cache if available, no extra request
    // Fetches fresh data when needed
  })

  const daoGlobals = get(data, 'dao_details.dac_globals', null)

  return { daoGlobals, loading, error, refetch }
}

export { useDaoGlobals }
