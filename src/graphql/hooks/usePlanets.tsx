import { useQuery } from '@apollo/client'
import { PLANETS_QUERY } from 'graphql/queries/planets'
import { PlanetsResponse } from 'graphql/types'
import { map, pick, split } from 'lodash'
import { config } from 'shared/util/config'

const usePlanets = () => {
  const { data, loading, error, refetch } = useQuery(PLANETS_QUERY, {
    // Uses cache if available, no extra request
    // Fetches fresh data when needed
    fetchPolicy: 'cache-first',
    nextFetchPolicy: 'cache-and-network',
  })

  const planets: PlanetsResponse = data
  const activePlanetIds = split(config.ActivePlanetIds, ',')

  const filteredPlanets = map(pick(planets, activePlanetIds), (planet, id) => ({
    id,
    ...planet,
  }))
  return { planets, filteredPlanets, loading, error, refetch }
}

export { usePlanets }
