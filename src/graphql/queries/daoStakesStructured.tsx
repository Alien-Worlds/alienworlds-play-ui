import { gql } from '@apollo/client'

export const DAO_STAKES_STRUCTURED_QUERY = gql`
 daoStakesStructured(formatted: $formatted) {
    daoWeights {
      eyeke
      kavian
      nerix
      naron
      magor
      veles
      eyekeunn
      kavianunn
      magorunn
      naronunn
      neriunn
      velesunn
    }
    unionTotal
    syndicateTotal
    grandTotal
  }
`
