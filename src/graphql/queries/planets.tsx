import { gql } from '@apollo/client'

export const PLANETS_QUERY = gql`
  query Metadata {
    naron: planet_details(dac_id: "naron") {
      planet_details {
        metadata {
          map_image
          planet_image
          description
        }
        title
        planet_name
        total_stake
      }
      currency_balance
      land_maps {
        x
        y
        asset_id
      }
      mining_pools {
        rarity
        rate
        bucket_total
      }
      planet_mining_details {
        bucket_total
        fill_rate
        last_fill_time
        mine_bucket
      }
    }
    eyeke: planet_details(dac_id: "eyeke") {
      planet_details {
        metadata {
          map_image
          planet_image
          description
        }
        title
        planet_name
        total_stake
      }
      currency_balance
      land_maps {
        x
        y
        asset_id
      }
      mining_pools {
        rarity
        rate
        bucket_total
      }
      planet_mining_details {
        bucket_total
        fill_rate
        last_fill_time
        mine_bucket
      }
    }
    kavian: planet_details(dac_id: "kavian") {
      planet_details {
        metadata {
          map_image
          planet_image
          description
        }
        title
        planet_name
        total_stake
      }
      currency_balance
      land_maps {
        x
        y
        asset_id
      }
      mining_pools {
        rarity
        rate
        bucket_total
      }
      planet_mining_details {
        bucket_total
        fill_rate
        last_fill_time
        mine_bucket
      }
    }
    magor: planet_details(dac_id: "magor") {
      planet_details {
        metadata {
          map_image
          planet_image
          description
        }
        title
        planet_name
        total_stake
      }
      currency_balance
      land_maps {
        x
        y
        asset_id
      }
      mining_pools {
        rarity
        rate
        bucket_total
      }
      planet_mining_details {
        bucket_total
        fill_rate
        last_fill_time
        mine_bucket
      }
    }
    veles: planet_details(dac_id: "veles") {
      planet_details {
        metadata {
          map_image
          planet_image
          description
        }
        title
        planet_name
        total_stake
      }
      currency_balance
      land_maps {
        x
        y
        asset_id
      }
      mining_pools {
        rarity
        rate
        bucket_total
      }
      planet_mining_details {
        bucket_total
        fill_rate
        last_fill_time
        mine_bucket
      }
    }
    nerix: planet_details(dac_id: "nerix") {
      planet_details {
        metadata {
          map_image
          planet_image
          description
        }
        title
        planet_name
        total_stake
      }
      currency_balance
      land_maps {
        x
        y
        asset_id
      }
      mining_pools {
        rarity
        rate
        bucket_total
      }
      planet_mining_details {
        bucket_total
        fill_rate
        last_fill_time
        mine_bucket
      }
    }
  }
`
