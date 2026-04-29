import { gql } from '@apollo/client'

export const REQUESTED_APPROVALS_FRAGMENT = gql`
  fragment RequestedApprovalsFragment on Approval {
    actor
    time
  }
`

export const PROVIDED_APPROVALS_FRAGMENT = gql`
  fragment ProvidedApprovalsFragment on Approval {
    actor
    time
  }
`

export const UNPACKED_TRANSACTION_FRAGMENT = gql`
  fragment UnpackedTransactionFragment on UnpackedTransaction {
    expiration
    ref_block_num
    ref_block_prefix
    max_net_usage_words
    max_cpu_usage_ms
    delay_sec
    transaction_extensions
  }
`

export const MSIG_FRAGMENT = gql`
  fragment MsigFragment on Msig {
    id
    proposal_name
    proposer
    packed_transaction
    unpacked {
      ...UnpackedTransactionFragment
    }
    earliest_exec_time
    modified_date
    state
    metadata
    requested_approvals {
      ...RequestedApprovalsFragment
    }
    provided_approvals {
      ...ProvidedApprovalsFragment
    }
  }
`
