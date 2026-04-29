import { Arena } from 'features/arena/pages/Arena'
import { Inventory } from 'features/inventory/pages/Inventory'
import { Leaderboard } from 'features/leaderboard/pages/Leaderboard'
import { Lore } from 'features/lore/pages/Lore'
import { Competitions } from 'features/mining/pages/Competitions'
import { Land } from 'features/mining/pages/Land'
import { LandMgt } from 'features/mining/pages/LandMgt'
import { Mining } from 'features/mining/pages/Mining'
import { Planets } from 'features/mining/pages/Planets'
import { Shining } from 'features/mining/pages/Shining'
import { MissionDetails } from 'features/missions/components/MissionsDetails'
import { MissionJoin } from 'features/missions/pages/MissionJoin'
import { Missions } from 'features/missions/pages/Missions'
import { MissionsInventory } from 'features/missions/pages/MissionsInventory'
import { Home } from 'features/onboarding/pages/Home'
import { Newsletter } from 'features/onboarding/pages/Newsletter'
import { Onboarding } from 'features/onboarding/pages/Onboarding'
import { SignUp } from 'features/onboarding/pages/SignUp'
import { Outpost } from 'features/outpost/pages/Outpost'
import { ProfileBalances } from 'features/profile/pages/ProfileBalances'
import { ProfileInfo } from 'features/profile/pages/ProfileInfo'
import { BecomeCandidate } from 'features/syndicates/pages/BecomeCandidate'
import { CandidateListPage } from 'features/syndicates/pages/CandidateListPage'
import { CustodianDashboard } from 'features/syndicates/pages/CustodianDashboard'
import { DaoSelect } from 'features/syndicates/pages/DaoSelect'
import { ManageCandidacy } from 'features/syndicates/pages/ManageCandidacy'
import { PlanetDetails } from 'features/syndicates/pages/PlanetDetails'
import { PlanetMemberTerms } from 'features/syndicates/pages/PlanetMemberTerms'
import { PlanetSelect } from 'features/syndicates/pages/PlanetSelect'
import { createBrowserRouter, Route, createRoutesFromElements, Navigate } from 'react-router-dom'
import { AdvancedLayout, SimpleLayout } from 'shared/layouts'
import GovernanceLayout from 'shared/layouts/GovernanceLayout'
import { MainLayout } from 'shared/layouts/MainLayout'
import ProfileLayout from 'shared/layouts/ProfileLayout'
import { ErrorFallback, ErrorPage } from 'shared/pages/Error'
import { PagePath } from 'store/main/types'

export const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<MainLayout />} errorElement={<ErrorFallback />}>
      <Route element={<SimpleLayout />}>
        <Route index path="" element={<Home />} />
        <Route path={PagePath.NewsletterJoin} element={<Newsletter />} />
        <Route path={PagePath.SignUp} element={<SignUp />} />
      </Route>

      <Route path={PagePath.Onboarding} element={<SimpleLayout />}>
        <Route path="" element={<Onboarding />} />
        <Route path={PagePath.OnboardingLand} element={<Land />} />
        <Route path={PagePath.OnboardingPlanet} element={<Planets />} />
      </Route>

      {/* Protected Routes */}
      <Route element={<AdvancedLayout />}>
        <Route path={PagePath.Missions} element={<Missions />} />
        <Route path={PagePath.MissionDetails} element={<MissionDetails />} />
        <Route path={PagePath.MissionJoin} element={<MissionJoin />} />
        <Route path={PagePath.MissionsInventory} element={<MissionsInventory />} />
        <Route path={PagePath.MissionsExplorer} element={<Missions />} />

        <Route path={PagePath.Inventory} element={<Inventory />} />
        <Route path={PagePath.Shining} element={<Shining />} />
        <Route path={PagePath.TokenizedLore} element={<Lore />} />
        <Route path={PagePath.Competitions} element={<Competitions />} />
        <Route path={PagePath.ArenaPortal} element={<Arena />} />
        <Route path={PagePath.LandMgtSubpage} element={<LandMgt />} />
        <Route path={PagePath.DAOSelect} element={<DaoSelect />} />
        <Route path={PagePath.Mining}>
          <Route path="" element={<Navigate to={PagePath.Tools} />} />

          <Route path={PagePath.Tools} element={<Mining />} />
          <Route path={PagePath.Planet} element={<Planets />} />
          <Route path={PagePath.Land} element={<Land />} />
          <Route path={PagePath.LandSubpage} element={<LandMgt />} />
          <Route path={PagePath.MiningLeaderboard} element={<Leaderboard />} />
          <Route path={PagePath.MiningLeaderboardProfile} element={<Leaderboard />} />
        </Route>

        <Route path={PagePath.Profile} element={<ProfileLayout />}>
          <Route index path={PagePath.ProfileInfo} element={<ProfileInfo />} />
          <Route path={PagePath.ProfileBalances} element={<ProfileBalances />} />
        </Route>

        <Route path={PagePath.Outpost} element={<Outpost />}></Route>

        <Route element={<GovernanceLayout />}>
          <Route path={PagePath.GovernanceSelect} element={<PlanetSelect />} />

          <Route path={PagePath.GovernanceDetails} element={<PlanetDetails />} />

          <Route path={PagePath.GovernanceSignCandidateVote} element={<CandidateListPage />} />
          <Route path={PagePath.GovernanceBecomeCandidate} element={<BecomeCandidate />} />
          <Route path={PagePath.GovernanceManageCandidacy} element={<ManageCandidacy />} />
          <Route path={PagePath.GovernanceMemberTerms} element={<PlanetMemberTerms />} />
          <Route path={PagePath.GovernanceCustodianDashboard} element={<CustodianDashboard />} />
          <Route path={PagePath.GovernanceCandidateProfile} element={<CandidateListPage />} />
        </Route>
      </Route>

      <Route element={<SimpleLayout />}>
        <Route path="*" element={<ErrorPage />} />
        <Route path={PagePath.Error} element={<ErrorPage />} />
      </Route>
    </Route>
  )
)
