import { gql } from '@apollo/client'

export const LORES_QUERY = gql`
  query lore_proposals {
    TokeLore {
      proposals {
        proposal_id
        proposer
        type
        status
        title
        total_yes_votes
        total_no_votes
        number_yes_votes
        number_no_votes
        expires
        earliest_exec
        attributes
      }
      globals {
        duration
        fee
        quorum_percent_x100
        pass_percent_x100
        total_staked
        total_unstaking
        total_vote_power
        power_per_day
        last_update
        template_id
      }
    }
  }
`
