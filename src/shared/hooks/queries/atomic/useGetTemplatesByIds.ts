import { useQuery } from '@tanstack/react-query'
import { getTemplatesByIds } from 'shared/util/atomicassets'

const GET_TEMPLATES_BY_IDS_QUERY_KEY = 'templates-by-ids'

/** `preparedTemplateIds` is a comma-separated list of template ids. */
export const useGetTemplatesByIds = (preparedTemplateIds: string) =>
  useQuery({
    queryKey: [GET_TEMPLATES_BY_IDS_QUERY_KEY, preparedTemplateIds],
    queryFn: () => getTemplatesByIds(preparedTemplateIds.split(',')),
    enabled: !!preparedTemplateIds,
  })
