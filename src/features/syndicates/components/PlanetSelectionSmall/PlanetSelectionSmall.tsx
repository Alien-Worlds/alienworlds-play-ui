import { CandiateIcon, CitizenIcon, CustodianIcon } from '@alien-worlds/icons'
import { Flex, Box, Center, Text, VStack, Tooltip } from '@chakra-ui/react'
import { AgnosticRouteObject } from '@remix-run/router'
import { PlanetImage } from 'features/mining/components/PlanetLand/Components/PlanetImage'
import { LoadingSpinner } from 'features/syndicates/components/LoadingSpinner/LoadingSpinner'
import { useWalletDaoDetails } from 'graphql/hooks/useWalletDaoDetails'
import { DaoWalletDetailsResponse } from 'graphql/types'
import { endsWith, get, map, reject, replace, split, startCase, toNumber } from 'lodash'
import { useNavigate, generatePath } from 'react-router-dom'
import { useCurrentPath } from 'shared/hooks/useRouter'
import { Colors } from 'shared/util/colors'
import { config } from 'shared/util/config'
import {
  convertPlanetIdToName,
  getSyndicatesCurrentPage,
  isUnionDAO,
  unionToPlanetFinder,
} from 'shared/util/helpers'
import { useScreenSize } from 'shared/util/hooks'
import { useAppState, useActions } from 'store'
import { PagePath } from 'store/main/types'
import { DACUserStatusType } from 'store/wax/types'
import { v4 } from 'uuid'

import { Constants } from '../../../../shared/util/constants'

const syndicatesRoutes: AgnosticRouteObject[] = [
  { path: PagePath.GovernanceDetails },
  { path: PagePath.GovernanceCandidates },
  { path: PagePath.GovernanceBecomeCandidate },
  { path: PagePath.GovernanceManageCandidacy },
  { path: PagePath.GovernanceCustodianDashboard },
  { path: PagePath.GovernanceMemberTerms },
  { path: PagePath.GovernanceSignCandidateVote },
  { path: PagePath.GovernanceCandidateProfile },
]

// const PlanetsLoadingSkeleton = ({ size = '60px' }: { size?: string }) => {
//   return (
//     <Flex w="100%" h="175px" minW="200px" alignContent="center" justifyContent="center">
//       <Flex
//         wrap="wrap"
//         rowGap={3}
//         alignContent="center"
//         justifyContent="center"
//         columnGap={{ base: 3, md: 7 }}
//       >
//         {Array.from({ length: 6 }, () => (
//           <SkeletonCircle size={size} key={v4()} />
//         ))}
//       </Flex>
//     </Flex>
//   )
// }

const PlanetSelectionSmall = ({
  showBackNavigation,
  size,
}: {
  showBackNavigation?: boolean
  size?: string
}) => {
  const {
    main: { isMainDrawerOpen },
    wax: { walletId, selectedDacId },
  } = useAppState()

  const {
    main: { toggleMainDrawer },
    wax: { setSelectedDacId, collectEvent },
  } = useActions()

  const navigate = useNavigate()
  const { isMobile } = useScreenSize()
  const currentPath = useCurrentPath(syndicatesRoutes)

  const {
    walletDaoDetails,
    loading: walletDaoDetailsLoading,
  }: { walletDaoDetails: DaoWalletDetailsResponse; loading: boolean } = useWalletDaoDetails({
    dacId: selectedDacId,
    walletId,
  })

  const votePower = get(walletDaoDetails, 'vote_weight.weight', 0)

  const planetStakes = toNumber(
    replace(get(walletDaoDetails, 'stake_details.available_tlm_in_dao', '0'), /[^0-9.-]/g, '')
  )
  const userStakedDAOTokens = toNumber(
    replace(get(walletDaoDetails, 'stake_details.staked_amount', '0'), /[^0-9.-]/g, '')
  )
  const loading = walletDaoDetailsLoading
  if (loading) {
    return <LoadingSpinner />
  }
  const getSelectedPlanetBorder = (id) => {
    const selectedPlanetBorder = {
      borderRadius: 'full',
      padding: 1,
      background: Colors.SELECTED_PLANET_GRADIENT,
    }

    if (id === (isUnionDAO(selectedDacId) ? unionToPlanetFinder(selectedDacId) : selectedDacId)) {
      return selectedPlanetBorder
    }
    return { padding: 1 }
  }

  const handleBackToPlanetSelection = () => {
    collectEvent({
      name: Constants.GA_SYNDICATES_CHANGE_PLANET,
      fields: {
        location: getSyndicatesCurrentPage(),
        votePower,
        planet: selectedDacId,
        stakedTokens: userStakedDAOTokens,
        availableTokens: planetStakes[selectedDacId],
      },
    })
    toggleMainDrawer(false)
    navigate(PagePath.GovernanceSelect)
  }

  const handlePlanetClick = (dacId: DaoWalletDetailsResponse['dac_id']) => {
    if (dacId !== selectedDacId) {
      window.scrollTo({ top: 0, behavior: 'auto' })
      setSelectedDacId(dacId)

      if (showBackNavigation) {
        toggleMainDrawer(false)
      }

      if (!isMainDrawerOpen) {
        let pathRedirect = currentPath

        if (currentPath === PagePath.GovernanceCandidateProfile && !isUnionDAO(dacId)) {
          pathRedirect = PagePath.GovernanceSignCandidateVote
        } else {
          pathRedirect = PagePath.DAOSelect
        }

        if (currentPath === PagePath.GovernanceDetails) {
          pathRedirect = PagePath.DAOSelect
        }
        navigate(generatePath(pathRedirect, { planetId: dacId }))
      }
    }
  }
  const planetList = reject(
    split(config.ActiveDacIds, ','),
    (id) => endsWith(id, 'unn') || endsWith(id, 'testa')
  )
  return (
    <Flex w="100%" minW="200px" direction="column" alignContent="center" justifyContent="center">
      <Flex
        wrap="wrap"
        rowGap="10px"
        alignContent="center"
        flexDirection="row"
        columnGap={isMobile ? '30px' : '10px'}
        justifyContent={isMobile ? 'center' : 'center'}
      >
        {map(planetList, (id) => {
          return (
            <Tooltip label={startCase(convertPlanetIdToName(id))} placement="top" key={v4()}>
              <VStack key={v4()}>
                <Box
                  mb="-25px"
                  key={v4()}
                  position="relative"
                  sx={{ ...getSelectedPlanetBorder(id) }}
                >
                  <PlanetImage
                    interactive
                    dacId={id}
                    w={size || '50px'}
                    h={size || '50px'}
                    titleDisplay="none"
                    onClick={() => handlePlanetClick(id)}
                  />
                </Box>
                {selectedDacId === id &&
                startCase(walletDaoDetails.user_status) !== DACUserStatusType.EXPLORER ? (
                  <Box
                    h="27px"
                    w="27px"
                    bg="black"
                    bottom="45px"
                    zIndex={1200}
                    textAlign="center"
                    borderRadius="50px"
                    border="2px solid white"
                  >
                    <Box p="3px" mt="1px">
                      {startCase(walletDaoDetails.user_status) === DACUserStatusType.MEMBER && (
                        <CitizenIcon boxSize="17px" color={Colors.DI_SERRIA} />
                      )}
                      {startCase(walletDaoDetails.user_status) === DACUserStatusType.CANDIDATE && (
                        <CandiateIcon boxSize="17px" color={Colors.DI_SERRIA} />
                      )}
                      {startCase(walletDaoDetails.user_status) === DACUserStatusType.CUSTODIAN && (
                        <CustodianIcon boxSize="17px" color={Colors.DI_SERRIA} />
                      )}
                    </Box>
                  </Box>
                ) : (
                  <Box boxSize="27px" />
                )}
              </VStack>
            </Tooltip>
          )
        })}
      </Flex>

      {showBackNavigation && (
        <Center mt={4}>
          <Text
            fontFamily="tlm"
            color={Colors.JUMBO}
            fontWeight="light"
            fontSize="sm"
            textDecoration="underline"
            cursor="pointer"
            _hover={{ color: Colors.SNOW_WHITE }}
            onClick={() => handleBackToPlanetSelection()}
          >
            Back to Planet Selection
          </Text>
        </Center>
      )}
    </Flex>
  )
}

export { PlanetSelectionSmall }
