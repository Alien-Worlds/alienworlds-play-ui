import { memo, useEffect, useMemo } from 'react'

import { CustodianIcon, PendingIcon } from '@alien-worlds/icons'
import { PlaceRing } from '@alien-worlds/uikit'
import { Box, Flex, Text, Tooltip, VStack, HStack } from '@chakra-ui/react'
import { GlossaryInfoIcon } from 'features/glossary/components/GlossaryInfoIcon/GlossaryInfoIcon'
import { TooltipLocations } from 'features/glossary/utils/glossaryConst'
import { MemberTermsStatusBadge } from 'features/syndicates/components/MemberTermsStatusBadge/MemberTermsStatusBadge'
import { ProposalsTableVirtualised } from 'features/syndicates/components/ProposalsTableVirtualised/ProposalsTableVirtualised'
import { useDaoDetails } from 'graphql/hooks/useDaoDetails'
import { useDaoGlobals } from 'graphql/hooks/useDaoGlobals'
import { useMsigsProposals } from 'graphql/hooks/useMsigsProposals'
import { Custodian, DaoDetailsResponse, DaoGlobalsResponse, MsigsResponse } from 'graphql/types'
import { get, map } from 'lodash'
import { DateTime } from 'luxon'
import { useNavigate, useParams } from 'react-router-dom'
import { Colors } from 'shared/util/colors'
import {
  fallbackAvatarSrc,
  getDacPlaceRingVariantByPlace,
  getISODateUTC,
} from 'shared/util/helpers'
import { useScreenSize } from 'shared/util/hooks'
import { useActions, useAppState } from 'store'
import { PagePath } from 'store/main/types'
import { v4 } from 'uuid'

export const PlanetDetails = () => {
  const {
    wax: { selectedDacId },
  } = useAppState()

  const {
    wax: { setIsSyndicatesSidebarOpen },
    main: { showGovernanceDetailsPage },
  } = useActions()

  const { isMobile } = useScreenSize()
  const navigate = useNavigate()
  const { planetId } = useParams()

  const memoizedSelectedDacId = useMemo(() => selectedDacId, [selectedDacId])

  // GraphQL Queries

  const { daoGlobals, loading: daoLoading }: { daoGlobals: DaoGlobalsResponse; loading: boolean } =
    useDaoGlobals(selectedDacId)

  const {
    daoDetails,
    loading: daoDetailsLoading,
  }: { daoDetails: DaoDetailsResponse; loading: boolean } = useDaoDetails(memoizedSelectedDacId)

  const { loading: msigsProposalsLoading }: { msigsProposals: MsigsResponse[]; loading: boolean } =
    useMsigsProposals(memoizedSelectedDacId)
  const loading = msigsProposalsLoading || daoLoading || daoDetailsLoading

  useEffect(() => {
    showGovernanceDetailsPage(planetId)
    setIsSyndicatesSidebarOpen(true)
  }, [])

  const CustodianListCard = memo(() => {
    return (
      <Flex flexWrap="wrap" justifyContent="center" gap={4} paddingBlock={4}>
        {map(get(daoDetails, 'custodians.custodians', []), (custodian: Custodian, i: number) => {
          return (
            <Tooltip
              hasArrow
              key={v4()}
              placement="auto"
              label={
                <VStack align="start" gap="7px" p={2}>
                  <HStack align="center">
                    <Text fontSize={16} fontFamily="tlm" fontWeight={600} color={Colors.SNOW_WHITE}>
                      Rank (Score)
                    </Text>
                    <Text fontSize={16} fontFamily="orb" fontWeight={500} color={Colors.DI_SERRIA}>
                      {custodian.rank}
                    </Text>
                  </HStack>
                  <HStack align="center">
                    <Text fontSize={16} fontFamily="tlm" fontWeight={600} color={Colors.SNOW_WHITE}>
                      Vote Power
                    </Text>
                    <Text fontSize={16} fontFamily="orb" fontWeight={500} color={Colors.DI_SERRIA}>
                      {custodian.total_vote_power}
                    </Text>
                  </HStack>
                  <HStack align="center">
                    <Text fontSize={16} fontFamily="tlm" fontWeight={600} color={Colors.SNOW_WHITE}>
                      Total Votes
                    </Text>
                    <Text fontSize={16} fontFamily="orb" fontWeight={500} color={Colors.DI_SERRIA}>
                      {custodian.number_voters}
                    </Text>
                  </HStack>
                </VStack>
              }
              aria-label="Custodian"
            >
              <Flex
                key={i}
                flexDirection="column"
                alignItems="center"
                paddingY={6}
                paddingX={0}
                width="225px"
                _hover={{
                  outline: `2px solid ${Colors.SNOW_WHITE}`,
                }}
                cursor="pointer"
                onClick={() => {
                  navigate(
                    `${PagePath.GovernanceSelect}/${selectedDacId}/signcandidatevote/${custodian.cust_name}`
                  )
                }}
              >
                <Box justifyContent="center" display="flex">
                  <MemberTermsStatusBadge positionOffset={2} isTermsSigned={true}>
                    <PlaceRing
                      radius={8.5}
                      fallbackSrc={fallbackAvatarSrc}
                      variant={getDacPlaceRingVariantByPlace(i + 1)}
                      src={custodian?.profile?.image}
                    />
                  </MemberTermsStatusBadge>
                </Box>
                <Text
                  fontFamily="tlm"
                  letterSpacing="0.1em"
                  color={Colors.DI_SERRIA}
                  whiteSpace="nowrap"
                  fontSize="md"
                >
                  {custodian.cust_name}
                </Text>
                <Text
                  isTruncated
                  fontFamily="orb"
                  letterSpacing="0.1em"
                  color={Colors.SNOW_WHITE}
                  fontSize={18}
                  textAlign="center"
                  width="100%"
                >
                  {custodian?.profile?.givenName || '-'}
                </Text>
                <Text
                  fontFamily="tlm"
                  letterSpacing="0.1em"
                  color={Colors.GRAY_CHATEAU}
                  whiteSpace="nowrap"
                  fontSize="md"
                  mt="5px"
                >
                  Elected Rank
                </Text>
                <Text
                  fontSize="22px"
                  fontFamily="orb"
                  letterSpacing="0.1em"
                  color={Colors.SNOW_WHITE}
                  whiteSpace="nowrap"
                  mt="-5px"
                >
                  {i + 1}
                </Text>
              </Flex>
            </Tooltip>
          )
        })}
      </Flex>
    )
  })

  const CustodianListSmall = memo(() => {
    return (
      <Flex flexWrap="wrap" justifyContent="center" gap={5} paddingBlock={4}>
        {map(get(daoDetails, 'custodians.custodians', []), (custodian: Custodian, i: number) => {
          return (
            <Flex
              key={i}
              flexDirection="row"
              cursor="pointer"
              width="full"
              gap={4}
              onClick={() => {
                navigate(
                  `${PagePath.GovernanceSelect}/${selectedDacId}/signcandidatevote/${custodian.cust_name}`
                )
              }}
            >
              <Box justifyContent="center" display="flex" flex={0}>
                <MemberTermsStatusBadge
                  // TODO
                  isTermsSigned={true}
                  positionOffset={0}
                >
                  <PlaceRing
                    variant={getDacPlaceRingVariantByPlace(i + 1)}
                    // TODO
                    //src={custodian.isFlagged ? fallbackAvatarSrc : custodian?.profile?.image}
                    src={custodian?.profile?.image}
                    radius={5.5}
                    fallbackSrc={fallbackAvatarSrc}
                  />
                </MemberTermsStatusBadge>
              </Box>

              <Flex width="full" flexDirection="column" minWidth={0}>
                <Text
                  isTruncated
                  fontFamily="orb"
                  letterSpacing="0.1em"
                  color={Colors.SNOW_WHITE}
                  fontSize={{ base: '16px', sm: '20px' }}
                >
                  {custodian?.profile?.givenName || '-'}
                </Text>
                <Text
                  fontFamily="tlm"
                  letterSpacing="0.1em"
                  color={Colors.DI_SERRIA}
                  whiteSpace="nowrap"
                  fontSize={{ base: '14px', sm: '16px' }}
                >
                  {custodian.cust_name}
                </Text>

                <Flex flexDirection="row" gap={2}>
                  <Text
                    fontFamily="tlm"
                    letterSpacing="0.1em"
                    color={Colors.GRAY_CHATEAU}
                    whiteSpace="nowrap"
                    fontSize="md"
                    mt="5px"
                    flex={1}
                  >
                    Elected Rank:
                  </Text>
                  <Text
                    fontSize={{ base: '16px', sm: '20px' }}
                    fontFamily="orb"
                    letterSpacing="0.1em"
                    mt="5px"
                    color={Colors.SNOW_WHITE}
                    whiteSpace="nowrap"
                    flex={1}
                    textAlign="right"
                  >
                    {i + 1}
                  </Text>
                </Flex>
              </Flex>
            </Flex>
          )
        })}
      </Flex>
    )
  })

  const CustodiansList = () => {
    if (isMobile) {
      return <CustodianListSmall />
    }

    return <CustodianListCard />
  }

  return (
    <>
      <Flex
        p={5}
        h="100%"
        mt={6}
        alignItems="start"
        flexDirection="column"
        bg={Colors.BLACK_SOLID_65}
        position="relative"
      >
        <Flex position="absolute" right={2} top={2}>
          <GlossaryInfoIcon
            boxSize="5px"
            color={Colors.SNOW_WHITE}
            glossaryId={TooltipLocations.GOVERNANCE_PLANET_DETAILS_CUSTODIANS}
          />
        </Flex>

        {/* CUSTODIANS */}
        <Flex width="100%" flexDirection="column" justifyContent="space-around">
          <Flex gap={2} mb={3} alignItems="flex-end" wrap="wrap" overflowWrap="break-word">
            <CustodianIcon boxSize="22px" color={Colors.DI_SERRIA} />

            <Text
              fontFamily="orb"
              letterSpacing="0.1em"
              color={Colors.SNOW_WHITE}
              whiteSpace="nowrap"
              fontSize="20px"
              lineHeight="22px"
            >
              Custodians:
            </Text>

            {loading && (
              <Text fontFamily="tlm" color={Colors.GRAY_CHATEAU} fontSize="14px" lineHeight="18px">
                Last Election Snapshot:&nbsp;
                {DateTime.fromMillis(
                  getISODateUTC(daoGlobals?.lastperiodtime).toMillis()
                ).toLocaleString(DateTime.DATETIME_SHORT)}
              </Text>
            )}

            <GlossaryInfoIcon
              boxSize="5px"
              glossaryId={TooltipLocations.GOVERNANCE_PLANET_DETAILS_SNAP_ELECTION}
            />
          </Flex>

          {loading ? (
            <Text
              fontFamily="orb"
              fontWeight={500}
              lineHeight="1.33"
              color={Colors.SNOW_WHITE}
              textAlign="center"
              width="max-content"
              marginX="auto"
              marginY="153px"
            >
              Loading Custodians, please wait..
            </Text>
          ) : (
            <CustodiansList />
          )}
        </Flex>
      </Flex>

      <Box mt={5} bg={Colors.BLACK_SOLID_65} position="relative">
        <Flex position="absolute" right={2} top={2}>
          <GlossaryInfoIcon
            boxSize="5px"
            color={Colors.SNOW_WHITE}
            glossaryId={TooltipLocations.GOVERNANCE_PLANET_DETAILS_PROPOSAL}
          />
        </Flex>
        <Flex w="100%" mt="25px" flexDirection="column" justifyContent="space-around">
          <Flex gap={2} mb={3} ml="25px" mt="25px" alignItems="center">
            <PendingIcon boxSize="22px" color={Colors.DI_SERRIA} />
            <Text
              fontFamily="orb"
              whiteSpace="nowrap"
              letterSpacing="0.1em"
              color={Colors.SNOW_WHITE}
              fontSize="20px"
            >
              Proposals:
            </Text>
          </Flex>
        </Flex>
        {/* PROPOSALS TABLE */}
        <Flex>
          {loading ? (
            <Text
              fontFamily="orb"
              fontWeight={500}
              lineHeight="1.33"
              color={Colors.SNOW_WHITE}
              textAlign="center"
              width="max-content"
              marginX="auto"
              marginY="153px"
            >
              Loading Proposals, please wait..
            </Text>
          ) : (
            <ProposalsTableVirtualised />
          )}
        </Flex>
      </Box>
    </>
  )
}
