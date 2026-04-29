import { gql } from '@apollo/client'

// export const DAO_DETAILS_QUERY = gql`
//   query DAODetails(
//     $dac_id: String!
//     $custodiansSortBy: CustodianSortBy
//     $candidatesSortBy: CustodianSortBy
//     $candidateSortReverse: Boolean
//     $formatted: Boolean
//     $daoStakesFormatted2: Boolean
//     $custodiansReverse2: Boolean
//     $dacId: String
//     $limit: Int
//     $sortBy: MSIGSortBy
//     $reverse: Boolean
//   ) {
//     daoDetails(dac_id: $dac_id) {
//       custodians(sort_by: $custodiansSortBy, reverse: $custodiansReverse2) {
//         cust_name
//         rank
//         number_voters
//         total_vote_power
//         avg_vote_time_stamp
//         profile {
//           description
//           email
//           familyName
//           gender
//           givenName
//           image
//           timezone
//           url
//         }
//       }
//       candidates(sort_by: $candidatesSortBy, reverse: $candidateSortReverse) {
//         rank
//         candidate_name
//         avg_vote_time_stamp
//         running_weight_time
//         is_active
//         number_voters
//         total_vote_power
//         profile {
//           description
//           email
//           familyName
//           gender
//           givenName
//           image
//           timezone
//           url
//         }
//       }
//       dac_globals {
//         auth_threshold_high
//         auth_threshold_mid
//         auth_threshold_low
//         lastclaimbudgettime
//         lockup_release_time_delay
//         lockupasset {
//           contract
//           quantity
//         }
//         lastperiodtime
//         initial_vote_quorum_percent
//         maxvotes
//       }
//       member_terms
//       time_multiplier
//       tlm_balances {
//         account
//         balance
//         use
//       }
//       min_stake_time
//       max_stake_time
//       title
//       symbol {
//         contract
//         sym
//       }
//       refs {
//         planetImage
//         description
//         mapImage
//       }
//       supply
//       max_supply
//       dac_id
//       dac_state
//       msigs(sort_by: proposer, limit: 2, reverse: false) {
//         id
//         proposal_name
//         proposer
//         earliest_exec_time
//         modified_date
//         state
//         unpacked {
//           expiration
//           actions {
//             account
//             name
//             authorization {
//               actor
//               permission
//             }
//             data
//           }
//         }
//         metadata
//         provided_approvals {
//           actor
//         }
//         requested_approvals {
//           actor
//         }
//       }
//     }
//     daoStakesStructured(formatted: $formatted) {
//       daoWeights {
//         eyeke
//         kavian
//         nerix
//         naron
//         magor
//         veles
//         eyekeunn
//         kavianunn
//         magorunn
//         naronunn
//         neriunn
//         velesunn
//       }
//       unionTotal
//       syndicateTotal
//       grandTotal
//     }
//     daoStakes(formatted: $daoStakesFormatted2)
//     msigs(dac_id: $dacId, limit: $limit, sort_by: $sortBy, reverse: $reverse) {
//       state
//       proposer
//       id
//       earliest_exec_time
//       proposal_name
//       modified_date
//       requested_approvals {
//         actor
//         time
//       }
//       provided_approvals {
//         actor
//         time
//       }
//       metadata
//       packed_transaction
//       unpacked {
//         delay_sec
//         expiration
//       }
//     }
//   }
// `

export const DAO_DETAILS_QUERY = gql`
  query Query(
    $dacId: String!
    $sortBy: CustodianSortBy
    $activeCandidates: Boolean
    $reverse: Boolean
    $custodiansSortBy2: CustodianSortBy
    $custodiansReverse2: Boolean
    $limit: Int
    $msigsLimit2: Int
    $msigsSortBy2: MSIGSortBy
    $msigsReverse2: Boolean
  ) {
    daoDetails(dac_id: $dacId) {
      dac_id
      title
      symbol {
        sym
        contract
      }
      dac_state
      refs {
        planetImage
        description
        mapImage
      }
      dac_globals {
        auth_threshold_high
        auth_threshold_low
        auth_threshold_mid
        budget_percentage
        initial_vote_quorum_percent
        lastclaimbudgettime
        lastperiodtime
        lockup_release_time_delay
        lockupasset {
          quantity
          contract
        }
      }
      candidates(sort_by: $sortBy, activeCandidates: $activeCandidates, reverse: $reverse) {
        candidate_name
        rank
        total_vote_power
        is_active
        number_voters
        avg_vote_time_stamp
        running_weight_time
        profile {
          description
          email
          familyName
          gender
          givenName
          image
          timezone
          url
        }
      }
      custodians(sort_by: $custodiansSortBy2, reverse: $custodiansReverse2, limit: $limit) {
        cust_name
        rank
        total_vote_power
        number_voters
        avg_vote_time_stamp
        profile {
          description
          email
          familyName
          gender
          givenName
          image
          timezone
          url
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
      msigs(limit: $msigsLimit2, sort_by: $msigsSortBy2, reverse: $msigsReverse2) {
        id
        proposal_name
        proposer
        earliest_exec_time
        modified_date
        state
        provided_approvals {
          actor
          time
        }
        requested_approvals {
          actor
          time
        }
      }
    }
  }
`
