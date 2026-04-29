import { gql } from '@apollo/client'

export const SYMBOL_FRAGMENT = gql`
  fragment SymbolFragment on Symbol {
    sym
    contract
  }
`

export const REFS_FRAGMENT = gql`
  fragment RefsFragment on Refs {
    planet_image
    description
    map_image
  }
`

export const PROFILE_FRAGMENT = gql`
  fragment ProfileFragment on CandProfile {
    description
    email
    familyName
    gender
    givenName
    image
    timezone
    url
  }
`

export const CANDIDATE_FRAGMENT = gql`
  fragment CandidateFragment on Candidate {
    candidate_name
    rank
    total_vote_power
    is_active
    number_voters
    avg_vote_time_stamp
    running_weight_time
    member_terms_version
    flagged
    profile {
      ...ProfileFragment
    }
  }
  ${PROFILE_FRAGMENT}
`

export const CUSTODIAN_FRAGMENT = gql`
  fragment CustodianFragment on Custodian {
    cust_name
    rank
    total_vote_power
    number_voters
    avg_vote_time_stamp
    profile {
      ...ProfileFragment
    }
  }
  ${PROFILE_FRAGMENT}
`

export const MEMBER_TERMS_FRAGMENT = gql`
  fragment MemberTermsFragment on MemberTerms {
    version
    terms
  }
`

export const TLM_BALANCES_FRAGMENT = gql`
  fragment TlmBalancesFragment on TlmBalance {
    account
    use
    balance
  }
`
