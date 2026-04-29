import { gql } from '@apollo/client'

export const DAO_REF_QUERY = gql`
  query Refs($dacId: String!) {
    dao_details(dac_id: $dacId) {
      refs {
        planet_image
        description
      }
    }
  }
`
