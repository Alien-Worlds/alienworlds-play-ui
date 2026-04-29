import { matchRoutes } from 'react-router-dom'
import { PagePath } from 'store/main/types'

/**
 * Utils for router
 * created using utils instead of hooks to use in non-react components
 */

export const isMissionsRelatedPage = (pathname: string): boolean => {
  const matchedRoutes = matchRoutes(
    [
      { path: PagePath.Missions },
      { path: PagePath.MissionDetails },
      { path: PagePath.MissionJoin },
      { path: PagePath.MissionsExplorer },
      { path: PagePath.MissionsInventory },
    ],
    pathname
  )

  return matchedRoutes?.length > 0
}

export const isSyndicatesRelatedPage = (pathname: string) => {
  const matchedRoutes = matchRoutes(
    [
      { path: PagePath.GovernanceSelect },
      { path: PagePath.GovernanceDetails },
      { path: PagePath.GovernanceCandidates },
      { path: PagePath.GovernanceBecomeCandidate },
      { path: PagePath.GovernanceManageCandidacy },
      { path: PagePath.GovernanceCustodianDashboard },
      { path: PagePath.GovernanceMemberTerms },
      { path: PagePath.GovernanceSignCandidateVote },
      { path: PagePath.GovernanceCandidateProfile },
    ],
    pathname
  )

  return matchedRoutes?.length > 0
}
