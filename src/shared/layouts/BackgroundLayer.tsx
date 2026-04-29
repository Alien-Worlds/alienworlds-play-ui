import { useEffect, useState, VFC } from 'react'

import { Box } from '@chakra-ui/react'
import { css } from '@emotion/react'
import { AgnosticRouteObject } from '@remix-run/router'
import { useAccountCenter, useConnectWallet, useSetChain, useWallets } from '@web3-onboard/react'
import { LoadingSpinner } from 'features/syndicates/components/LoadingSpinner'
import { AnimatePresence, motion } from 'framer-motion'
import { useDaoDetails } from 'graphql/hooks/useDaoDetails'
import { DaoDetailsResponse } from 'graphql/types'
import { includes } from 'lodash'
import { useLocation } from 'react-router-dom'
import { useCurrentPath } from 'shared/hooks/useRouter'
import { config } from 'shared/util/config'
import { dacList } from 'shared/util/helpers'
import { isMissionsRelatedPage } from 'shared/util/router'
import { useAppState } from 'store'
import { PagePath } from 'store/main/types'
import { MissionType } from 'store/missions/types'

const MotionBox = motion(Box)

const getMiningGameImage = (page: string, planetId: string): string | null => {
  if (!planetId) return null

  return `alienworlds-planet-bg-${planetId}-details.jpg`
}

const getGovernanceImage = (page: string, selectedDac: DaoDetailsResponse): string | null => {
  const imageSuffixMapping = {
    [PagePath.GovernanceSelect]: 'select',
    [PagePath.GovernanceDetails]: 'details',
    [PagePath.DAOSelect]: 'details',
    [PagePath.GovernanceCustodianDashboard]: 'candidates',

    [PagePath.GovernanceBecomeCandidate]: 'candidates',
    [PagePath.GovernanceSignCandidateVote]: 'candidates',
    [PagePath.GovernanceManageCandidacy]: 'candidates',
    [PagePath.GovernanceCandidates]: 'candidates',
    [PagePath.GovernanceMemberTerms]: 'candidates',
    [PagePath.GovernanceCandidateProfile]: 'candidates',
  }

  const planetWithImage = [
    dacList.eye,
    dacList.mag,
    dacList.kav,
    dacList.nar,
    dacList.ner,
    dacList.vel,
  ]

  if (!selectedDac) return null

  if (selectedDac && !includes(planetWithImage, selectedDac.dac_id)) {
    return 'alienworlds-db-bg-governance.jpg'
  }

  return `alienworlds-planet-bg-${selectedDac.dac_id}-${imageSuffixMapping[page]}.jpg`
}

// Redundant declaration for now, but this is to avoid too many changes in the codebase
// We can remove this once we have a better solution for the background layer with new router implementation
const pathsWithBackgroundImage: AgnosticRouteObject[] = [
  { path: PagePath.Tools },
  { path: PagePath.Land },
  { path: PagePath.Planet },
  { path: PagePath.MiningLeaderboard },
  { path: PagePath.MiningLeaderboardProfile },
  { path: PagePath.ProfileInfo },
  { path: PagePath.ProfileBalances },
  { path: PagePath.Outpost },
  { path: PagePath.GovernanceSelect },
  { path: PagePath.GovernanceDetails },
  { path: PagePath.DAOSelect },
  { path: PagePath.GovernanceBecomeCandidate },
  { path: PagePath.GovernanceSignCandidateVote },
  { path: PagePath.GovernanceManageCandidacy },
  { path: PagePath.GovernanceCandidates },
  { path: PagePath.GovernanceMemberTerms },
  { path: PagePath.GovernanceCustodianDashboard },
  { path: PagePath.GovernanceCandidateProfile },
  { path: PagePath.Missions },
  { path: PagePath.MissionsExplorer },
  { path: PagePath.MissionDetails },
  { path: PagePath.MissionJoin },
  { path: PagePath.MissionsInventory },
  { path: PagePath.Home },
  { path: PagePath.SignUp },
  { path: PagePath.NewsletterJoin },
]

const BackgroundImage: VFC = () => {
  const connectedWallets = useWallets()
  const [image, setImage] = useState('')
  const [{ connectedChain }] = useSetChain()
  const updateAccountCenter = useAccountCenter()
  const [{ wallet }, connect] = useConnectWallet()
  const {
    wax: { isLoggedIn, selectedDacId, whereToMine, whereToMineIntent, planetSelectedForMining },
    missions: { selectedMission },
  } = useAppState()

  const [opacityOverride, setOpacityOverride] = useState(1)
  const { pathname } = useLocation()

  const { daoDetails, loading }: { daoDetails: DaoDetailsResponse; loading: boolean } =
    useDaoDetails(selectedDacId)
  // Return the path Pattern of the pathname
  // since the switch case checks for the pathPattern
  const pathPattern = useCurrentPath(pathsWithBackgroundImage)

  useEffect(() => {
    const isMissionsPage = isMissionsRelatedPage(pathname)
    if (connectedWallets.length > 0) updateAccountCenter({ enabled: isMissionsPage })
  }, [connectedWallets, connect, wallet, pathname])

  const getImageFilename = (page: string) => {
    switch (page) {
      case PagePath.Tools:
        return getMiningGameImage(page, planetSelectedForMining)

      case PagePath.Land:
      case PagePath.Planet:
        return getMiningGameImage(page, whereToMineIntent || whereToMine)
      case PagePath.DAOSelect:
        return getGovernanceImage(page, daoDetails)
      case PagePath.Inventory:
        return 'alienworlds-ui-inventory-bg.jpg'
      case PagePath.Shining:
        return 'alienworlds-ui-shining-bg.jpg'
      case PagePath.MiningLeaderboard:
      case PagePath.MiningLeaderboardProfile:
        return 'alienworlds-ui-mining-leaderboard-bg.jpg'
      case PagePath.ProfileInfo:
        return 'alienworlds-ui-profile_bg_profile.jpg'
      case PagePath.ProfileBalances:
        return 'alienworlds-ui-profile_bg_balances.jpg'
      case PagePath.Outpost:
        return 'alienworlds-ui-profile_bg_outpost.jpg'
      case PagePath.ArenaPortal:
        return 'alienworlds-ui-arena-bg-2.png'
      case PagePath.Competitions:
        return 'alienworlds-ui-tournaments-bg.jpeg'

      case PagePath.GovernanceSelect:
      case PagePath.GovernanceDetails:
      case PagePath.GovernanceBecomeCandidate:
      case PagePath.GovernanceSignCandidateVote:
      case PagePath.GovernanceManageCandidacy:
      case PagePath.GovernanceCandidates:
      case PagePath.GovernanceMemberTerms:
      case PagePath.GovernanceCustodianDashboard:
      case PagePath.GovernanceCandidateProfile:
        return getGovernanceImage(page, daoDetails)
      case PagePath.Missions:
      case PagePath.MissionsExplorer:
      case PagePath.MissionDetails:
      case PagePath.MissionJoin:
      case PagePath.MissionsInventory:
        if (
          connectedWallets.length > 0 &&
          connectedChain &&
          parseInt(connectedChain.id, 16) !== config.BscChainId
        ) {
          return 'alienworlds-ui-missions-bg-login.jpg'
        }

        if (page === PagePath.MissionsExplorer) {
          return 'alienworlds-ui-missions-bg-mymissions.jpg'
        }

        if (page === PagePath.MissionsInventory) {
          return 'alienworlds-ui-missions-bg-inventory.jpg'
        }

        if (page === PagePath.Missions) {
          return 'alienworlds-ui-missions-bg-centre.jpg'
        }

        if (selectedMission) {
          switch (selectedMission.attributes.missionType) {
            case MissionType.Artifact:
              return 'alienworlds-ui-missions-bg-artifacts.jpg'
            case MissionType.Battle:
              return 'alienworlds-ui-missions-bg-battle.jpg'
            case MissionType.Courier:
              return 'alienworlds-ui-missions-bg-courier.jpg'
            case MissionType.Explore:
              return 'alienworlds-ui-missions-bg-explore.jpg'
            case MissionType.Liberation:
              return 'alienworlds-ui-missions-bg-liberation.jpg'
            case MissionType.Recovery:
              return 'alienworlds-ui-missions-bg-recovery.jpg'
            case MissionType.Scouting:
              return 'alienworlds-ui-missions-bg-scouting.jpg'
            case MissionType.Supply:
              return 'alienworlds-ui-missions-bg-supply.jpg'
            default:
              return 'alienworlds-ui-missions-bg-centre.jpg'
          }
        }

        return 'alienworlds-ui-missions-bg-centre.jpg'
      case PagePath.NewsletterJoin:
        return 'bg-newsletter.jpg'
      case PagePath.SignUp:
      case PagePath.Home:
        return 'bg-landing.jpg'
      default:
        return isLoggedIn ? 'bg-home.jpg' : 'bg-landing.jpg'
    }
  }

  useEffect(() => {
    const filename = getImageFilename(pathPattern)
    if (filename) {
      setImage(filename)
    }

    switch (pathPattern) {
      case PagePath.ArenaPortal:
        setOpacityOverride(1)
        break
      case PagePath.Tools:
      case PagePath.Planet:
      case PagePath.Land:
        setOpacityOverride(0.4)
        break
      default:
        setOpacityOverride(1)
        break
    }
  }, [pathPattern, selectedMission, daoDetails, isLoggedIn, whereToMineIntent])

  if (loading) return <LoadingSpinner />
  return (
    <Box position="absolute" inset={0} width="100%" height="100%" zIndex={0}>
      <AnimatePresence>
        <MotionBox
          key={image}
          position="absolute"
          overflow="hidden"
          inset={0}
          pointerEvents="none"
          css={css`
            background-image: url(/images/bg/${image});
            background-repeat: no-repeat;
            background-size: cover;
            height: 100vh;
            width: 100vw;
          `}
          initial={{ opacity: 0, translateY: 250, scale: 1.5 }}
          animate={{
            opacity: opacityOverride,
            translateY: 0,
            scale: 1,
            transition: { delay: 0.1, duration: 1.5 },
          }}
          exit={{ opacity: 0, transition: { duration: 1.5 } }}
        />
      </AnimatePresence>
    </Box>
  )
}

const BackgroundLayer: VFC = () => {
  return (
    <Box position="fixed" zIndex={-100} inset={0} width="100vw" height="100vh">
      <BackgroundImage />
      <Box
        position="absolute"
        h="100vh"
        w="100vw"
        inset={0}
        bg="linear-gradient(45deg, rgba(17,17,17,1) 0%,rgba(17,17,17,0) 100%)"
        zIndex={1}
      />
    </Box>
  )
}

export default BackgroundLayer
