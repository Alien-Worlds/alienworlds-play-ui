import { gql } from '@apollo/client'

export const PLANET_DETAILS_QUERY = gql`
  query Planet_details($dacId: String!) {
    planet_details(dac_id: $dacId) {
      dac_id
      stake_info {
        precision
        dac_symbol
        staked
      }
      currency_balance
      land_maps {
        x
        y
        asset_id
      }
      planet_details {
        active
        dac_symbol
        last_claim
        metadata {
          planet_image
          description
          map_image
        }
        nft_multiplier
        planet_name
        title
        total_stake
      }
      planet_mining_details {
        bucket_total
        fill_rate
        last_fill_time
        mine_bucket
      }
      mining_pools {
        rarity
        rate
        bucket_total
      }
    }
  }
`
