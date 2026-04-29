import { memo, useEffect, useMemo, useState } from 'react'

import {
  WaxIcon,
  ClaimPlanetTLMIcon,
  CitizenIcon,
  CandiateIcon,
  CustodianIcon,
} from '@alien-worlds/icons'
import { useBreakpointValue, Box, Flex, Heading, SimpleGrid, Text } from '@chakra-ui/react'
import { GlossaryInfoIcon } from 'features/glossary/components/GlossaryInfoIcon/GlossaryInfoIcon'
import { TooltipLocations } from 'features/glossary/utils/glossaryConst'
import { PlanetImage } from 'features/mining/components/PlanetLand/Components/PlanetImage'
import { getPlanetGradient } from 'features/mining/utils/planet'
import { LoadingSpinner } from 'features/syndicates/components/LoadingSpinner/LoadingSpinner'
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
import { get, split, sumBy, toLower } from 'lodash'
import { DateTime, Duration } from 'luxon'
import { Colors } from 'shared/util/colors'
import { getISODateUTC, isUnionDAO } from 'shared/util/helpers'
import { useScreenSize } from 'shared/util/hooks'
import { PlanetIcon } from 'shared/util/icons'
import { formatNumber } from 'shared/util/numbers'
import { useAppState } from 'store'
import { DACUserStatusType } from 'store/wax/types'

const planetIconStyle = {
  desktop: {
    width: 48,
    height: 48,
    position: 'relative',
    top: 40,
    zIndex: 3,
  },
  mobile: {
    width: 38,
    height: 38,
    position: 'relative',
    top: 40,
    zIndex: 3,
  },
}

export const GovernanceHeader = memo(() => {
  const {
    wax: {
      isDemoUser,

      walletId,
      selectedDacId,
    },
  } = useAppState()

  const { isMobile } = useScreenSize()

  const breakpointBox = useBreakpointValue({ base: '23px', md: '35px' })

  const memoizedSelectedDacId = useMemo(() => selectedDacId, [selectedDacId])
  const [isUnion, setIsUnion] = useState(isUnionDAO(memoizedSelectedDacId))

  const {
    dacTreasury,
    loading: dacLoading,
  }: { dacTreasury: DaoTreasuryResponse[]; loading: boolean } = useDaoTreasuries([selectedDacId])

  const { daoGlobals, loading: daoLoading }: { daoGlobals: DaoGlobalsResponse; loading: boolean } =
    useDaoGlobals(memoizedSelectedDacId)

  const {
    daoDetails,
    loading: daoDetailsLoading,
  }: { daoDetails: DaoDetailsResponse; loading: boolean } = useDaoDetails(memoizedSelectedDacId)

  const {
    walletDaoDetails,
    loading: walletDaoDetailsLoading,
  }: { walletDaoDetails: DaoWalletDetailsResponse; loading: boolean } = useWalletDaoDetails({
    dacId: memoizedSelectedDacId,
    walletId,
  })

  const loading = dacLoading || daoLoading || daoDetailsLoading || walletDaoDetailsLoading
  const userStatus = get(walletDaoDetails, 'user_status', 'explorer')

  const totalDaoVotePower = sumBy(
    get(daoDetails, 'candidates.candidates', []),
    (item: Candidate) => item.total_vote_power / 10000
  )

  const custodianBudget = () => {
    if (daoGlobals && daoGlobals.budget_percentage > 0 && dacTreasury) {
      return Math.trunc(
        (daoGlobals.budget_percentage *
          parseFloat(split(dacTreasury[0].balances[0].balance, 'TLM')[0])) /
          100 /
          100
      )
    }
    return 0
  }
  useEffect(() => {
    setIsUnion(isUnionDAO(memoizedSelectedDacId))
  }, [memoizedSelectedDacId])

  function formatTimer() {
    let value

    if (daoGlobals?.lastperiodtime && daoGlobals?.periodlength) {
      const dateLastElection = getISODateUTC(daoGlobals.lastperiodtime)
      const dateNewElection: any = dateLastElection
        .plus({ seconds: daoGlobals?.periodlength })
        .toBSON()
      // const lastElectionTime = dateLastElection.toMillis()

      // Calculate time for next election
      const nextPeriodTime = dateNewElection - DateTime.now().toMillis()

      const duration = Duration.fromMillis(nextPeriodTime)
      const time = duration.shiftTo('days', 'hours', 'minutes').toObject()
      const hours = parseInt(time?.hours?.toFixed(0), 10)
      const days = parseInt(time?.days?.toFixed(0), 10)
      const minutes = parseInt(time?.minutes?.toFixed(0), 10)

      if (days >= 0 && hours >= 0 && minutes >= 0) {
        value = `${days}d ${hours}h ${minutes}m`
      } else {
        value = 'Pending'
      }

      return value
    }
  }

  return (
    <Flex
      bg={Colors.BLACK_SOLID_65}
      p="20px"
      mt={{ base: '24px', md: isDemoUser ? '50px' : '25px' }}
      gap={5}
      justifyContent="space-evenly"
      wrap="wrap"
      alignItems="center"
      position="relative"
    >
      {!selectedDacId || (loading && <LoadingSpinner inline={true} />)}
      {selectedDacId && !loading && (
        <>
          <Flex position="absolute" right={2} top={2}>
            <GlossaryInfoIcon
              width={20}
              height={20}
              color={Colors.SNOW_WHITE}
              glossaryId={TooltipLocations.GOVERNANCE_HEADER}
            />
          </Flex>

          {/* Column 1 - Planet profile */}
          <Flex alignItems="left" flexDirection="row" gap={5} flex="1 0 200px">
            <Flex alignItems="left" flexDirection="row">
              {dacTreasury && (
                <PlanetImage
                  width={{ base: '80px', md: '136px' }}
                  height={{ base: '80px', md: '136px' }}
                  titleDisplay="none"
                  dacTreasury={dacTreasury[0]}
                />
              )}
              {userStatus !== toLower(DACUserStatusType.NONE) && (
                <Box
                  mr="75px"
                  bg={Colors.BLACK_SOLID_100}
                  pt={{ base: '3px', md: '5px' }}
                  pl={{ base: '1px', md: '3px' }}
                  h={{ base: '30px', md: '45px' }}
                  w={{ base: '30px', md: '45px' }}
                  mt={{ base: '60px', md: '100px' }}
                  position="absolute"
                  zIndex={1200}
                  textAlign="center"
                  borderRadius="50px"
                  border="2px solid white"
                >
                  {userStatus === toLower(DACUserStatusType.MEMBER) && (
                    <CitizenIcon
                      color={Colors.SNOW_WHITE}
                      width={breakpointBox}
                      height={breakpointBox}
                    />
                  )}
                  {userStatus === toLower(DACUserStatusType.CANDIDATE) && (
                    <CandiateIcon
                      color={Colors.SNOW_WHITE}
                      width={breakpointBox}
                      height={breakpointBox}
                    />
                  )}
                  {userStatus === toLower(DACUserStatusType.CUSTODIAN) && (
                    <CustodianIcon
                      color={Colors.SNOW_WHITE}
                      width={breakpointBox}
                      height={breakpointBox}
                    />
                  )}
                </Box>
              )}
              <Box
                h={{ base: '38px', md: '48px' }}
                w={{ base: '38px', md: '48px' }}
                mt="-50px"
                ml={{ base: '50px', md: '100px' }}
                position="absolute"
                zIndex={1200}
              >
                <PlanetIcon
                  planetName={daoDetails?.title}
                  style={isMobile ? planetIconStyle.mobile : planetIconStyle.desktop}
                />
              </Box>
            </Flex>

            <Flex flexDirection="column" alignItems="start" justifyContent="center">
              <Heading
                mb={3}
                as="h6"
                bgClip="text"
                fontSize="36px"
                fontWeight={400}
                textAlign="start"
                letterSpacing="0.05em"
                fontFamily="tlm"
                textTransform="capitalize"
                bgGradient={getPlanetGradient(daoDetails?.title)}
              >
                {daoDetails?.title}
              </Heading>

              <Flex alignItems="start" flexDirection="column" minW="110px">
                <Text color="grey" fontSize={14} lineHeight={1.7} fontWeight={400} fontFamily="tlm">
                  {isUnion ? 'Union' : 'Planet'} Vote Power
                </Text>
                <Text
                  mt="-5px"
                  maxW={350}
                  fontSize={{ base: '16px', sm: '20px' }}
                  fontWeight={400}
                  lineHeight={1.7}
                  fontFamily="Orbitron"
                  color={Colors.CARIBBEAN_GREEN}
                  wordBreak="break-all"
                >
                  {formatNumber(totalDaoVotePower, 0, 0)}
                </Text>
              </Flex>
            </Flex>
          </Flex>

          {/* Column 2 - Planet stats */}
          <SimpleGrid
            gridTemplateColumns="repeat(2, minmax(100px, 1fr))"
            gap={3}
            flex="1 0 200px"
            justifyContent="center"
            borderTop={{ base: `1px solid ${Colors.SCORPION}`, sm: 'none' }}
            borderBottom={{ base: `1px solid ${Colors.SCORPION}`, sm: 'none' }}
            paddingY={{ base: 5, sm: 0 }}
            marginY={{ base: 0, sm: 0 }}
          >
            <Flex alignItems="start" flexDirection="column">
              <Text
                maxW={350}
                fontSize={20}
                fontWeight={400}
                lineHeight={1.7}
                fontFamily="Orbitron"
                wordBreak="break-all"
              >
                {formatNumber(daoDetails?.supply, 0, 0)}
              </Text>
              <Text
                mt="-5px"
                color="grey"
                maxW={350}
                fontSize={14}
                lineHeight={1.7}
                fontWeight={400}
                fontFamily="tlm"
              >
                {isUnion ? 'Union' : 'Planet'} DAO Governance Units
              </Text>
            </Flex>

            <Flex flexDirection="column" alignItems="start">
              <Text
                maxW={350}
                fontSize={20}
                fontWeight={400}
                lineHeight={1.7}
                fontFamily="Orbitron"
                color={Colors.CARIBBEAN_GREEN}
              >
                Active
              </Text>
              <Text
                w="100px"
                mt="-5px"
                color="grey"
                maxW={350}
                fontSize={14}
                lineHeight={1.7}
                fontWeight={400}
                fontFamily="tlm"
              >
                {isUnion ? 'Union' : 'Planet'} Activation
              </Text>
            </Flex>

            <Flex alignItems="start" flexDirection="column">
              <Flex>
                <ClaimPlanetTLMIcon
                  boxSize={18}
                  style={{ marginTop: '2px' }}
                  color={Colors.NAVY_BLUE}
                />
                <Text
                  ml={1}
                  mt={-1}
                  maxW={350}
                  fontSize={20}
                  fontWeight={400}
                  lineHeight={1.6}
                  fontFamily="Orbitron"
                  color={Colors.SNOW_WHITE}
                >
                  {formatTimer()}
                </Text>
              </Flex>
              <Text
                mt="-5px"
                maxW={350}
                color="grey"
                fontSize={14}
                lineHeight={1.7}
                fontWeight={400}
                fontFamily="tlm"
              >
                Next Election
              </Text>
            </Flex>

            <Flex flexDirection="column">
              <Text maxW={350} fontSize={20} fontWeight={400} fontFamily="Orbitron" mt="-3px">
                {daoGlobals?.number_active_candidates}
              </Text>
              <Text
                mt="-3px"
                color="grey"
                maxW={350}
                fontSize={14}
                lineHeight={1.7}
                fontWeight={400}
                fontFamily="tlm"
              >
                Active Candidates
              </Text>
            </Flex>
          </SimpleGrid>

          {/* COLUMN 3 - Treasury & Budget */}
          <Flex flexDirection="row" alignItems="start" flex="1 0 150px" gap={3} wrap="wrap">
            <Flex mb={1} alignItems="start" flexDirection="column" flex="1 0 150px" gap="3px">
              <Flex alignItems="flex-start" gap="7px">
                <WaxIcon h="25px" w="25px" color={Colors.DARK_YELLOW} style={{ marginRight: 5 }} />
                <Text
                  maxW={350}
                  fontSize={20}
                  lineHeight={1.5}
                  fontWeight={400}
                  fontFamily="Orbitron"
                  color={Colors.DARK_YELLOW}
                >
                  {formatNumber(dacTreasury[0].balances[0].balance, 0, 0)}
                </Text>
              </Flex>
              <Flex gap={1}>
                <Text
                  maxW={350}
                  color="grey"
                  fontSize={14}
                  lineHeight={1}
                  fontWeight={400}
                  fontFamily="tlm"
                >
                  {isUnion ? 'Union' : 'Planet'} Treasury
                </Text>

                <GlossaryInfoIcon
                  width={15}
                  glossaryId={TooltipLocations.GOVERNANCE_HEADER_PLANET_TREASURY}
                />
              </Flex>
            </Flex>
            <Flex alignItems="start" flexDirection="column" flex="1 0 150px" gap="3px">
              <Flex alignItems="flex-start" gap="7px">
                <WaxIcon h="25px" w="25px" color={Colors.NAVY_BLUE} style={{ marginRight: 5 }} />
                <Text
                  maxW={350}
                  fontSize={20}
                  lineHeight={1.5}
                  fontWeight={400}
                  fontFamily="Orbitron"
                  color={Colors.NAVY_BLUE}
                >
                  {formatNumber(custodianBudget(), 0, 4)}
                </Text>
              </Flex>

              <Flex gap={1}>
                <Text
                  maxW={350}
                  color="grey"
                  fontSize={14}
                  lineHeight={1}
                  fontWeight={400}
                  fontFamily="tlm"
                >
                  Custodian Budget
                </Text>

                <GlossaryInfoIcon
                  width={15}
                  glossaryId={TooltipLocations.GOVERNANCE_HEADER_CUSTODIAN_BUDGET}
                />
              </Flex>
            </Flex>
          </Flex>
        </>
      )}
    </Flex>
  )
})
