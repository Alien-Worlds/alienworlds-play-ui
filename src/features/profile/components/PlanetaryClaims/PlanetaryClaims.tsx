import { useState } from 'react'

import { DTALIcon, LockIcon2, ProfitsIcon, TriliumIcon } from '@alien-worlds/icons'
import { Button } from '@alien-worlds/uikit'
import { useApolloClient } from '@apollo/client'
import { Box, Flex, HStack, Text, useBreakpointValue } from '@chakra-ui/react'
import { GlossaryInfoIcon } from 'features/glossary/components/GlossaryInfoIcon/GlossaryInfoIcon'
import { TooltipLocations } from 'features/glossary/utils/glossaryConst'
import { LoadingSpinner } from 'features/syndicates/components/LoadingSpinner/LoadingSpinner'
import { useUserDaoBalances } from 'graphql/hooks/useUserDaoBalances'
import { useWalletDetails } from 'graphql/hooks/useWalletDetails'
import { DAO_WALLET_DETAILS_QUERY } from 'graphql/queries/daoWalletDetails'
import { USER_DAO_BALANCES } from 'graphql/queries/userDaoBalances'
import { UserBalancesResponse, WalletDetailsResponse } from 'graphql/types'
import { capitalize, filter, get, map, split } from 'lodash'
import { Colors } from 'shared/util/colors'
import { convertPlanetIdToName, getMiningRewardsTimeInHours } from 'shared/util/helpers'
import { PlanetIconRGB } from 'shared/util/icons'
import { formatNumber } from 'shared/util/numbers'
import { useActions, useAppState } from 'store'
import { v4 } from 'uuid'

export const PlanetaryClaims = () => {
  const {
    wax: {
      tryClaimUnstake,
      tryClaimMiningRewards,
      tryClaimLandownerAllowance,
      tryClaimLandownerCommissions,
    },
  } = useActions()
  const {
    wax: { walletId },
  } = useAppState()
  const client = useApolloClient()
  const [isClaimingTokens, setIsClaimingTokens] = useState(false)
  const [isClaimingMiningRewards, setIsClaimingMiningRewards] = useState(false)
  const [isClaimingLandownerAllowance, setIsClaimingLandownerAllowance] = useState(false)
  const [isClaimingLandownerCommissions, setIsClaimingLandownerCommissions] = useState(false)
  const {
    walletDetails,
    loading: wallletDetailsLoading,
  }: { walletDetails: WalletDetailsResponse; loading: boolean } = useWalletDetails(walletId)

  const claimMiningRewardsTimeInHours = getMiningRewardsTimeInHours(
    get(walletDetails, 'mining_claim.last_claim_time', null)
  )
  const claimableMiningRewards = get(walletDetails, 'mining_claim.amount', '0.0000 TLM')
  const claimableLandownerCommissions = get(walletDetails, 'land_comms.amount', '0.0000 TLM')
  const claimableLandownerAllowance = get(walletDetails, 'land_ratings_payout', '0.0000 TLM')
  const {
    userDaoBalances,
    loading: userDaoBalancesLoading,
  }: { userDaoBalances: UserBalancesResponse; loading: boolean } = useUserDaoBalances({
    walletId: walletId,
  })

  const getButtonVariant = () => {
    let variant

    if (claimMiningRewardsTimeInHours > 0) variant = 'beryllium'
    else variant = 'lithium'

    return variant
  }

  const getButtonDisabled = () => {
    if (
      !claimableMiningRewards ||
      claimMiningRewardsTimeInHours > 0 ||
      claimableMiningRewards === '0.0000 TLM' ||
      isClaimingMiningRewards
    )
      return true

    return false
  }

  const getButtonColor = () => {
    let color: string
    if (
      !claimableMiningRewards ||
      claimableMiningRewards === '0.0000 TLM' ||
      claimMiningRewardsTimeInHours > 0
    )
      color = Colors.MID_GRAY
    else color = Colors.SNOW_WHITE

    return color
  }

  const getButtonText = () => {
    let text: string
    if (claimMiningRewardsTimeInHours > 0) text = '0 TLM'
    else text = 'Claim TLM'

    return text
  }

  const getClaimIconColor = () => {
    let color: string
    if (claimMiningRewardsTimeInHours > 0) color = Colors.DARK_GRAY
    else color = Colors.SNOW_WHITE

    return color
  }
  const currentButtonMinWidth = useBreakpointValue({ base: '200px', sm: '235px' })

  if (wallletDetailsLoading || userDaoBalancesLoading) return <LoadingSpinner />
  return (
    <Flex
      w="100%"
      direction="column"
      alignItems="start"
      alignSelf="center"
      paddingInline={{ base: '5%', '2xl': '0px' }}
    >
      <Box mb={4} alignSelf={{ base: 'start', md: 'start' }}>
        <HStack>
          <TriliumIcon color={Colors.GRAY} boxSize="20px" />
          <Text ml={2} fontSize="small" color={Colors.GRAY} fontFamily="orb">
            Claims
          </Text>
        </HStack>
      </Box>
      <Flex direction="column" gap="15px" w="100%">
        {/* Mining Reward */}
        <Flex
          w="100%"
          pb="10px"
          gap="15px"
          flexWrap="wrap"
          alignItems="start"
          justifyContent={{ base: 'start', sm: 'space-between' }}
        >
          <Flex minW={{ base: '200px', sm: '235px' }}>
            <Flex pr={5} pt={2}>
              <TriliumIcon boxSize={40} color={getClaimIconColor()} />
              {claimMiningRewardsTimeInHours > 0 && (
                <Text
                  w="60px"
                  fontFamily="orb"
                  fontWeight={600}
                  position="absolute"
                  letterSpacing="1px"
                  color={Colors.RADICAL_RED}
                  fontSize={{ base: 16, md: 20 }}
                  pt={{ base: '10px', md: '5px' }}
                  ml={claimMiningRewardsTimeInHours > 9 ? '-3px' : '8px'}
                >
                  {claimMiningRewardsTimeInHours}h
                </Text>
              )}
            </Flex>
            <Flex direction="column" justifyContent="center" gap={1} pt="2px">
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
                  fontSize={{ base: 16, md: 20 }}
                >
                  {formatNumber(claimableMiningRewards, 4, 4)}
                </Text>
                <Text
                  ml={2}
                  fontFamily="orb"
                  fontWeight={600}
                  color={Colors.PERSIAN_GREEN}
                  fontSize={{ base: 16, md: 20 }}
                >
                  TLM
                </Text>
              </Flex>
              <Text
                mt="-1px"
                fontSize={12}
                fontFamily="tlm"
                fontWeight={600}
                lineHeight={0.1}
                color={Colors.JUMBO}
              >
                Mining Reward
              </Text>
            </Flex>
          </Flex>
          <Flex
            ml={{ base: 0, md: 'auto' }}
            justifyContent="center"
            width={{ base: '100%', md: 'max-content' }}
          >
            {claimMiningRewardsTimeInHours > 0 && (
              <Text
                fontFamily="orb"
                fontWeight={600}
                position="absolute"
                letterSpacing="1px"
                color={Colors.RADICAL_RED}
                pt={{ base: '7px', md: '5px' }}
                fontSize={{ base: 16, md: 20 }}
                pr={{ base: '100', sm: '170px' }}
                ml={{
                  base: claimMiningRewardsTimeInHours > 9 ? '-20px' : '-15px',
                  sm: claimMiningRewardsTimeInHours > 9 ? '25px' : '13px',
                }}
              >
                {claimMiningRewardsTimeInHours}h
              </Text>
            )}
            {claimMiningRewardsTimeInHours > 0 && (
              <Flex mr="-10px" mt="-5px">
                <LockIcon2 boxSize="20px" color={Colors.RADICAL_RED} />
              </Flex>
            )}
            <Button
              size="md"
              fontSize={16}
              fontWeight={400}
              isFullWidth
              justifyContent="center"
              color={getButtonColor()}
              variant={getButtonVariant()}
              loadingText="Claiming TLM..."
              disabled={getButtonDisabled()}
              isLoading={isClaimingMiningRewards}
              cursor={getButtonDisabled() ? 'not-allowed' : 'pointer'}
              onClick={async () => {
                setIsClaimingMiningRewards(true)
                await tryClaimMiningRewards()
                setTimeout(() => setIsClaimingMiningRewards(false), 3000)
              }}
              minWidth={currentButtonMinWidth}
            >
              {getButtonText()}
            </Button>
          </Flex>
        </Flex>
        {/* Commision Reward */}
        <Flex
          w="100%"
          gap="15px"
          flexWrap="wrap"
          alignItems="start"
          justifyContent={{ base: 'start', sm: 'space-between' }}
        >
          <Flex minW={{ base: '200px', sm: '235px' }}>
            <Box pr={3} pt={2}>
              <ProfitsIcon boxSize={48} color={Colors.SNOW_WHITE} />
            </Box>
            <Flex direction="column" justifyContent="center" gap={1} pt="2px">
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
                  fontSize={{ base: 16, md: 20 }}
                >
                  {formatNumber(claimableLandownerCommissions, 4, 4)}
                </Text>
                <Text
                  ml={2}
                  fontFamily="orb"
                  fontWeight={600}
                  color={Colors.PERSIAN_GREEN}
                  fontSize={{ base: 16, md: 20 }}
                >
                  TLM
                </Text>
              </Flex>
              <Text
                mt="-1px"
                fontSize={12}
                fontFamily="tlm"
                fontWeight={600}
                lineHeight={0.1}
                color={Colors.JUMBO}
              >
                Commission Reward
              </Text>
            </Flex>
          </Flex>
          <Flex
            ml={{ base: 0, md: 'auto' }}
            justifyContent="center"
            width={{ base: '100%', md: 'max-content' }}
          >
            <Button
              size="md"
              fontSize={16}
              fontWeight={400}
              isFullWidth
              variant="lithium"
              cursor={
                !claimableLandownerCommissions ||
                claimableLandownerCommissions === '0.0000 TLM' ||
                isClaimingLandownerCommissions
                  ? 'not-allowed'
                  : 'pointer'
              }
              justifyContent="center"
              loadingText="Claiming TLM..."
              minWidth={currentButtonMinWidth}
              isLoading={isClaimingLandownerCommissions}
              onClick={async () => {
                setIsClaimingLandownerCommissions(true)
                await tryClaimLandownerCommissions()
                setTimeout(() => setIsClaimingLandownerCommissions(false), 3000)
              }}
              disabled={
                !claimableLandownerCommissions ||
                claimableLandownerCommissions === '0.0000 TLM' ||
                isClaimingLandownerCommissions
              }
            >
              Claim TLM
            </Button>
          </Flex>
        </Flex>
        {/* DTAL reward */}
        <Flex
          w="100%"
          gap="15px"
          flexWrap="wrap"
          alignItems="start"
          justifyContent={{ base: 'start', sm: 'space-between' }}
        >
          <Flex minW={{ base: '200px', sm: '235px' }}>
            <Box pr={3} pt={2}>
              <DTALIcon boxSize={48} color={Colors.SNOW_WHITE} />
            </Box>
            <Flex direction="column" justifyContent="center" gap={1}>
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
                  fontSize={{ base: 16, md: 20 }}
                >
                  {formatNumber(claimableLandownerAllowance, 4, 4)}
                </Text>
                <Text
                  ml={2}
                  fontFamily="orb"
                  fontWeight={600}
                  color={Colors.PERSIAN_GREEN}
                  fontSize={{ base: 16, md: 20 }}
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
                DTAL Reward
              </Text>
            </Flex>
          </Flex>
          <Flex
            ml={{ base: 0, md: 'auto' }}
            justifyContent="center"
            width={{ base: '100%', md: 'max-content' }}
          >
            <Button
              size="md"
              fontSize={16}
              isFullWidth
              fontWeight={400}
              variant="lithium"
              justifyContent="center"
              loadingText="Claiming TLM..."
              minWidth={currentButtonMinWidth}
              isLoading={isClaimingLandownerAllowance}
              onClick={async () => {
                setIsClaimingLandownerAllowance(true)
                await tryClaimLandownerAllowance()
                setTimeout(() => setIsClaimingLandownerAllowance(false), 3000)
              }}
              disabled={
                !claimableLandownerAllowance ||
                claimableLandownerAllowance === '0.0000 TLM' ||
                isClaimingLandownerAllowance
              }
            >
              Claim TLM
            </Button>
          </Flex>
        </Flex>
        {/* STAKES WITH TIME RELEASE */}

        {map(
          filter(
            Object.entries(userDaoBalances),
            ([, data]) => data.stake_details.unstakes.length > 0
          ),
          ([planet, data]) => (
            <Flex
              w="100%"
              key={v4()}
              flexWrap="wrap"
              py={{ base: '20px', sm: '0px' }}
              columnGap={{ base: '22%', sm: '0px' }}
              justifyContent={{ base: 'center', sm: 'space-between' }}
              alignItems="center"
            >
              <Flex
                gap={{ base: '0px', sm: '15px' }}
                direction={{ base: 'column', sm: 'row' }}
                flex={1}
              >
                {/* PLANETS STAKES */}
                <Flex
                  pb="10px"
                  gap="15px"
                  minW={{ base: '220px', md: '300px' }}
                  alignItems="center"
                >
                  <Box
                    position="relative"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    boxSize="50px"
                    backgroundColor={Colors.RADICAL_RED}
                    borderRadius="50%"
                  >
                    <PlanetIconRGB
                      planetName={capitalize(convertPlanetIdToName(planet))}
                      style={{
                        top: 42,
                        bottom: 0,
                        zIndex: 3,
                        right: 10,
                        width: 48,
                        height: 48,
                        paddingRight: '2px',
                        paddingBottom: '2px',
                      }}
                    />
                  </Box>
                  {/* STAKE AMOUNT */}
                  <Flex direction="column" w="190px" gap={1} pt="2px">
                    <Flex>
                      <Text fontSize={{ base: 14, md: 20 }} fontFamily="orb">
                        {formatNumber(data.stake_details.unstakes[0].stake, 4, 4)}
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
                        {/* Extracting token symbol */}
                      </Text>
                    </Flex>
                    <Flex alignItems="center" gap={1} mt="-7px">
                      <Text fontSize={12} fontFamily="tlm" fontWeight={600} color={Colors.JUMBO}>
                        Tokens in {capitalize(planet)} Release Date
                      </Text>
                      <GlossaryInfoIcon
                        width={15}
                        glossaryId={TooltipLocations.GOVERNANCE_SIDEBAR_STAKED_TOKENS}
                      />
                    </Flex>
                  </Flex>
                </Flex>
              </Flex>

              {/* STAKE RELEASE TIME (Centered) */}
              <Flex
                direction="column"
                alignItems={{ base: 'start', md: 'center' }}
                textAlign="center"
                flex={1}
              >
                <Text fontSize={14} color={Colors.SNOW_WHITE} fontFamily="tlm">
                  {split(data.stake_details.unstakes[0].release_time, 'T')?.[0]?.replaceAll(
                    '-',
                    '/'
                  )}
                </Text>
                <Text fontSize={14} color={Colors.GRAY} fontFamily="tlm">
                  {split(data.stake_details.unstakes[0].release_time, 'T')?.[1]} (UTC)
                </Text>
              </Flex>

              {/* CLAIM TOKENS BUTTON */}
              <Flex
                p={{ base: 3, md: 0 }}
                justifyContent="center"
                mr={{ base: -1, md: 0 }}
                ml={{ base: 0, md: 'auto' }}
                width={{ base: '100%', md: 'max-content' }}
              >
                <Button
                  isFullWidth
                  size="md"
                  fontSize={16}
                  fontWeight={400}
                  variant="lithium"
                  justifyContent="center"
                  disabled={isClaimingTokens}
                  isLoading={isClaimingTokens}
                  loadingText="Claiming..."
                  onClick={async () => {
                    setIsClaimingTokens(true)
                    await tryClaimUnstake('4,' + data.stake_details.dao_token_balance.split(' ')[1])
                    await client.refetchQueries({
                      include: [DAO_WALLET_DETAILS_QUERY, USER_DAO_BALANCES],
                    })
                    setTimeout(() => setIsClaimingTokens(false), 3000)
                  }}
                  minWidth={currentButtonMinWidth}
                >
                  Claim TLM
                </Button>
              </Flex>
            </Flex>
          )
        )}
      </Flex>
    </Flex>
  )
}
