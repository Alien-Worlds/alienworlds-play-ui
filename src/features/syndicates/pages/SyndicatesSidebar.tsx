import { useState, useEffect, useMemo, useCallback, memo } from 'react'

import {
  PlanetDetIcon,
  ClaimPlanetTLMIcon,
  ReadConstitionIcon,
  TotalVotePowerIcon,
  TotalVotePowerPlusIcon,
  ViewCandidateIcon,
  ConvertTKNIcon,
  CustodianIcon,
  CandiateIcon,
  CitizenIcon,
  CandidatesIcon,
  HelpIcon,
  GovernanceIcon3,
} from '@alien-worlds/icons'
import { Button, BUTTON_SIZE } from '@alien-worlds/uikit'
import { useApolloClient } from '@apollo/client'
import {
  Box,
  css,
  Divider,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  Flex,
  Hide,
  Text,
  useBreakpoint,
  VStack,
  useBreakpointValue,
} from '@chakra-ui/react'
import { GlossaryInfoIcon } from 'features/glossary/components/GlossaryInfoIcon/GlossaryInfoIcon'
import { TooltipLocations } from 'features/glossary/utils/glossaryConst'
import { PlanetImage } from 'features/mining/components/PlanetLand/Components/PlanetImage'
import { Ellipsis } from 'features/syndicates/components/Ellipsis'
import { PlanetSelectionSmall } from 'features/syndicates/components/PlanetSelectionSmall/PlanetSelectionSmall'
import { useDaoDetails } from 'graphql/hooks/useDaoDetails'
import { useWalletDaoDetails } from 'graphql/hooks/useWalletDaoDetails'
import { DAO_WALLET_DETAILS_QUERY } from 'graphql/queries/daoWalletDetails'
import { USER_DAO_BALANCES } from 'graphql/queries/userDaoBalances'
import {
  Candidate,
  DaoDetailsResponse,
  DaoWalletDetailsResponse,
  UnstakesType,
} from 'graphql/types'
import { capitalize, get, map, some, startCase } from 'lodash'
import { DateTime } from 'luxon'
import { useNavigate } from 'react-router-dom'
import { useActivePath } from 'shared/hooks/useRouter'
import { Colors } from 'shared/util/colors'
import { convertPlanetIdToName, getSyndicatesCurrentPage, isUnionDAO } from 'shared/util/helpers'
import { useScreenSize } from 'shared/util/hooks'
import { PlanetIcon, PlanetIconRGB } from 'shared/util/icons'
import { formatNumber } from 'shared/util/numbers'
import { useAppState, useActions } from 'store'
import { PagePath } from 'store/main/types'
import { DACUserStatusType } from 'store/wax/types'
import { v4 as uuidv4 } from 'uuid'

import { Constants } from '../../../shared/util/constants'

const iconStyle: any = {
  top: 0,
  zIndex: 3,
  position: 'relative',
}

type ResponsiveValuesType = {
  buttonFontSizeSmall: number
  buttonFontSize: number
  drawerVariant: string
  drawerSize: string
  drawerPaddingLeft: number
  buttonIconSize: string
  planetIconSize: string
  votePowerIconSize: string
}

const ResponsiveComponentValues = (currentBreakPoint: string): ResponsiveValuesType => {
  const buttonFontSize = {
    base: 14,
    sm: 14,
    md: 14,
    lg: 14,
    xl: 16,
    '2xl': 16,
  }
  const buttonFontSizeSmall = {
    base: 12,
    sm: 12,
    md: 12,
    lg: 12,
    xl: 14,
    '2xl': 14,
  }
  const drawerVariants = {
    base: null,
    sm: null,
    md: null,
    lg: 'persistent',
    xl: 'persistent',
    '2xl': 'persistent',
  }
  const drawerSizes = {
    base: 'sm',
    sm: 'sm',
    md: 'sm',
    lg: 'md',
    xl: 'md',
    '2xl': 'md',
  }
  const buttonIconSizes = {
    base: '18px',
    sm: '22px',
    md: '22px',
    lg: '22px',
    xl: '22px',
    '2xl': '22px',
  }
  const planetIconSizes = {
    base: 30,
    sm: 30,
    md: 30,
    lg: 44,
    xl: 44,
    '2xl': 44,
  }
  const drawerPaddingsLeft = {
    base: 24,
    sm: 24,
    md: 24,
    lg: 24,
    xl: 24,
    '2xl': 24,
  }

  const votePowerIconSizes = {
    base: '20px',
    sm: '20px',
    md: '20px',
    lg: '30px',
    xl: '30px',
    '2xl': '30px',
  }

  return {
    buttonFontSizeSmall: buttonFontSizeSmall[currentBreakPoint],
    buttonFontSize: buttonFontSize[currentBreakPoint],
    drawerVariant: drawerVariants[currentBreakPoint],
    drawerSize: drawerSizes[currentBreakPoint],
    drawerPaddingLeft: drawerPaddingsLeft[currentBreakPoint],
    buttonIconSize: buttonIconSizes[currentBreakPoint],
    planetIconSize: planetIconSizes[currentBreakPoint],
    votePowerIconSize: votePowerIconSizes[currentBreakPoint],
  }
}

export const SyndicatesSidebar = memo(() => {
  const {
    wax: { walletId, isDemoUser, selectedDacId, isSyndicatesSidebarOpen },
  } = useAppState()
  const client = useApolloClient()
  const {
    wax: {
      getDAOInfo,
      collectEvent,
      tryClaimUnstake,
      tryCancelUnstake,
      setIsSyndicatesSidebarOpen,
    },
    modal: { setPrimaryModalActive, setSecondaryModalActive },
  } = useActions()
  const navigate = useNavigate()
  const currentBreakPoint = useBreakpoint()
  const { isNotDesktop } = useScreenSize()
  const [stakeInfo, setStakeInfo] = useState(null)
  const [isClaimTokensAvailable, setIsClaimTokensAvailable] = useState(false)
  const isManageCandidacyPage = useActivePath([PagePath.GovernanceManageCandidacy])
  const isCustodianDashboardPage = useActivePath([PagePath.GovernanceCustodianDashboard])
  const isBecomeCandidatePage = useActivePath([PagePath.GovernanceBecomeCandidate])

  const getLuxonUtcDateTime = (dateTime: string) => {
    return DateTime.fromISO(dateTime, {
      zone: 'utc',
    })
  }

  const memoizedSelectedDacId = useMemo(() => selectedDacId, [selectedDacId])

  const memoizedIsDemoUser = useMemo(() => isDemoUser, [isDemoUser])

  const memoizedIsSyndicatesSidebarOpen = useMemo(
    () => isSyndicatesSidebarOpen,
    [isSyndicatesSidebarOpen]
  )

  const {
    walletDaoDetails,
    loading: walletDaoDetailsLoading,
  }: { walletDaoDetails: DaoWalletDetailsResponse; loading: boolean } = useWalletDaoDetails({
    dacId: memoizedSelectedDacId,
    walletId,
  })

  const { daoDetails }: { daoDetails: DaoDetailsResponse } = useDaoDetails(memoizedSelectedDacId)
  const candidates: Candidate[] | any[] = get(daoDetails, 'candidates.candidates', [])
  const stakedTLM = get(walletDaoDetails, 'stake_details.staked_amount', '0 NAR')
  const voteDelay = get(walletDaoDetails, 'stake_details.staked_delay', 0) / 86400
  const voteWeight = get(walletDaoDetails, 'vote_weight.weight', 0) / 10000
  const availableTlmInDao = get(walletDaoDetails, 'stake_details.available_tlm_in_dao', '0 VEL')
  const userStatus = startCase(get(walletDaoDetails, 'user_status', 'explorer'))
  const unstakes: UnstakesType[] | [] = get(walletDaoDetails, 'stake_details.unstakes', [])
  const isStakesOnRelease =
    unstakes && unstakes.length > 0 && Date.parse(unstakes[0].release_time) > Date.now()
  const currentButtonSize: keyof typeof BUTTON_SIZE = useBreakpointValue({
    base: 'sm',
    sm: 'sm',
    md: 'md',
    lg: 'lg',
  })
  const buttonSizeX: keyof typeof BUTTON_SIZE = useBreakpointValue({
    base: 'sm',
    sm: 'sm',
    md: 'md',
    lg: 'md',
  })
  const demoTopbarHeight = `${Constants.DEMO_TOPBAR_HEIGHT + 90}px`
  const demoTopbarHeightMobile = `${Constants.DEMO_TOPBAR_HEIGHT_MOBILE + 90}px`

  const drawerTopMargin = useBreakpointValue({
    base: memoizedIsDemoUser ? demoTopbarHeightMobile : 90,
    sm: memoizedIsDemoUser ? demoTopbarHeight : 90,
    md: memoizedIsDemoUser ? demoTopbarHeight : 90,
    lg: memoizedIsDemoUser ? demoTopbarHeight : 90,
    xl: memoizedIsDemoUser ? demoTopbarHeight : 90,
    '2xl': memoizedIsDemoUser ? demoTopbarHeight : 90,
  })
  useEffect(() => {
    if (memoizedSelectedDacId && availableTlmInDao) {
      const newStakeInfo = availableTlmInDao
      if (newStakeInfo !== stakeInfo) {
        getDAOInfo(memoizedSelectedDacId)
        setStakeInfo(newStakeInfo)
      }
    }
  }, [memoizedSelectedDacId, availableTlmInDao, getDAOInfo, stakeInfo])

  const responsiveValues = useMemo(
    () => ResponsiveComponentValues(currentBreakPoint),
    [currentBreakPoint]
  )

  useEffect(() => {
    if (!voteDelay || !unstakes) return

    const isAnyReleaseTimeFound = some(unstakes, (unstake) => {
      const releaseTime = DateTime.fromISO(unstake.release_time)
      const now = DateTime.local()
      return now >= releaseTime
    })

    if (isClaimTokensAvailable !== isAnyReleaseTimeFound) {
      setIsClaimTokensAvailable(isAnyReleaseTimeFound)
    }
  }, [unstakes, voteDelay, isClaimTokensAvailable])

  useEffect(() => {
    if (memoizedIsSyndicatesSidebarOpen !== !isNotDesktop) {
      setIsSyndicatesSidebarOpen(!isNotDesktop)
    }
  }, [isNotDesktop, memoizedIsSyndicatesSidebarOpen, setIsSyndicatesSidebarOpen])

  const handleSyndicateSidebarMenuClick = useCallback(
    (url: string) => {
      navigate(url)
      window.scrollTo({ top: 0, behavior: 'auto' })
      const newSidebarState = isNotDesktop ? false : memoizedIsSyndicatesSidebarOpen
      setIsSyndicatesSidebarOpen(newSidebarState)
    },
    [isNotDesktop, memoizedIsSyndicatesSidebarOpen, navigate, setIsSyndicatesSidebarOpen]
  )

  const [isUnion, setIsUnion] = useState(isUnionDAO(memoizedSelectedDacId))

  useEffect(() => {
    setIsUnion(isUnionDAO(memoizedSelectedDacId))
  }, [memoizedSelectedDacId])

  return (
    <>
      {!memoizedIsSyndicatesSidebarOpen && (
        <Hide below="md">
          <Flex
            right={8}
            cursor="pointer"
            zIndex={1200}
            position="absolute"
            alignItems="center"
            pointerEvents="auto"
            top="0px"
            onClick={() => setIsSyndicatesSidebarOpen(true)}
          >
            <GovernanceIcon3 boxSize={35} style={{ marginRight: '5px' }} />
            <Text
              fontSize="medium"
              fontFamily="Orbitron"
              lineHeight="1.33"
              color={Colors.SNOW_WHITE}
              fontWeight={500}
            >
              Governance
            </Text>
            <Flex flexDirection="column" ml="10px">
              <HelpIcon color={Colors.SNOW_WHITE} boxSize={7} />
              <HelpIcon color={Colors.SNOW_WHITE} boxSize={7} />
              <HelpIcon color={Colors.SNOW_WHITE} boxSize={7} />
            </Flex>
          </Flex>
        </Hide>
      )}

      <Drawer
        placement="right"
        trapFocus={false}
        variant={responsiveValues.drawerVariant}
        blockScrollOnMount={false}
        onClose={() => setIsSyndicatesSidebarOpen(false)}
        isOpen={memoizedIsSyndicatesSidebarOpen}
        size={responsiveValues.drawerSize}
      >
        <DrawerOverlay display={isNotDesktop ? 'block' : 'none'} />

        <DrawerContent
          style={{
            top: drawerTopMargin,
            borderRadius: '35px 0px 0px 35px',
            background: Colors.BLACK_SOLID_90,
            paddingBottom: '20px',
          }}
        >
          <DrawerHeader>
            <Flex onClick={() => setIsSyndicatesSidebarOpen(false)} cursor="pointer">
              <Ellipsis boxSize={11} />
            </Flex>
          </DrawerHeader>

          <DrawerBody
            css={css({
              zIndex: '10000',
              scrollbarWidth: 'none',
              paddingLeft: responsiveValues.drawerPaddingLeft,
              overflowY: 'scroll',
              '::-webkit-scrollbar': { display: 'none' },
              overflowScrolling: 'touch',
              boxShadow: 'inset 0 -2px 0 rgba(0, 0, 0, 0.1)',
            })}
          >
            <Flex flexDirection="column" background="transparent">
              <Flex width="100%" cursor="pointer" mb="-25px">
                {memoizedIsSyndicatesSidebarOpen && (
                  <Flex width="100%" gap={4}>
                    <Flex flexDirection="column">
                      <PlanetImage
                        width="61px"
                        height="61px"
                        onClick={() => {}}
                        titleDisplay="none"
                        dacId={selectedDacId}
                      />

                      {userStatus !== DACUserStatusType.NONE && !walletDaoDetailsLoading ? (
                        <Box
                          h="31"
                          w="31px"
                          mt="-20px"
                          bg="black"
                          zIndex={1200}
                          textAlign="center"
                          borderRadius="50px"
                          border="2px solid white"
                        >
                          <Box p="3px" mt="1px">
                            {userStatus === DACUserStatusType.MEMBER && (
                              <CitizenIcon boxSize="21px" color={Colors.DI_SERRIA} />
                            )}
                            {userStatus === DACUserStatusType.CANDIDATE && (
                              <CandiateIcon boxSize="21px" color={Colors.DI_SERRIA} />
                            )}
                            {userStatus === DACUserStatusType.CUSTODIAN && (
                              <CustodianIcon boxSize="21px" color={Colors.DI_SERRIA} />
                            )}
                          </Box>
                        </Box>
                      ) : (
                        <Box h="31" w="31px" mt="-20px" />
                      )}
                    </Flex>
                    <Flex flexDirection="column" justifyContent="center">
                      <Text
                        color={Colors.SNOW_WHITE}
                        lineHeight="1.33"
                        fontSize={{ base: 'lg', lg: 'xl' }}
                        fontFamily="Orbitron"
                      >
                        Governance
                      </Text>

                      <Text
                        fontSize={{ base: 'md', lg: 'lg' }}
                        lineHeight="1.33"
                        color={Colors.DI_SERRIA}
                        fontFamily="Titillium Web"
                      >
                        {userStatus === 'None' ? 'Visitor' : userStatus}
                      </Text>
                    </Flex>
                  </Flex>
                )}
              </Flex>

              <Box paddingBlock="50px" position="relative">
                <Box
                  top={0}
                  left={0}
                  w="full"
                  zIndex={-10}
                  height="75%"
                  opacity={0.9}
                  position="absolute"
                />

                <Box w="full" maxW="310px" mx="auto" position="relative">
                  <VStack spacing={4} alignItems="start">
                    <Button
                      variant="hydrogen"
                      fontFamily="Titillium Web"
                      leftIcon={
                        <Flex ml="-15px">
                          <PlanetDetIcon
                            color={Colors.DI_SERRIA}
                            boxSize={responsiveValues.buttonIconSize}
                          />
                        </Flex>
                      }
                      size={currentButtonSize}
                      _hover={
                        useActivePath([PagePath.GovernanceDetails]) && {
                          bg: 'white',
                          color: 'black',
                        }
                      }
                      fontWeight={400}
                      fontSize={responsiveValues.buttonFontSize}
                      isActive={useActivePath([PagePath.GovernanceDetails])}
                      onClick={() => {
                        handleSyndicateSidebarMenuClick(
                          `${PagePath.GovernanceSelect}/${selectedDacId}`
                        )
                      }}
                      iconHoverColor={Colors.DI_SERRIA}
                    >
                      {isUnion ? 'Union' : 'Planet'} Details
                    </Button>
                    <Button
                      size={currentButtonSize}
                      _hover={
                        useActivePath([
                          PagePath.GovernanceSignCandidateVote,
                          PagePath.GovernanceCandidateProfile,
                        ]) && {
                          bg: 'white',
                          color: 'black',
                        }
                      }
                      fontSize={responsiveValues.buttonFontSize}
                      fontWeight={400}
                      variant="hydrogen"
                      fontFamily="Titillium Web"
                      isActive={useActivePath([
                        PagePath.GovernanceSignCandidateVote,
                        PagePath.GovernanceCandidateProfile,
                      ])}
                      leftIcon={
                        <Flex ml="-15px">
                          <CandidatesIcon
                            color={Colors.DI_SERRIA}
                            boxSize={responsiveValues.buttonIconSize}
                          />
                        </Flex>
                      }
                      onClick={() => {
                        handleSyndicateSidebarMenuClick(
                          `${PagePath.GovernanceSelect}/${selectedDacId}/signcandidatevote`
                        )
                      }}
                      iconHoverColor={Colors.DI_SERRIA}
                    >
                      View Candidates
                    </Button>

                    <Button
                      size={currentButtonSize}
                      _hover={
                        useActivePath([PagePath.GovernanceMemberTerms]) && {
                          bg: 'white',
                          color: 'black',
                        }
                      }
                      fontSize={responsiveValues.buttonFontSize}
                      fontWeight={400}
                      variant="hydrogen"
                      fontFamily="Titillium Web"
                      isActive={useActivePath([PagePath.GovernanceMemberTerms])}
                      leftIcon={
                        <Flex ml="-15px">
                          <ReadConstitionIcon
                            color={Colors.DI_SERRIA}
                            boxSize={responsiveValues.buttonIconSize}
                          />
                        </Flex>
                      }
                      onClick={() => {
                        handleSyndicateSidebarMenuClick(
                          `${PagePath.GovernanceSelect}/${selectedDacId}/memberTerms`
                        )
                      }}
                      iconHoverColor={Colors.DI_SERRIA}
                    >
                      Read Member Terms
                    </Button>

                    {userStatus === DACUserStatusType.MEMBER ||
                    userStatus === DACUserStatusType.EXPLORER ||
                    userStatus === DACUserStatusType.NONE ? (
                      <Button
                        size={currentButtonSize}
                        _hover={
                          isBecomeCandidatePage && {
                            bg: 'white',
                            color: 'black',
                          }
                        }
                        fontSize={responsiveValues.buttonFontSize}
                        fontWeight={400}
                        variant="hydrogen"
                        fontFamily="Titillium Web"
                        isDisabled={!candidates || candidates.length === 0}
                        isActive={isBecomeCandidatePage}
                        leftIcon={
                          <Flex ml="-15px">
                            <ViewCandidateIcon
                              color={Colors.DI_SERRIA}
                              boxSize={responsiveValues.buttonIconSize}
                            />
                          </Flex>
                        }
                        onClick={() => {
                          handleSyndicateSidebarMenuClick(
                            `${PagePath.GovernanceSelect}/${selectedDacId}/register`
                          )
                        }}
                        iconHoverColor={Colors.DI_SERRIA}
                      >
                        Become a Candidate
                      </Button>
                    ) : (
                      <Button
                        size={currentButtonSize}
                        _hover={
                          isManageCandidacyPage && {
                            bg: 'white',
                            color: 'black',
                          }
                        }
                        fontSize={responsiveValues.buttonFontSize}
                        fontWeight={400}
                        variant="hydrogen"
                        fontFamily="Titillium Web"
                        isActive={isManageCandidacyPage}
                        leftIcon={
                          <Flex ml="-15px">
                            <ViewCandidateIcon
                              color={Colors.DI_SERRIA}
                              boxSize={responsiveValues.buttonIconSize}
                            />
                          </Flex>
                        }
                        onClick={() => {
                          handleSyndicateSidebarMenuClick(
                            `${PagePath.GovernanceSelect}/${selectedDacId}/manage`
                          )
                        }}
                        iconHoverColor={Colors.DI_SERRIA}
                      >
                        Manage Candidacy
                      </Button>
                    )}

                    {userStatus === DACUserStatusType.CUSTODIAN && (
                      <Button
                        size={currentButtonSize}
                        _hover={
                          isCustodianDashboardPage && {
                            bg: 'white',
                            color: 'black',
                          }
                        }
                        fontSize={responsiveValues.buttonFontSize}
                        fontWeight={400}
                        variant="hydrogen"
                        fontFamily="Titillium Web"
                        isActive={isCustodianDashboardPage}
                        leftIcon={
                          <Flex ml="-15px">
                            <CustodianIcon
                              color={Colors.DI_SERRIA}
                              boxSize={responsiveValues.buttonIconSize}
                            />
                          </Flex>
                        }
                        onClick={() => {
                          handleSyndicateSidebarMenuClick(
                            `${PagePath.GovernanceSelect}/${selectedDacId}/dashboard`
                          )
                        }}
                      >
                        Custodian Centre
                      </Button>
                    )}

                    <Divider />

                    <Flex justifyContent="start" width="100%">
                      <Box h={{ base: '30px', lg: '42px' }} w={{ base: '30px', lg: '42px' }}>
                        <PlanetIcon
                          planetName={selectedDacId}
                          style={{
                            ...iconStyle,
                            width: responsiveValues.planetIconSize,
                            height: responsiveValues.planetIconSize,
                          }}
                        />
                      </Box>
                      <Flex flexDirection="column" marginLeft="10px">
                        <Flex alignItems="center" gap={1}>
                          <Text
                            fontSize={{ base: 'xs', md: 'small' }}
                            fontFamily="Orbitron"
                            lineHeight="1.33"
                            color={Colors.JUMBO}
                          >
                            Available TLM
                          </Text>
                          <GlossaryInfoIcon
                            width={15}
                            glossaryId={TooltipLocations.GOVERNANCE_SIDEBAR_AVAILABLE_TOKENS}
                          />
                        </Flex>
                        <Text
                          color={Colors.SNOW_WHITE}
                          lineHeight="1.33"
                          fontSize={{ base: 'md', md: 'large', lg: 'x-large' }}
                          fontFamily="Orbitron"
                        >
                          {formatNumber(availableTlmInDao, 4, 4)}
                        </Text>
                      </Flex>
                    </Flex>
                    <Flex justifyContent="start" width="100%">
                      <Flex
                        bg={Colors.CARIBBEAN_GREEN}
                        justifyContent="center"
                        alignItems="center"
                        borderRadius="50%"
                        width={{ base: '30px', lg: '40px' }}
                        height={{ base: '30px', lg: '40px' }}
                      >
                        <TotalVotePowerIcon
                          width={responsiveValues.votePowerIconSize}
                          height={responsiveValues.votePowerIconSize}
                          color={Colors.SNOW_WHITE}
                        />
                      </Flex>

                      <Flex flexDirection="column" marginLeft="10px">
                        <Flex alignItems="center" gap={1}>
                          <Text
                            fontSize={{ base: 'xs', md: 'small' }}
                            fontFamily="Orbitron"
                            lineHeight="1.33"
                            color={Colors.JUMBO}
                          >
                            Vote Power
                          </Text>
                          <GlossaryInfoIcon
                            width={15}
                            glossaryId={TooltipLocations.GOVERNANCE_CANDIDATE_VOTING_POWER}
                          />
                        </Flex>
                        <Text
                          lineHeight="1.33"
                          fontSize={{ base: 'md', md: 'large', lg: 'x-large' }}
                          fontFamily="Orbitron"
                          color={Colors.CARIBBEAN_GREEN}
                        >
                          {formatNumber(voteWeight, 4, 4)}
                        </Text>
                        <Text
                          color={Colors.SNOW_WHITE}
                          fontSize={{ base: 'xs', lg: 'small' }}
                          lineHeight="1.33"
                          fontFamily="Orbitron"
                        >
                          {voteDelay} Days
                        </Text>
                      </Flex>
                    </Flex>
                    {voteWeight === 0 && !isStakesOnRelease && (
                      <Button
                        size={buttonSizeX}
                        fontSize={responsiveValues.buttonFontSize}
                        fontWeight={400}
                        letterSpacing="0.1px"
                        fontFamily="Titillium Web"
                        variant="lithium"
                        leftIcon={
                          <Flex ml="-15px">
                            <TotalVotePowerPlusIcon
                              width={responsiveValues.buttonIconSize}
                              height={responsiveValues.buttonIconSize}
                              color={Colors.CARIBBEAN_GREEN}
                            />
                          </Flex>
                        }
                        onClick={() => {
                          if (isDemoUser) {
                            setPrimaryModalActive({ modalName: 'LoginModal', value: true })
                          } else if (parseFloat(stakeInfo) === 0) {
                            setSecondaryModalActive({
                              modalName: 'NotEnoughTokensToVoteModal',
                              value: true,
                            })
                          } else {
                            if (parseFloat(stakeInfo) === 0) {
                              setSecondaryModalActive({
                                modalName: 'NotEnoughTokensToVoteModal',
                                value: true,
                              })
                            } else {
                              setPrimaryModalActive({
                                modalName: 'AddStakingVotePower',
                                value: true,
                              })
                              collectEvent({
                                name: Constants.GA_SYNDICATES_STAKE_VP,
                                fields: {
                                  location: getSyndicatesCurrentPage(),
                                  voteWeight,
                                  planet: selectedDacId,
                                  stakedTokens: stakedTLM,
                                  availableTokens: availableTlmInDao,
                                },
                              })
                            }
                            setPrimaryModalActive({
                              modalName: 'AddStakingVotePower',
                              value: true,
                            })
                            collectEvent({
                              name: Constants.GA_SYNDICATES_STAKE_VP,
                              fields: {
                                location: getSyndicatesCurrentPage(),
                                voteWeight,
                                planet: selectedDacId,
                                stakedTokens: stakedTLM,
                                availableTokens: availableTlmInDao,
                              },
                            })
                          }
                        }}
                      >
                        Add Vote Power
                      </Button>
                    )}
                    {voteWeight > 0 && !isStakesOnRelease && (
                      <Button
                        size={buttonSizeX}
                        variant="lithium"
                        marginRight="-15px"
                        fontSize={responsiveValues.buttonFontSize}
                        fontWeight={400}
                        letterSpacing="0.1px"
                        fontFamily="Titillium Web"
                        leftIcon={
                          <Flex ml="-15px">
                            <TotalVotePowerIcon
                              boxSize={responsiveValues.buttonIconSize}
                              color={Colors.CARIBBEAN_GREEN}
                            />
                          </Flex>
                        }
                        onClick={() => {
                          if (isDemoUser) {
                            setPrimaryModalActive({ modalName: 'LoginModal', value: true })
                          } else {
                            if (parseFloat(stakeInfo) === 0) {
                              setSecondaryModalActive({
                                modalName: 'NotEnoughTokensToVoteModal',
                                value: true,
                              })
                            } else {
                              setPrimaryModalActive({
                                modalName: 'StakingVotePowerWithRelease',
                                value: true,
                              })

                              collectEvent({
                                name: Constants.GA_SYNDICATES_ADD_VP,
                                fields: {
                                  location: getSyndicatesCurrentPage(),
                                  voteWeight,
                                  planet: selectedDacId,
                                  stakedTokens: stakedTLM,
                                  availableTokens: availableTlmInDao,
                                },
                              })
                            }
                          }
                        }}
                      >
                        Stake Vote Power
                      </Button>
                    )}

                    {isStakesOnRelease && (
                      <Button
                        size={buttonSizeX}
                        variant="lithium"
                        marginRight="-15px"
                        fontSize={responsiveValues.buttonFontSize}
                        fontWeight={400}
                        letterSpacing="0.1px"
                        fontFamily="Titillium Web"
                        leftIcon={
                          <Flex ml="-15px">
                            <TotalVotePowerIcon
                              width={responsiveValues.buttonIconSize}
                              height={responsiveValues.buttonIconSize}
                              style={{ marginLeft: '-15px' }}
                              color={Colors.CARIBBEAN_GREEN}
                            />
                          </Flex>
                        }
                        onClick={() => {
                          if (isDemoUser) {
                            setPrimaryModalActive({ modalName: 'LoginModal', value: true })
                          } else {
                            if (parseFloat(stakeInfo) === 0) {
                              setSecondaryModalActive({
                                modalName: 'NotEnoughTokensToVoteModal',
                                value: true,
                              })
                            } else {
                              setPrimaryModalActive({
                                modalName: 'StakingVotePowerWithRelease',
                                value: true,
                              })
                              collectEvent({
                                name: Constants.GA_SYNDICATES_STAKE_VP_RELEASE,
                                fields: {
                                  location: getSyndicatesCurrentPage(),
                                  voteWeight,
                                  planet: selectedDacId,
                                  stakedTokens: stakedTLM,
                                  availableTokens: availableTlmInDao,
                                },
                              })
                            }
                          }
                        }}
                      >
                        Stake with Release Timer
                      </Button>
                    )}

                    {voteWeight > 0 && (
                      <Button
                        size={buttonSizeX}
                        variant="beryllium"
                        marginRight="-15px"
                        fontSize={responsiveValues.buttonFontSize}
                        fontWeight={400}
                        letterSpacing="0.1px"
                        fontFamily="Titillium Web"
                        onClick={() => {
                          if (isDemoUser) {
                            setPrimaryModalActive({ modalName: 'LoginModal', value: true })
                          } else {
                            setPrimaryModalActive({ modalName: 'UnstakingVotePower', value: true })

                            collectEvent({
                              name: Constants.GA_SYNDICATES_UNSTAKE_VP,
                              fields: {
                                location: getSyndicatesCurrentPage(),
                                voteWeight,
                                planet: selectedDacId,
                                stakedTokens: stakedTLM,
                                availableTokens: availableTlmInDao,
                              },
                            })
                          }
                        }}
                        leftIcon={
                          <Flex ml="-15px">
                            <TotalVotePowerIcon
                              boxSize={responsiveValues.buttonIconSize}
                              color={Colors.RADICAL_RED}
                            />
                          </Flex>
                        }
                      >
                        Unstake Vote Power
                      </Button>
                    )}
                    {/* <Button size="sm" onClick={() => setOverlaysDemo(true)} variant="argon">
                      Overlays
                    </Button> */}
                    <Flex justifyContent="start" width="100%">
                      <Box
                        h={{ base: '30px', lg: '44px' }}
                        w={{ base: '30px', lg: '44px' }}
                        mr="10px"
                        borderRadius="50%"
                        backgroundColor={Colors.RADICAL_RED}
                      >
                        <PlanetIconRGB
                          planetName={selectedDacId}
                          style={{
                            ...iconStyle,
                          }}
                        />
                      </Box>
                      <Flex flexDirection="column">
                        <Flex alignItems="center" gap={1}>
                          <Text
                            fontSize={{ base: 'xs', lg: 'small' }}
                            fontFamily="Orbitron"
                            lineHeight="1.33"
                            color={Colors.JUMBO}
                          >
                            Staked TLM in {capitalize(convertPlanetIdToName(selectedDacId))}
                          </Text>
                          <GlossaryInfoIcon
                            width={15}
                            glossaryId={TooltipLocations.GOVERNANCE_SIDEBAR_STAKED_TOKENS}
                          />
                        </Flex>
                        <Text
                          fontSize={{ base: 'md', md: 'large', lg: 'x-large' }}
                          fontFamily="Orbitron"
                          lineHeight="1.33"
                          color={Colors.RADICAL_RED}
                        >
                          {formatNumber(stakedTLM, 4, 4)}
                        </Text>
                      </Flex>
                    </Flex>
                    {voteDelay && (
                      <Box>
                        {map(unstakes, (unstake, index) => {
                          return (
                            <VStack mb={2} gap={1} key={uuidv4()}>
                              <Flex justifyContent="start" w="100%">
                                <Box
                                  h={{ base: '30px', lg: '44px' }}
                                  w={{ base: '30px', lg: '44px' }}
                                  mr="10px"
                                  borderRadius="50%"
                                  backgroundColor={Colors.RADICAL_RED}
                                >
                                  <ClaimPlanetTLMIcon
                                    style={{
                                      marginRight: '10px',
                                      borderRadius: '100%',
                                      borderColor: Colors.RADICAL_RED,
                                    }}
                                    width={responsiveValues.planetIconSize}
                                    height={responsiveValues.planetIconSize}
                                    color={Colors.SNOW_WHITE}
                                  />
                                </Box>
                                <Flex flexDirection="column">
                                  <Flex alignItems="center" gap={1}>
                                    <Text
                                      fontSize="small"
                                      fontFamily="Orbitron"
                                      lineHeight="1.33"
                                      fontWeight="bold"
                                      color={Colors.JUMBO}
                                    >
                                      TLM in {capitalize(convertPlanetIdToName(selectedDacId))}{' '}
                                      Release Date
                                    </Text>

                                    <GlossaryInfoIcon
                                      width={15}
                                      glossaryId={
                                        TooltipLocations.GOVERNANCE_SIDEBAR_TOKEN_RELEASE_DATE
                                      }
                                    />
                                  </Flex>
                                  <Flex gap={1}>
                                    <Text
                                      fontSize={{
                                        base: 'xs',
                                        lg: 'small',
                                      }}
                                      fontFamily="Orbitron"
                                      lineHeight="1.33"
                                      color={Colors.SNOW_WHITE}
                                    >
                                      {getLuxonUtcDateTime(unstake.release_time).toFormat(
                                        'yyyy/MM/dd HH:mm:ss'
                                      )}
                                    </Text>
                                    <Text
                                      fontSize="xs"
                                      fontFamily="Orbitron"
                                      lineHeight="4"
                                      color={Colors.SNOW_WHITE}
                                    >
                                      {getLuxonUtcDateTime(unstake.release_time).toFormat('ZZZZ')}
                                    </Text>
                                  </Flex>
                                </Flex>
                              </Flex>
                              <Flex justifyContent="center" gap={4} w="100%" pl={2}>
                                <Flex flexDirection="column">
                                  <Text
                                    fontSize="small"
                                    fontFamily="Orbitron"
                                    lineHeight="1.33"
                                    color={Colors.JUMBO}
                                  >
                                    Unstake Tokens
                                  </Text>
                                  <Text
                                    fontSize="small"
                                    fontFamily="Orbitron"
                                    lineHeight="1.33"
                                    color={Colors.SNOW_WHITE}
                                  >
                                    {`${formatNumber(unstake.stake, 4, 4)} TLM `}
                                  </Text>
                                </Flex>
                                <Button
                                  fontSize={14}
                                  size="sm"
                                  variant="beryllium"
                                  onClick={async () => {
                                    if (isDemoUser) {
                                      setPrimaryModalActive({
                                        modalName: 'LoginModal',
                                        value: true,
                                      })
                                    } else {
                                      await tryCancelUnstake({
                                        id: unstake.key,
                                        symbol: daoDetails.symbol.sym,
                                      })
                                      await client.refetchQueries({
                                        include: [DAO_WALLET_DETAILS_QUERY, USER_DAO_BALANCES],
                                      })
                                    }
                                  }}
                                >
                                  Cancel
                                </Button>
                              </Flex>
                              {isClaimTokensAvailable && index === unstakes.length - 1 && (
                                <Flex justifyContent="end" w="100%">
                                  <Button
                                    width="fit-content"
                                    size="xs"
                                    fontSize={12}
                                    variant="warning"
                                    onClick={async () => {
                                      if (isDemoUser) {
                                        setPrimaryModalActive({
                                          modalName: 'LoginModal',
                                          value: true,
                                        })
                                      } else {
                                        await tryClaimUnstake(daoDetails.symbol.sym)
                                        await client.refetchQueries({
                                          include: [DAO_WALLET_DETAILS_QUERY, USER_DAO_BALANCES],
                                        })
                                      }
                                    }}
                                  >
                                    Claim TLM
                                  </Button>
                                </Flex>
                              )}
                              <Divider />
                            </VStack>
                          )
                        })}
                      </Box>
                    )}

                    <Flex flexDirection="column" mt="20px" gap={4} width="full">
                      <Box px={{ base: null, lg: 5 }} py={4}>
                        <PlanetSelectionSmall showBackNavigation />
                      </Box>

                      <Button
                        size={buttonSizeX}
                        variant="info"
                        width="fit-content"
                        fontSize={responsiveValues.buttonFontSizeSmall}
                        leftIcon={
                          <Flex ml={{ base: '-20px', lg: '-15px' }}>
                            <ConvertTKNIcon boxSize={20} />
                          </Flex>
                        }
                        onClick={() => {
                          if (isDemoUser) {
                            setPrimaryModalActive({ modalName: 'LoginModal', value: true })
                          } else {
                            setPrimaryModalActive({
                              modalName: 'ConvertPlanataryTokenModal',
                              value: true,
                            })
                            collectEvent({
                              name: Constants.GA_SYNDICATES_CONVERT_TKN,
                              fields: {
                                location: getSyndicatesCurrentPage(),
                                voteWeight,
                                planet: selectedDacId,
                                stakedTokens: stakedTLM,
                                availableTokens: availableTlmInDao,
                              },
                            })
                          }
                        }}
                      >
                        <Text
                          fontFamily="Orbitron"
                          lineHeight="1.33"
                          minW={{ base: '150px', lg: '175px' }}
                        >
                          Stake TLM in {capitalize(convertPlanetIdToName(selectedDacId))}
                        </Text>
                      </Button>
                    </Flex>
                  </VStack>
                </Box>
              </Box>
            </Flex>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  )
})
