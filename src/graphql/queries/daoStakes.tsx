import { gql } from '@apollo/client'

export const DAO_STAKES_QUERY = gql`
  query Query($formatted: Boolean) {
    daoStakes(formatted: $formatted)
  }
`
