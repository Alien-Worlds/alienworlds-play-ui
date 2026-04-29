import { gql } from '@apollo/client'
import {
  STAKE_DETAILS_FRAGMENT,
  VOTES_FRAGMENT,
  VOTE_WEIGHT_FRAGMENT,
} from 'graphql/queries/fragments/daoWallet'

export const DAO_WALLET_DETAILS_QUERY = gql`
  query dao_wallet_details($dac_id: String!, $wallet: String!) {
    dao_wallet_details(dac_id: $dac_id, wallet: $wallet) {
      agreed_terms_version
      dac_id
      stake_details {
        ...StakeDetailsFragment
      }
      user_status
      vote_weight {
        ...VoteWeightFragment
      }
      votes {
        ...VotesFragment
      }
      wallet
    }
  }
  ${STAKE_DETAILS_FRAGMENT}
  ${VOTE_WEIGHT_FRAGMENT}
  ${VOTES_FRAGMENT}
`
