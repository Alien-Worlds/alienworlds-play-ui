import React, { useEffect } from 'react'

import {
  GovernanceIcon3,
  PlanetTreasuryIcon,
  TotalVotePowerIcon,
  TriliumIcon,
  UserProfileIcon,
} from '@alien-worlds/icons'
import { Button } from '@alien-worlds/uikit'
import { Flex, Text, Box, Grid, GridItem, Heading, Image, Hide } from '@chakra-ui/react'
import { PlanetImage } from 'features/mining/components/PlanetLand/Components/PlanetImage'
import { getPlanetGradient } from 'features/mining/utils/planet'
import { getPlanetImages } from 'features/syndicates/utils/GovernanceHelper'
import { useDaoDetails } from 'graphql/hooks/useDaoDetails'
import { useDaoGlobals } from 'graphql/hooks/useDaoGlobals'
import { useDaoTreasuries } from 'graphql/hooks/useDaoTreasury'
import { useWalletDaoDetails } from 'graphql/hooks/useWalletDaoDetails'
import {
  Candidate,
  DaoDetailsResponse,
  DaoGlobalsResponse,
  DaoTreasuryResponse,
  DaoWalletDetailsResponse,
} from 'graphql/types'
import { capitalize, find, get, sumBy } from 'lodash'
import { useParams } from 'react-router-dom'
import { generatePath, useNavigate } from 'react-router-dom'
import { Colors } from 'shared/util/colors'
import { convertPlanetIdToName, unionDAOFinder } from 'shared/util/helpers'
import { formatNumber } from 'shared/util/numbers'
import { useActions, useAppState } from 'store'
import { PagePath } from 'store/main/types'

import { Constants } from '../../../shared/util/constants'
export const DaoSelect = () => {
  const {
    wax: { selectedDacId, walletId },
  } = useAppState()
  const {
    wax: { collectEvent, getDAOInfo, setSelectedDacId },
    main: { showGovernanceDaoSelect },
  } = useActions()
  const planetImages = getPlanetImages(selectedDacId)

  const { planetId } = useParams()
  const navigate = useNavigate()
  useEffect(() => {
    showGovernanceDaoSelect(planetId)
  }, [])

  const { dacTreasury }: { dacTreasury: DaoTreasuryResponse[] } = useDaoTreasuries([
    selectedDacId,
    unionDAOFinder(selectedDacId),
  ])

  const { daoGlobals }: { daoGlobals: DaoGlobalsResponse } = useDaoGlobals(selectedDacId)
  const { daoGlobals: unionDaoGlobals }: { daoGlobals: DaoGlobalsResponse } = useDaoGlobals(
    unionDAOFinder(selectedDacId)
  )
  const { daoDetails }: { daoDetails: DaoDetailsResponse } = useDaoDetails(selectedDacId)
  const { daoDetails: unionDaoDetails }: { daoDetails: DaoDetailsResponse } = useDaoDetails(
    unionDAOFinder(selectedDacId)
  )

  const totalUnionDaoVotePower = sumBy(
    get(unionDaoDetails, 'candidates.candidates', []),
    (item: Candidate) => item.total_vote_power / 10000
  )
  const totalDaoVotePower = sumBy(
    get(daoDetails, 'candidates.candidates', []),
    (item: Candidate) => item.total_vote_power / 10000
  )
  const { walletDaoDetails }: { walletDaoDetails: DaoWalletDetailsResponse } = useWalletDaoDetails({
    dacId: selectedDacId,
    walletId,
  })

  const {
    walletDaoDetails: unionDaoWalletDetails,
  }: { walletDaoDetails: DaoWalletDetailsResponse } = useWalletDaoDetails({
    dacId: unionDAOFinder(selectedDacId),
    walletId,
  })

  return (
    <Flex width="100%" id="xyx" flexDirection="column" gap={4} padding={4}>
      <Box>
        <Flex alignItems="center" gap={4}>
          <Flex
            p={5}
            boxSize="32px"
            borderRadius="50%"
            backgroundColor={Colors.SNOW_WHITE}
            alignItems="center"
            justifyContent="center"
          >
            <GovernanceIcon3 color={Colors.BLACK_NEUTRAL} />
          </Flex>
          <Text fontSize={{ base: '30px', lg: '40px' }} fontFamily="orb">
            Select DAO Type
          </Text>
        </Flex>

        <Text fontFamily="tlm" fontSize={{ base: '14px', lg: '20px' }} color={Colors.GRAY_CHATEAU}>
          Select the type of DAO you wish to explore.
        </Text>
      </Box>
      <Grid width="100%">
        <GridItem>
          <Flex
            borderRadius="32px"
            position="relative"
            maxH={{ base: 'auto', lg: '338px' }}
            width="100%"
            backgroundColor="rgba(0, 0, 0, 0.8)"
          >
            <Box
              position="absolute"
              backgroundColor={Colors.COD_GRAY}
              height={{ base: 'auto', lg: '338px' }}
              width="100%"
              borderRadius="22px"
              opacity="0.6"
            />
            <Grid
              width="100%"
              height={{ base: 'auto', lg: '338px' }}
              templateColumns={{ base: '100% ', lg: '40% 60%' }}
              padding="20px"
            >
              <GridItem>
                <Flex
                  position="relative"
                  direction="column"
                  justifyContent="center"
                  height="100%"
                  width="100%"
                  gap={{ base: 3, lg: 6 }}
                  padding="20px"
                >
                  <Flex position="relative" gap={{ base: 4 }} alignItems="center">
                    {dacTreasury && (
                      <PlanetImage
                        width={{ base: '22px', md: '44px' }}
                        height={{ base: '22px', md: '44px' }}
                        titleDisplay="none"
                        dacTreasury={dacTreasury[1]}
                      />
                    )}
                    {daoDetails && (
                      <Heading
                        as="h6"
                        bgClip="text"
                        fontSize={{ base: '20px', lg: '40px' }}
                        fontWeight={400}
                        textAlign="start"
                        letterSpacing="0.05em"
                        fontFamily="tlm"
                        textTransform="capitalize"
                        bgGradient={getPlanetGradient(daoDetails.title)}
                      >
                        {daoDetails?.title + ' Union'}
                      </Heading>
                    )}
                  </Flex>
                  <Text
                    color={Colors.GRAY_CHATEAU}
                    position="relative"
                    fontFamily="tlm"
                    fontSize={{ base: '14px', lg: '16px' }}
                    fontWeight={400}
                  >
                    Union DAOs manage funding for Worker Proposals - projects generated by the
                    community to benefit the metaverse.
                  </Text>
                  <Hide below="md">
                    <Button
                      maxWidth="170px"
                      size="lg"
                      variant="primary"
                      onClick={() => {
                        const path = generatePath(PagePath.GovernanceDetails, {
                          planetId: unionDAOFinder(selectedDacId),
                        })

                        setSelectedDacId(unionDAOFinder(selectedDacId))
                        getDAOInfo(unionDAOFinder(selectedDacId))
                        navigate(path)
                        collectEvent({
                          name: Constants.GA_SYNDICATES_PLANET_SELECT_EXPLORE,
                          fields: {
                            location: PagePath.GovernanceSelect,
                            totalUnionDaoVotePower,
                            planet: convertPlanetIdToName(dacTreasury[1].dac_id),
                            stakedTokens: get(
                              unionDaoWalletDetails,
                              'stake_details.staked_amount',
                              0
                            ),
                            availableTokens:
                              unionDaoWalletDetails?.stake_details?.available_tlm_in_dao,
                            planetCandidates: unionDaoGlobals?.number_active_candidates,
                            planetVotePower: formatNumber(totalUnionDaoVotePower, 0, 0),
                            planetTreasury: dacTreasury[1].totals,
                          },
                        })
                      }}
                    >
                      Explore
                    </Button>
                  </Hide>
                </Flex>
              </GridItem>
              <GridItem maxHeight={{ base: 'auto', lg: '338px' }} width="100%" position="relative">
                <Flex flexDirection="column" position="relative" height="100%" alignItems="center">
                  <Flex
                    position="absolute"
                    zIndex={4}
                    backgroundColor={Colors.DARK_BLACK_80}
                    borderRadius="16px"
                    minW={{ base: '95%', lg: '255px' }}
                    right={{ base: '12px', lg: '12px' }}
                    top={{ base: '5px', lg: '10px' }}
                    p={4}
                  >
                    {dacTreasury &&
                      unionDaoGlobals &&
                      unionDaoWalletDetails &&
                      totalUnionDaoVotePower && (
                        <>
                          <Flex
                            mt={{ base: 0, lg: '20px' }}
                            flexDirection="column"
                            w="100%"
                            minW="255px"
                          >
                            <Flex justifyContent="space-between">
                              <Flex flexDirection="column" width="100%">
                                <Flex
                                  mb={1}
                                  alignItems="center"
                                  justifyContent="space-between"
                                  width="100%"
                                >
                                  <TriliumIcon h="25px" w="25px" color={Colors.DI_SERRIA} />
                                  <Text
                                    ml="10px"
                                    mr="auto"
                                    maxW={350}
                                    fontSize={14}
                                    lineHeight={1.7}
                                    fontWeight={500}
                                    fontFamily="Titillium Web"
                                  >
                                    Your TLM in{' '}
                                    {capitalize(
                                      convertPlanetIdToName(dacTreasury[0].dac_id + ' Union')
                                    )}
                                    :
                                  </Text>

                                  <Text
                                    ml="10px"
                                    maxW={350}
                                    fontSize={14}
                                    lineHeight={1.7}
                                    fontWeight={700}
                                    fontFamily="Titillium Web"
                                  >
                                    {formatNumber(
                                      get(
                                        unionDaoWalletDetails,
                                        'stake_details.available_tlm_in_dao',
                                        0
                                      ),
                                      0,
                                      4
                                    )}
                                  </Text>
                                </Flex>
                                <Flex mb={1} alignItems="center">
                                  <PlanetTreasuryIcon h="25px" w="25px" color={Colors.DI_SERRIA} />
                                  <Text
                                    ml="10px"
                                    mr="auto"
                                    maxW={350}
                                    fontSize={14}
                                    lineHeight={1.7}
                                    fontWeight={500}
                                    fontFamily="Titillium Web"
                                  >
                                    DAO Treasury
                                  </Text>

                                  <Text
                                    ml="10px"
                                    maxW={350}
                                    fontSize={14}
                                    lineHeight={1.7}
                                    fontWeight={700}
                                    fontFamily="Titillium Web"
                                  >
                                    {formatNumber(
                                      find(dacTreasury, { dac_id: unionDAOFinder(selectedDacId) })
                                        ?.totals || 0,
                                      0,
                                      0
                                    )}
                                  </Text>
                                </Flex>

                                <Flex mb={1} alignItems="center">
                                  <TotalVotePowerIcon h="25px" w="25px" color={Colors.DI_SERRIA} />
                                  <Text
                                    ml="10px"
                                    mr="auto"
                                    maxW={350}
                                    fontSize={14}
                                    lineHeight={1.7}
                                    fontWeight={500}
                                    fontFamily="Titillium Web"
                                  >
                                    Vote Power
                                  </Text>
                                  <Text
                                    ml="10px"
                                    maxW={350}
                                    fontSize={14}
                                    lineHeight={1.7}
                                    fontWeight={700}
                                    fontFamily="Titillium Web"
                                  >
                                    {formatNumber(totalUnionDaoVotePower, 0, 0)}
                                  </Text>
                                </Flex>
                                <Flex mb={1} alignItems="center">
                                  <UserProfileIcon h="25px" w="25px" color={Colors.DI_SERRIA} />
                                  <Text
                                    ml="10px"
                                    mr="auto"
                                    maxW={350}
                                    fontSize={14}
                                    lineHeight={1.7}
                                    fontWeight={500}
                                    fontFamily="Titillium Web"
                                  >
                                    Candidates
                                  </Text>
                                  <Text
                                    ml="10px"
                                    maxW={350}
                                    fontSize={14}
                                    lineHeight={1.7}
                                    fontWeight={700}
                                    fontFamily="Titillium Web"
                                  >
                                    {unionDaoGlobals.number_active_candidates}
                                  </Text>
                                </Flex>
                              </Flex>
                            </Flex>
                          </Flex>
                        </>
                      )}
                  </Flex>
                  <Image
                    position="relative"
                    borderRadius="20px"
                    width="100%"
                    height={{ base: '159px', lg: '90%' }} // Ensure image takes up full height of parent
                    objectFit="cover" // Scale image to fit container, maintaining aspect ratio
                    src={`/images/bg/${planetImages.candidates}`}
                    alt=""
                  />
                  <Hide above="md">
                    <Button
                      maxWidth="100%"
                      marginTop="20px"
                      isFullWidth
                      size="lg"
                      height="40px"
                      fontSize={16}
                      variant="primary"
                      onClick={() => {
                        const path = generatePath(PagePath.GovernanceDetails, {
                          planetId: unionDAOFinder(selectedDacId),
                        })

                        setSelectedDacId(unionDAOFinder(selectedDacId))
                        getDAOInfo(unionDAOFinder(selectedDacId))
                        navigate(path)
                        collectEvent({
                          name: Constants.GA_SYNDICATES_PLANET_SELECT_EXPLORE,
                          fields: {
                            location: PagePath.GovernanceSelect,
                            totalUnionDaoVotePower,
                            planet: convertPlanetIdToName(dacTreasury[1].dac_id),
                            stakedTokens: get(
                              unionDaoWalletDetails,
                              'stake_details.staked_amount',
                              0
                            ),
                            availableTokens:
                              unionDaoWalletDetails?.stake_details?.available_tlm_in_dao,
                            planetCandidates: unionDaoGlobals?.number_active_candidates,
                            planetVotePower: formatNumber(totalUnionDaoVotePower, 0, 0),
                            planetTreasury: dacTreasury[1].totals,
                          },
                        })
                      }}
                    >
                      Explore
                    </Button>
                  </Hide>
                </Flex>
              </GridItem>
            </Grid>
          </Flex>
        </GridItem>
        <GridItem></GridItem>
      </Grid>
      <Grid width="100%">
        <GridItem>
          <Flex
            borderRadius="32px"
            position="relative"
            maxH={{ base: 'auto', lg: '338px' }}
            width="100%"
            backgroundColor="rgba(0, 0, 0, 0.8)"
          >
            <Box
              position="absolute"
              backgroundColor={Colors.COD_GRAY}
              height={{ base: 'auto', lg: '338px' }}
              width="100%"
              borderRadius="22px"
              opacity="0.6"
            />
            <Grid
              width="100%"
              height={{ base: 'auto', lg: '338px' }}
              templateColumns={{ base: '100% ', lg: '40% 60%' }}
              padding="20px"
            >
              <GridItem
                maxHeight={{ base: 'auto', lg: '338px' }}
                position="relative"
                order={{ base: 1, lg: 0 }}
              >
                {' '}
                <Flex
                  position="absolute"
                  zIndex={4}
                  backgroundColor={Colors.DARK_BLACK_80}
                  borderRadius="16px"
                  minW={{ base: '95%', lg: '255px' }}
                  right={{ base: '12px', lg: '12px' }}
                  top={{ base: '5px', lg: '10px' }}
                  p={4}
                >
                  {dacTreasury && daoGlobals && walletDaoDetails && totalDaoVotePower && (
                    <>
                      <Flex
                        mt={{ base: 0, lg: '20px' }}
                        flexDirection="column"
                        w="100%"
                        minW="255px"
                      >
                        <Flex justifyContent="space-between">
                          <Flex flexDirection="column" width="100%">
                            <Flex
                              mb={1}
                              alignItems="center"
                              justifyContent="space-between"
                              width="100%"
                            >
                              <TriliumIcon h="25px" w="25px" color={Colors.DI_SERRIA} />
                              <Text
                                ml="10px"
                                mr="auto"
                                maxW={350}
                                fontSize={14}
                                lineHeight={1.7}
                                fontWeight={500}
                                fontFamily="Titillium Web"
                              >
                                Your TLM in{' '}
                                {capitalize(convertPlanetIdToName(dacTreasury[0].dac_id))}:
                              </Text>

                              <Text
                                ml="10px"
                                maxW={350}
                                fontSize={14}
                                lineHeight={1.7}
                                fontWeight={700}
                                fontFamily="Titillium Web"
                              >
                                {formatNumber(
                                  get(walletDaoDetails, 'stake_details.available_tlm_in_dao', 0),
                                  4,
                                  4
                                )}
                              </Text>
                            </Flex>
                            <Flex mb={1} alignItems="center">
                              <PlanetTreasuryIcon h="25px" w="25px" color={Colors.DI_SERRIA} />
                              <Text
                                ml="10px"
                                mr="auto"
                                maxW={350}
                                fontSize={14}
                                lineHeight={1.7}
                                fontWeight={500}
                                fontFamily="Titillium Web"
                              >
                                DAO Treasury
                              </Text>

                              <Text
                                ml="10px"
                                maxW={350}
                                fontSize={14}
                                lineHeight={1.7}
                                fontWeight={700}
                                fontFamily="Titillium Web"
                              >
                                {formatNumber(
                                  find(dacTreasury, { dac_id: selectedDacId })?.totals || 0,
                                  0,
                                  0
                                )}
                              </Text>
                            </Flex>

                            <Flex mb={1} alignItems="center">
                              <TotalVotePowerIcon h="25px" w="25px" color={Colors.DI_SERRIA} />
                              <Text
                                ml="10px"
                                mr="auto"
                                maxW={350}
                                fontSize={14}
                                lineHeight={1.7}
                                fontWeight={500}
                                fontFamily="Titillium Web"
                              >
                                Vote Power
                              </Text>
                              <Text
                                ml="10px"
                                maxW={350}
                                fontSize={14}
                                lineHeight={1.7}
                                fontWeight={700}
                                fontFamily="Titillium Web"
                              >
                                {formatNumber(totalDaoVotePower, 0, 0)}
                              </Text>
                            </Flex>
                            <Flex mb={1} alignItems="center">
                              <UserProfileIcon h="25px" w="25px" color={Colors.DI_SERRIA} />
                              <Text
                                ml="10px"
                                mr="auto"
                                maxW={350}
                                fontSize={14}
                                lineHeight={1.7}
                                fontWeight={500}
                                fontFamily="Titillium Web"
                              >
                                Candidates
                              </Text>
                              <Text
                                ml="10px"
                                maxW={350}
                                fontSize={14}
                                lineHeight={1.7}
                                fontWeight={700}
                                fontFamily="Titillium Web"
                              >
                                {daoGlobals.number_active_candidates}
                              </Text>
                            </Flex>
                          </Flex>
                        </Flex>
                      </Flex>
                    </>
                  )}
                </Flex>
                <Image
                  position="relative"
                  borderRadius="20px"
                  width="100%"
                  height={{ base: '159px', lg: '90%' }} // Ensure image takes up full height of parent
                  objectFit="cover" // Scale image to fit container, maintaining aspect ratio
                  src={`/images/bg/${planetImages.select}`}
                  alt=""
                />
                <Hide above="md">
                  {' '}
                  <Button
                    width="100%"
                    isFullWidth
                    marginTop="20px"
                    height="40px"
                    fontSize={16}
                    size="lg"
                    variant="primary"
                    onClick={() => {
                      const path = generatePath(PagePath.GovernanceDetails, {
                        planetId: selectedDacId,
                      })
                      navigate(path)
                      collectEvent({
                        name: Constants.GA_SYNDICATES_PLANET_SELECT_EXPLORE,
                        fields: {
                          location: PagePath.GovernanceSelect,
                          userVotePower: walletDaoDetails?.vote_weight,
                          planet: daoDetails?.dac_id,
                          stakedTokens: walletDaoDetails?.stake_details?.staked_amount,
                          availableTokens: walletDaoDetails?.stake_details?.available_tlm_in_dao,
                          planetCandidates: daoGlobals?.number_active_candidates,
                          planetVotePower: formatNumber(totalDaoVotePower, 0, 0),
                          planetTreasury: formatNumber(dacTreasury[0].totals, 0, 0),
                        },
                      })
                    }}
                  >
                    Explore
                  </Button>
                </Hide>
              </GridItem>
              <GridItem>
                <Flex
                  position="relative"
                  direction="column"
                  justifyContent="center"
                  height="100%"
                  width="100%"
                  gap={{ base: 3, lg: 6 }}
                  padding="20px"
                >
                  <Flex position="relative" gap={{ base: 4, lg: 4 }} alignItems="center">
                    {dacTreasury && (
                      <PlanetImage
                        width={{ base: '22px', md: '44px' }}
                        height={{ base: '22px', md: '44px' }}
                        titleDisplay="none"
                        dacTreasury={dacTreasury[0]}
                      />
                    )}
                    {daoDetails && (
                      <Heading
                        as="h6"
                        bgClip="text"
                        fontSize={{ base: '20px', lg: '40px' }}
                        fontWeight={400}
                        textAlign="start"
                        letterSpacing="0.05em"
                        fontFamily="tlm"
                        textTransform="capitalize"
                        bgGradient={getPlanetGradient(daoDetails?.title)}
                      >
                        {daoDetails?.title + ' Syndicate'}
                      </Heading>
                    )}
                  </Flex>
                  <Text
                    color={Colors.GRAY_CHATEAU}
                    position="relative"
                    fontFamily="tlm"
                    fontSize={{ base: '14px', lg: '16px' }}
                    fontWeight={400}
                  >
                    Syndicate DAOs compete for daily inflation based on the amount of TLM staked for
                    voting and fund Custodian-initiated projects from their DAO treasuries.
                  </Text>

                  <Hide below="md">
                    {' '}
                    <Button
                      maxWidth="170px"
                      size="lg"
                      variant="primary"
                      onClick={() => {
                        const path = generatePath(PagePath.GovernanceDetails, {
                          planetId: selectedDacId,
                        })
                        navigate(path)
                        collectEvent({
                          name: Constants.GA_SYNDICATES_PLANET_SELECT_EXPLORE,
                          fields: {
                            location: PagePath.GovernanceSelect,
                            userVotePower: walletDaoDetails?.vote_weight,
                            planet: daoDetails?.dac_id,
                            stakedTokens: walletDaoDetails?.stake_details?.staked_amount,
                            availableTokens: walletDaoDetails?.stake_details?.available_tlm_in_dao,
                            planetCandidates: daoGlobals?.number_active_candidates,
                            planetVotePower: formatNumber(totalDaoVotePower, 0, 0),
                            planetTreasury: formatNumber(dacTreasury[0].totals, 0, 0),
                          },
                        })
                      }}
                    >
                      Explore
                    </Button>
                  </Hide>
                </Flex>
              </GridItem>
            </Grid>
          </Flex>
        </GridItem>
        <GridItem></GridItem>
      </Grid>
    </Flex>
  )
}
