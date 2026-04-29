import { useQuery } from '@apollo/client'
import { PLANET_DETAILS_QUERY } from 'graphql/queries/planetDetails'
import { PlanetDetailsResponse } from 'graphql/types'
import { get } from 'lodash'

const usePlanetDetail = (memoizedSelectedDacId: string) => {
  const shouldFetch = memoizedSelectedDacId && memoizedSelectedDacId.length > 0
  const { data, loading, error, refetch } = useQuery(PLANET_DETAILS_QUERY, {
    variables: {
      dacId: memoizedSelectedDacId,
    },
    fetchPolicy: 'cache-first',
    skip: !shouldFetch,
    // Uses cache if available, no extra request
    // Fetches fresh data when needed
  })

  const planetDetails: PlanetDetailsResponse = get(data, 'planet_details', null)

  return { planetDetails, loading, error, refetch }
}

export { usePlanetDetail }
