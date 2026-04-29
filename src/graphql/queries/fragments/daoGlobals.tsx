import { gql } from '@apollo/client'

export const LOCKUP_ASSET_FRAGMENT = gql`
  fragment LockupAssetFragment on LockupAsset {
    quantity
    contract
  }
`

export const REQUESTED_PAY_MAX_FRAGMENT = gql`
  fragment RequestedPayMaxFragment on RequestedPayMax {
    quantity
    contract
  }
`

export const DAC_GLOBALS_FRAGMENT = gql`
  fragment DacGlobalsFragment on DacGlobals {
    auth_threshold_high
    auth_threshold_low
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
    initial_vote_quorum_percent
    budget_percentage
    auth_threshold_mid
    lockupasset {
      ...LockupAssetFragment
    }
    requested_pay_max {
      ...RequestedPayMaxFragment
    }
  }
  ${LOCKUP_ASSET_FRAGMENT}
  ${REQUESTED_PAY_MAX_FRAGMENT}
`
