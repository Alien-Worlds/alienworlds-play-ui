import { useQuery } from '@tanstack/react-query'
import { useSessionStore } from 'shared/store/sessionStore'
import { fetchIpfsText } from 'shared/util/ipfs'

const QUERY_KEY = 'member-terms'

export const useGetMemberTerms = (ipfs: string) =>
  useQuery({
    queryKey: [QUERY_KEY, ipfs],
    // Without a wallet there are no terms to show, as with Overmind's effect.
    queryFn: () => (useSessionStore.getState().walletId ? fetchIpfsText(ipfs) : null),
    enabled: !!ipfs,
  })
