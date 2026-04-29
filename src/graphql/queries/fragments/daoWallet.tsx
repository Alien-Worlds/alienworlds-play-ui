import { gql } from '@apollo/client'

export const STAKE_DETAILS_FRAGMENT = gql`
  fragment StakeDetailsFragment on StakeDetails {
    available_tlm_in_dao
    dao_token_balance
    staked_amount
    staked_delay
    unstake_total
    unstakes {
      key
      account
      release_time
      stake
    }
  }
`

export const VOTE_WEIGHT_FRAGMENT = gql`
  fragment VoteWeightFragment on VoteWeight {
    quorum
    weight
  }
`

export const VOTES_FRAGMENT = gql`
  fragment VotesFragment on CandidateVotes {
    candidates
    timestamp
    voteCount
  }
`
