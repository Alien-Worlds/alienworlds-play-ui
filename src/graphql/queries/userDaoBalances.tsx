import { gql } from '@apollo/client'

export const USER_DAO_BALANCES = gql`
  query Wallet_details($wallet: String!) {
    naron: dao_wallet_details(dac_id: "naron", wallet: $wallet) {
      stake_details {
        dao_token_balance
        staked_amount
        unstake_total
        available_tlm_in_dao
        staked_delay
        unstakes {
          key
          account
          stake
          release_time
        }
      }
    }
    eyeke: dao_wallet_details(dac_id: "eyeke", wallet: $wallet) {
      stake_details {
        dao_token_balance
        staked_amount
        unstake_total
        available_tlm_in_dao
        staked_delay
        unstakes {
          key
          account
          stake
          release_time
        }
      }
    }
    kavian: dao_wallet_details(dac_id: "kavian", wallet: $wallet) {
      stake_details {
        dao_token_balance
        staked_amount
        unstake_total
        available_tlm_in_dao
        staked_delay
        unstakes {
          key
          account
          stake
          release_time
        }
      }
    }
    neri: dao_wallet_details(dac_id: "nerix", wallet: $wallet) {
      stake_details {
        dao_token_balance
        staked_amount
        unstake_total
        available_tlm_in_dao
        staked_delay
        unstakes {
          key
          account
          stake
          release_time
        }
      }
    }
    magor: dao_wallet_details(dac_id: "magor", wallet: $wallet) {
      stake_details {
        dao_token_balance
        staked_amount
        unstake_total
        available_tlm_in_dao
        staked_delay
        unstakes {
          key
          account
          stake
          release_time
        }
      }
    }
    veles: dao_wallet_details(dac_id: "veles", wallet: $wallet) {
      stake_details {
        dao_token_balance
        staked_amount
        unstake_total
        available_tlm_in_dao
        staked_delay
        unstakes {
          key
          account
          stake
          release_time
        }
      }
    }
    naronunn: dao_wallet_details(dac_id: "naronunn", wallet: $wallet) {
      stake_details {
        dao_token_balance
        staked_amount
        unstake_total
        available_tlm_in_dao
        staked_delay
        unstakes {
          key
          account
          stake
          release_time
        }
      }
    }
    kavianunn: dao_wallet_details(dac_id: "kavianunn", wallet: $wallet) {
      stake_details {
        dao_token_balance
        staked_amount
        unstake_total
        available_tlm_in_dao
        staked_delay
        unstakes {
          key
          account
          stake
          release_time
        }
      }
    }
    magorunn: dao_wallet_details(dac_id: "magorunn", wallet: $wallet) {
      stake_details {
        dao_token_balance
        staked_amount
        unstake_total
        available_tlm_in_dao
        staked_delay
        unstakes {
          key
          account
          stake
          release_time
        }
      }
    }
    velesunn: dao_wallet_details(dac_id: "velesunn", wallet: $wallet) {
      stake_details {
        dao_token_balance
        staked_amount
        unstake_total
        available_tlm_in_dao
        staked_delay
        unstakes {
          key
          account
          stake
          release_time
        }
      }
    }
    neriunn: dao_wallet_details(dac_id: "neriunn", wallet: $wallet) {
      stake_details {
        dao_token_balance
        staked_amount
        unstake_total
        available_tlm_in_dao
        staked_delay
        unstakes {
          key
          account
          stake
          release_time
        }
      }
    }
    eyekeunn: dao_wallet_details(dac_id: "eyekeunn", wallet: $wallet) {
      stake_details {
        dao_token_balance
        staked_amount
        unstake_total
        available_tlm_in_dao
        staked_delay
        unstakes {
          key
          account
          stake
          release_time
        }
      }
    }
  }
`
