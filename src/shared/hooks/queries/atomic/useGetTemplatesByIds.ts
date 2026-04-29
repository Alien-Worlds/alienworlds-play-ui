import { useQuery } from '@tanstack/react-query'
import { useEffects } from 'store'

const GET_TEMPLATES_BY_IDS_QUERY_KEY = 'templates-by-ids'

export const useGetTemplatesByIds = (preparedTemplateIds: string) => {
  const effects = useEffects()

  return useQuery({
    queryKey: [GET_TEMPLATES_BY_IDS_QUERY_KEY, preparedTemplateIds],
    queryFn: () => effects.atomic.api.getTemplatesByIds(preparedTemplateIds),
    enabled: !!preparedTemplateIds,
  })
}
