//import { extractNumber, getPreviousDate } from 'util/helpers'

import { useQuery } from '@apollo/client'
import { LORES_QUERY } from 'graphql/queries/loreProposals'
import { cloneDeep, get } from 'lodash'
import { extractNumber, getPreviousDate } from 'shared/util/helpers'

const useLores = () => {
  const { data, loading, error, refetch } = useQuery(LORES_QUERY, {
    fetchPolicy: 'cache-first',
  })

  let lores = get(data, 'TokeLore', [])

  // Clone the whole lores object to ensure immutability
  let loresClone = cloneDeep(lores)

  // Clone proposals separately
  let proposals = loresClone.proposals || []

  // Modify the proposals if needed
  const numberOfDays = lores.globals && lores.globals.duration / 86400
  for (let i = 0; i < proposals.length; i++) {
    proposals[i].total_yes_votes = extractNumber(proposals[i].total_yes_votes)
    proposals[i].total_no_votes = extractNumber(proposals[i].total_no_votes)
    proposals[i].submitted = getPreviousDate(proposals[i].expires, numberOfDays)
  }

  // Update the proposals in the cloned lores object
  loresClone.proposals = proposals
  return { lores: loresClone, loading, error, refetch }
}

export { useLores }
