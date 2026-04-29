import { gql } from '@apollo/client'

const tournamentFields = `
  id
  admin
  title
  description
  winnings_budget
  winnings_claimed
  winnings_allocated_perc_x_100
  admin_pay_perc_x_100
  shards_budget
  shards_claimed
  shards_allocated_perc_x_100
  start_time
  end_time
  min_players
  max_players
  num_players
  state
  notice
  players {
    player
    reward_perc_x_100
    shards_perc_x_100
    live_score
    claimed
  }
  image
  url
  allow_late_registration
`

export const COMPETITIONS_QUERY = gql`
  query Competitions($player: String) {
    tournaments(player: $player) {
      completed {
        ${tournamentFields}
      }
      getRewards {
        ${tournamentFields}
      }
      live {
        ${tournamentFields}
      }
      processing {
        ${tournamentFields}
      }
      upcoming {
        ${tournamentFields}
      }
    }
  }
`
