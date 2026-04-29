import { gql } from '@apollo/client'

export const LAND_COMMS_FRAGMENT = gql`
  fragment LandCommsFragment on Claim {
    amount
    lastClaimTime
  }
`

export const MINING_DETAILS_FRAGMENT = gql`
  fragment MiningDetailsFragment on MiningDetails {
    currentLand
    lastMineTrx
    lastMine
  }
`

export const TERMS_FRAGMENT = gql`
  fragment TermsFragment on AWTerms {
    termsHash
    termsId
  }
`

export const MINING_CLAIM_FRAGMENT = gql`
  fragment MiningClaimFragment on MiningClaim {
    amount
    lastClaimTime
  }
`

export const TOKENIZED_LORE_FRAGMENT = gql`
  fragment TokenizedLoreFragment on TokenizedLore {
    lastClaim
    stakedAmount
    votePower
  }
`

export const USER_POINTS_FRAGMENT = gql`
  fragment UserPointsFragment on UserPointsDetails {
    dailyPoints
    lastActionTime
    milestones
    redeemablePoints
    topLevel
    totalPoints
    weeklyPoints
  }
`
