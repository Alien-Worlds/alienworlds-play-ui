import { gql } from '@apollo/client'

export const DAO_TREASURIES_QUERY = gql`
  query Query($formatted: Boolean, $dacIds: [DAC_ID]) {
    daoTreasuries(formatted: $formatted, dac_ids: $dacIds) {
      dac_id
      balances {
        account
        use
        balance
      }
      totals
    }
  }
`
