import { GovernanceIcon3 } from '@alien-worlds/icons'
import { Box, Flex, HStack, Text } from '@chakra-ui/react'
import { GlossaryInfoIcon } from 'features/glossary/components/GlossaryInfoIcon/GlossaryInfoIcon'
import { TooltipLocations } from 'features/glossary/utils/glossaryConst'
import { getPlanetGradient } from 'features/mining/utils/planet'
import { LoadingSpinner } from 'features/syndicates/components/LoadingSpinner/LoadingSpinner'
import { useUserDaoBalances } from 'graphql/hooks/useUserDaoBalances'
import { useWalletDaoDetails } from 'graphql/hooks/useWalletDaoDetails'
import { DaoWalletDetailsResponse, UserBalancesResponse } from 'graphql/types'
import { capitalize, filter, get, map, replace, toNumber } from 'lodash'
import { Colors } from 'shared/util/colors'
import { convertPlanetIdToName } from 'shared/util/helpers'
import { PlanetIcon, PlanetIconRGB } from 'shared/util/icons'
import { formatNumber } from 'shared/util/numbers'
import { useAppState } from 'store'
import { PlanetBalanceType } from 'store/wax/types'
import { v4 } from 'uuid'

export const PlanetaryTokens = () => {
  const {
    wax: { selectedDacId, walletId },
  } = useAppState()
  const {
    walletDaoDetails,
    loading: walletDaoDetailsLoading,
  }: { walletDaoDetails: DaoWalletDetailsResponse; loading: boolean } = useWalletDaoDetails({
    dacId: selectedDacId,
    walletId,
  })
  const planetStakes = toNumber(
    replace(get(walletDaoDetails, 'stake_details.available_tlm_in_dao', '0'), /[^0-9.-]/g, '')
  )
  const {
    userDaoBalances,
    loading: userDaoBalancesLoading,
  }: { userDaoBalances: UserBalancesResponse; loading: boolean } = useUserDaoBalances({
    walletId: walletId,
  })
  const balances = []
  if (walletDaoDetailsLoading || userDaoBalancesLoading) return <LoadingSpinner />
  return (
    <Flex
      w="100%"
      direction="column"
      alignSelf="center"
      alignItems="start"
      paddingInline={{ base: '5%', '2xl': '0px' }}
    >
      <Box mb={4} alignSelf={{ base: 'start', md: 'start' }}>
        <HStack>
          <GovernanceIcon3 color={Colors.GRAY} boxSize="20px" />
          <Text ml={2} fontSize="small" color={Colors.GRAY} fontFamily="orb">
            Planetary Staked TLM
          </Text>
        </HStack>
      </Box>

      <Flex w={{ base: '100%', md: '100%' }} h="100%" justifyContent="center" flexWrap="wrap">
        <Flex direction="column" alignItems="start" w="100%" rowGap="15px">
          {balances && (
            <>
              {map(
                balances.filter((p) => p.planet !== 'testa'),
                (p: PlanetBalanceType) => (
                  <Flex
                    w="100%"
                    key={v4()}
                    rowGap="15px"
                    flexWrap="wrap"
                    justifyContent="space-between"
                  >
                    {/* PLANETS TOKENS */}
                    <Flex minW="250px" w="250px">
                      <HStack w="100%" display="flex" alignItems="center" justifyContent="start">
                        <Box
                          position="relative"
                          display="flex"
                          alignContent="center"
                          justifyContent="center"
                        >
                          <PlanetIcon
                            planetName={capitalize(convertPlanetIdToName(p.planet))}
                            style={{
                              top: 42,
                              bottom: 0,
                              zIndex: 3,
                              right: 10,
                              width: 48,
                              height: 48,
                            }}
                          />
                        </Box>
                        <Flex direction="column" pb="10px" pt="2px" gap={1}>
                          <Flex
                            h="35px"
                            mb="-5px"
                            direction="row"
                            alignItems="baseline"
                            justifyContent="flex-start"
                          >
                            <Text
                              fontFamily="orb"
                              fontWeight={400}
                              display="inline-block"
                              color={Colors.SNOW_WHITE}
                              fontSize={{ base: 14, md: 20 }}
                            >
                              {formatNumber(planetStakes[p.planet], 4, 4)}
                            </Text>
                            <Text
                              ml={2}
                              fontFamily="orb"
                              fontWeight={600}
                              fontSize={{ base: 14, md: 20 }}
                              background={getPlanetGradient(convertPlanetIdToName(p.planet))}
                              backgroundClip="text"
                            >
                              TLM
                            </Text>
                          </Flex>
                          <Text
                            fontSize={12}
                            fontFamily="tlm"
                            fontWeight={600}
                            lineHeight={0.1}
                            color={Colors.JUMBO}
                          >
                            TLM in {capitalize(convertPlanetIdToName(p.planet))}
                          </Text>
                        </Flex>
                      </HStack>
                    </Flex>
                    {/* PLANETS STAKES */}
                    <Flex minW="250px" w="250px" justifyContent="end" gap="10px">
                      <Box
                        borderRadius="50%"
                        position="relative"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        boxSize="50px"
                        backgroundColor={Colors.RADICAL_RED}
                      >
                        <PlanetIconRGB
                          planetName={capitalize(convertPlanetIdToName(p.planet))}
                          style={{
                            top: 42,
                            bottom: 0,
                            zIndex: 3,
                            right: 2,
                            width: 48,
                            height: 48,
                            paddingRight: '2px',
                            paddingBottom: '2px',
                          }}
                        />
                      </Box>
                      <Flex flexDirection="column" pt="2px" w="160px">
                        <Flex>
                          <Text fontSize={{ base: 14, md: 20 }} fontFamily="orb">
                            {formatNumber(p.staked, 4, 4)}
                          </Text>
                          <Text
                            ml={2}
                            fontFamily="orb"
                            fontWeight={600}
                            fontSize={{ base: 14, md: 20 }}
                            background={Colors.RADICAL_RED}
                            backgroundClip="text"
                          >
                            TLM
                          </Text>
                        </Flex>
                        <Flex alignItems="center" gap={1} mt="-5px">
                          <Text
                            pt="2px"
                            fontSize={12}
                            fontFamily="tlm"
                            fontWeight={600}
                            lineHeight={0.1}
                            color={Colors.JUMBO}
                          >
                            Staked TLM in {capitalize(convertPlanetIdToName(p.planet))}
                          </Text>
                          <GlossaryInfoIcon
                            width={15}
                            glossaryId={TooltipLocations.GOVERNANCE_SIDEBAR_STAKED_TOKENS}
                          />
                        </Flex>
                      </Flex>
                    </Flex>
                  </Flex>
                )
              )}
            </>
          )}
        </Flex>
      </Flex>
      <Flex w="100%" h="100%" justifyContent="center" flexWrap="wrap">
        <Flex direction="column" alignItems="start" w="100%" rowGap="15px">
          {userDaoBalances && (
            <>
              {map(
                filter(Object.entries(userDaoBalances), ([planet]) => planet !== 'testa'),
                ([planet, data]) => (
                  <Flex
                    w="100%"
                    key={v4()}
                    rowGap="15px"
                    flexWrap="wrap"
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    {/* PLANETS TOKENS */}
                    <Flex minW="250px" w="250px">
                      <HStack w="100%" alignItems="center" justifyContent="start">
                        <Box
                          position="relative"
                          display="flex"
                          alignContent="center"
                          justifyContent="center"
                        >
                          <PlanetIcon
                            planetName={capitalize(convertPlanetIdToName(planet))}
                            style={{
                              top: 42,
                              bottom: 0,
                              zIndex: 3,
                              right: 10,
                              width: 48,
                              height: 48,
                            }}
                          />
                        </Box>
                        <Flex direction="column" pb="10px" pt="2px" gap={1}>
                          <Flex h="35px" mb="-5px" alignItems="baseline">
                            <Text
                              fontFamily="orb"
                              fontWeight={400}
                              color={Colors.SNOW_WHITE}
                              fontSize={{ base: 14, md: 20 }}
                            >
                              {data.stake_details.available_tlm_in_dao
                                ? formatNumber(
                                    get(
                                      data,
                                      'stake_details.available_tlm_in_dao',
                                      '0.0000 TLM'
                                    ).split(' ')[0],
                                    4,
                                    4
                                  )
                                : '0.0000'}
                            </Text>
                            <Text
                              ml={2}
                              fontFamily="orb"
                              fontWeight={600}
                              fontSize={{ base: 14, md: 20 }}
                              background={getPlanetGradient(convertPlanetIdToName(planet))}
                              backgroundClip="text"
                            >
                              TLM
                            </Text>
                          </Flex>
                          <Text
                            fontSize={12}
                            fontFamily="tlm"
                            fontWeight={600}
                            lineHeight={0.1}
                            color={Colors.JUMBO}
                          >
                            TLM in {capitalize(convertPlanetIdToName(planet))}
                          </Text>
                        </Flex>
                      </HStack>
                    </Flex>

                    {/* PLANETS STAKES */}
                    <Flex
                      minW="250px"
                      w="250px"
                      justifyContent={{ base: 'start', md: 'end' }}
                      gap="10px"
                    >
                      <Box
                        borderRadius="50%"
                        position="relative"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        boxSize="50px"
                        backgroundColor={Colors.RADICAL_RED}
                      >
                        <PlanetIconRGB
                          planetName={capitalize(convertPlanetIdToName(planet))}
                          style={{
                            top: 42,
                            bottom: 0,
                            zIndex: 3,
                            right: 2,
                            width: 48,
                            height: 48,
                            paddingRight: '2px',
                            paddingBottom: '2px',
                          }}
                        />
                      </Box>
                      <Flex flexDirection="column" pt="2px" w="160px">
                        <Flex>
                          <Text fontSize={{ base: 14, md: 20 }} fontFamily="orb">
                            {formatNumber(
                              get(data, 'stake_details.staked_amount', '0.0000 TLM'),
                              4,
                              4
                            )}
                          </Text>
                          <Text
                            ml={2}
                            fontFamily="orb"
                            fontWeight={600}
                            fontSize={{ base: 14, md: 20 }}
                            background={Colors.RADICAL_RED}
                            backgroundClip="text"
                          >
                            TLM
                          </Text>
                        </Flex>
                        <Flex alignItems="center" gap={1} mt="-5px">
                          <Text
                            pt="2px"
                            fontSize={12}
                            fontFamily="tlm"
                            fontWeight={600}
                            lineHeight={0.1}
                            color={Colors.JUMBO}
                          >
                            Staked TLM in {capitalize(convertPlanetIdToName(planet))}
                          </Text>
                          <GlossaryInfoIcon
                            width={15}
                            glossaryId={TooltipLocations.GOVERNANCE_SIDEBAR_STAKED_TOKENS}
                          />
                        </Flex>
                      </Flex>
                    </Flex>
                  </Flex>
                )
              )}
            </>
          )}
        </Flex>
      </Flex>
    </Flex>
  )
}
