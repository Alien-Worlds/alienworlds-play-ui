import { useQuery } from '@apollo/client'
import { WALLET_DETAILS_QUERY_ALL } from 'graphql/queries/walletDetails'
import { get } from 'lodash'

const useWalletDetails = (walletId: string) => {
  const { data, loading, error, refetch } = useQuery(WALLET_DETAILS_QUERY_ALL, {
    variables: {
      wallet: walletId,
    },
    fetchPolicy: 'cache-first',

    // Uses cache if available, no extra request
    // Fetches fresh data when needed
  })

  const walletDetails = get(data, 'wallet_details', null)
  return { walletDetails, loading, error, refetch }
}

export { useWalletDetails }
