import { gql } from '@apollo/client'

export const MSIGS_QUERY = gql`
  query Msigs($dacId: String, $limit: Int, $sortBy: MSIGSortBy, $reverse: Boolean) {
    msigs(dac_id: $dacId, limit: $limit, sort_by: $sortBy, reverse: $reverse) {
      id
      proposal_name
      proposer
      earliest_exec_time
      modified_date
      state
      metadata
      requested_approvals {
        actor
        time
      }
      provided_approvals {
        actor
        time
      }
      unpacked {
        expiration

        max_net_usage_words
        max_cpu_usage_ms
        delay_sec
        context_free_actions {
          account
          name
          authorization {
            actor
            permission
          }
          data
        }
        actions {
          account
          authorization {
            actor
            permission
          }
          name
          data
        }
        transaction_extensions
      }
    }
  }
`
