import { gql } from '@apollo/client'
import // LAND_COMMS_FRAGMENT,
// MINING_CLAIM_FRAGMENT,
// MINING_DETAILS_FRAGMENT,
// TERMS_FRAGMENT,
// TOKENIZED_LORE_FRAGMENT,
// USER_POINTS_FRAGMENT,
'graphql/queries/fragments/userWallet'

export const WALLET_DETAILS_QUERY_ALL = gql`
  query Mining_claim($wallet: String!) {
    wallet_details(wallet: $wallet) {
      mining_claim {
        amount
        last_claim_time
      }
      land_comms {
        amount
        last_claim_time
      }
      land_ratings_payout
      mining_details {
        last_mine
        last_mine_tx
        current_land
      }
      wallet
      tlm_balance
      stake_tlm_deposit
      tag
      avatar_id
      terms {
        terms_id
        terms_hash
      }
      mining_bag
      userpoints_details {
        milestones
        last_action_time
        top_level
        weekly_points
        daily_points
        redeemable_points
        total_points
      }
      last_shine
      land_ratings_deposit
      tokenized_lore {
        last_claim
        staked_amount
        vote_power
        voter_rewards {
          vp_participating
          reward_per_vp_paid
          rewards_accrued
          pending_rewards
          percent_of_pool
        }
        reward_global {
          reward_per_vp_stored
          tlm_pool_size
          total_vp_participating
        }
      }
    }
  }
`
