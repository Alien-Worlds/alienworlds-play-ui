import { AgnosticRouteObject } from '@remix-run/router'
import { find } from 'lodash'
import { useLocation, matchPath, matchRoutes } from 'react-router-dom'

/**
 * Check if any of the given paths match the current react-router location
 *
 * @param paths paths to match
 * @returns true if any of the paths match the current location
 * @example
 * const isActive = useActivePath([PagePath.Login, PagePaths.Home])
 */
export const useActivePath = (paths: string[]): boolean => {
  const { pathname } = useLocation()

  const match = find(paths, (path) => matchPath(path, pathname))

  return !!match
}

/**
 * Retrieves the current path pattern based on the provided routes and current location.
 *
 * @param {AgnosticRouteObject[]} routes - An array of route objects to match against.
 * @returns {string} The current path or the default location pathname if no match is found.
 */
export const useCurrentPath = (routes: AgnosticRouteObject[]): string => {
  const location = useLocation()

  try {
    const [{ route }] = matchRoutes(routes, location)
    return route.path
  } catch (error) {
    return location.pathname
  }
}
