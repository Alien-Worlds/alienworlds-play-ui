import { useQuery } from '@tanstack/react-query'
import {
  ArenaCategoriesResponseType,
  ArenaPortalItemResponseType,
} from 'features/arena/pages/Arena'
import { sortBy } from 'lodash'
import { config } from 'shared/util/config'
const ARENA_PORTAL_QUERY_KEY = 'arena-portal'
const ARENA_CATEGORIES_QUERY_KEY = 'arena-categories'

/** Strapi v4 defaults to pageSize 25; append a higher limit so new entries beyond the first page appear. */
const withStrapiPagination = (baseUrl: string, pageSize = '100') => {
  try {
    const u = new URL(baseUrl)
    if (!u.searchParams.has('pagination[pageSize]')) {
      u.searchParams.set('pagination[pageSize]', pageSize)
    }
    return u.toString()
  } catch {
    return baseUrl
  }
}

export const useArenaPortal = () => {
  return useQuery({
    queryKey: [ARENA_PORTAL_QUERY_KEY],
    queryFn: async () => {
      try {
        if (!config.ArenaPortalApiUrl) {
          throw new Error('Error loading arena portal items')
        }
        const arenaRequestUrl = withStrapiPagination(config.ArenaPortalApiUrl)
        const result = await fetch(arenaRequestUrl, {
          headers: { Authorization: `Bearer ${config.CMSApiToken}` },
        })

        const parsedRes = await result.json()

        return sortBy(parsedRes?.data, ['attributes.sortOrder']) as ArenaPortalItemResponseType[]
      } catch (e) {
        throw new Error('Error loading arena portal items')
      }
    },
  })
}
export const useArenaCategories = () => {
  return useQuery({
    queryKey: [ARENA_CATEGORIES_QUERY_KEY],
    queryFn: async () => {
      try {
        if (!config.ArenaCategoriesApiUrl) {
          throw new Error('Error loading arena portal categories')
        }
        const result = await fetch(withStrapiPagination(config.ArenaCategoriesApiUrl), {
          headers: { Authorization: `Bearer ${config.CMSApiToken}` },
        })

        const parsedRes = await result.json()
        return parsedRes?.data as ArenaCategoriesResponseType[]
      } catch (e) {
        throw new Error('Error loading arena portal categories')
      }
    },
  })
}
