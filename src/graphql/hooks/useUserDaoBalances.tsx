import { useQuery } from '@apollo/client'
import { USER_DAO_BALANCES } from 'graphql/queries/userDaoBalances'

const useUserDaoBalances = ({ walletId }: { walletId: string }) => {
  const shouldFetch = walletId && walletId.length > 0
  const { data, loading, error, refetch } = useQuery(USER_DAO_BALANCES, {
    variables: {
      wallet: walletId,
    },
    fetchPolicy: 'cache-first',
    skip: !shouldFetch,
    // Uses cache if available, no extra request
    // Fetches fresh data when needed
  })

  const userDaoBalances = data

  return { userDaoBalances, loading, error, refetch }
}

export { useUserDaoBalances }
