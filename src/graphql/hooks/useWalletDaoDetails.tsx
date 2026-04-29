import { useQuery } from '@apollo/client'
import { DAO_WALLET_DETAILS_QUERY } from 'graphql/queries/daoWalletDetails'
import { get } from 'lodash'

const useWalletDaoDetails = ({ walletId, dacId }: { walletId?: string; dacId?: string }) => {
  const shouldFetch = walletId && walletId.length > 0 && dacId && dacId.length > 0
  const { data, loading, error, refetch } = useQuery(DAO_WALLET_DETAILS_QUERY, {
    variables: {
      wallet: walletId,
      dac_id: dacId,
    },
    fetchPolicy: 'cache-first',
    skip: !shouldFetch,
    // Uses cache if available, no extra request
    // Fetches fresh data when needed
  })

  const walletDaoDetails = get(data, 'dao_wallet_details', null)
  return { walletDaoDetails, loading, error, refetch }
}

export { useWalletDaoDetails }
