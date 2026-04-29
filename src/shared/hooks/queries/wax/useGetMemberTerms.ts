import { useQuery } from '@tanstack/react-query'
import { useEffects } from 'store'

const QUERY_KEY = 'member-terms'

export const useGetMemberTerms = (ipfs: string) => {
  const effects = useEffects()

  return useQuery({
    queryKey: [QUERY_KEY, ipfs],
    queryFn: () => effects.wax.api.getPlanetMemberTermsText(ipfs),
    enabled: !!ipfs,
  })
}
