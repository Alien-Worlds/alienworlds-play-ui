import { gql } from '@apollo/client'
import {
  CANDIDATE_FRAGMENT,
  CUSTODIAN_FRAGMENT,
  // MEMBER_TERMS_FRAGMENT,
  // REFS_FRAGMENT,
  // SYMBOL_FRAGMENT,
  // TLM_BALANCES_FRAGMENT,
  //PROFILE_FRAGMENT,
} from 'graphql/queries/fragments/daoDetails'
//import { DAC_GLOBALS_FRAGMENT } from 'graphql/queries/fragments/daoGlobals'

export const DAO_DETAILS_QUERY = gql`
  query Query(
    $dacId: String!
    $sortBy: CustodianSortBy
    $activeCandidates: Boolean
    $reverse: Boolean
    $limit: Int
    $custodiansSortBy2: CustodianSortBy
    $custodiansReverse2: Boolean
    $custodiansLimit2: Int
  ) {
    dao_details(dac_id: $dacId) {
      dac_id
      title
      owner
      symbol {
        sym
        contract
      }
      dac_state
      refs {
        planet_image
        description
        map_image
      }
      candidates(
        sort_by: $sortBy
        activeCandidates: $activeCandidates
        reverse: $reverse
        limit: $limit
      ) {
        total_count
        candidates {
          ...CandidateFragment
        }
      }
      custodians(
        sort_by: $custodiansSortBy2
        reverse: $custodiansReverse2
        limit: $custodiansLimit2
      ) {
        total_count
        custodians {
          ...CustodianFragment
        }
      }
      member_terms {
        version
        terms
      }
      min_stake_time
      max_stake_time
      tlm_balances {
        account
        use
        balance
      }
      supply
      max_supply
      time_multiplier
    }
  }
  ${CANDIDATE_FRAGMENT}
  ${CUSTODIAN_FRAGMENT}
`
export const DAO_DETAILS_DAC_GLOBALS = gql`
  query Query($dacId: String!) {
    dao_details(dac_id: $dacId) {
      dac_globals {
        auth_threshold_high
        auth_threshold_low
        auth_threshold_mid
        budget_percentage
        initial_vote_quorum_percent
        lastclaimbudgettime
        lastperiodtime
        lockup_release_time_delay
        maxvotes
        met_initial_votes_threshold
        number_active_candidates
        numelected
        periodlength
        should_pay_via_service_provider
        token_supply_theshold
        vote_quorum_percent
        lockupasset {
          quantity
          contract
        }
        requested_pay_max {
          quantity
          contract
        }
      }
    }
  }
`
