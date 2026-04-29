import { VFC } from 'react'

import { LockIcon, MiningIcon, MissionsIcon, ShardsIcon, WaxIcon } from '@alien-worlds/icons'
import { Button } from '@alien-worlds/uikit'
import { Box, Flex, Icon, Text } from '@chakra-ui/react'
import { GlossaryInfoIcon } from 'features/glossary/components/GlossaryInfoIcon/GlossaryInfoIcon'
import { TooltipLocations } from 'features/glossary/utils/glossaryConst'
import {
  ConnectWalletBtn,
  useWalletConnect,
} from 'features/missions/components/MissionsActions/MissionsActions'
import { StakedTriliumBalance } from 'features/missions/components/StakedTriliumBalance/StakedTriliumBalance'
import { TriliumBSCBalance } from 'features/missions/components/TriliumBSCBalance/TriliumBSCBalance'
import { LoadingSpinner } from 'features/syndicates/components/LoadingSpinner/LoadingSpinner'
import { useUserDaoBalances } from 'graphql/hooks/useUserDaoBalances'
import { useWalletDetails } from 'graphql/hooks/useWalletDetails'
import { UserBalancesResponse, WalletDetailsResponse } from 'graphql/types'
import { get, sumBy } from 'lodash'
import { useNavigate } from 'react-router-dom'
import { Colors } from 'shared/util/colors'
import { config } from 'shared/util/config'
import { formatUserPointsWithDecimal } from 'shared/util/helpers'
import { formatNumber } from 'shared/util/numbers'
import { useAppState } from 'store'
import { PagePath } from 'store/main/types'
export function sumStakedAmount(userBalances: UserBalancesResponse): number {
  return sumBy(Object.values(userBalances), (planet) =>
    parseFloat(planet?.stake_details?.staked_amount?.split(' ')[0] || '0')
  )
}

export const WalletsBalances: VFC = () => {
  const {
    wax: { walletId },
  } = useAppState()
  const { walletDetails, loading }: { walletDetails: WalletDetailsResponse; loading: boolean } =
    useWalletDetails(walletId)
  const wallet = useWalletConnect()

  const navigate = useNavigate()
  const {
    userDaoBalances,
    loading: loadingUserDaoBalances,
  }: { userDaoBalances: UserBalancesResponse; loading: boolean } = useUserDaoBalances({ walletId })

  if (loading || loadingUserDaoBalances) return <LoadingSpinner />
  const totalDAOsStakes = sumStakedAmount(userDaoBalances)

  return (
    <Flex
      h="100%"
      py="25px"
      gap="35px"
      minW="200px"
      flexWrap="wrap"
      direction="column"
      w={{ base: '100%', '2xl': '45%' }}
      pr={{ base: '0px', '2xl': '30px' }}
    >
      {/* MINING WALLET */}
      <Flex
        w="100%"
        direction="column"
        alignItems="start"
        paddingInline={{ base: '5%', '2xl': '0px' }}
      >
        <Box mb={4} alignSelf={{ base: 'start', md: 'start' }}>
          <Flex>
            <MiningIcon color={Colors.GRAY} boxSize="20px" />

            <Text marginInline={2} fontSize="small" color={Colors.GRAY} fontFamily="Orbitron">
              Mining Wallet
            </Text>
            <GlossaryInfoIcon
              width={16}
              height={16}
              glossaryId={TooltipLocations.PROFILE_MINING_WALLET}
            />
          </Flex>
        </Box>
        <Flex
          w="100%"
          gap="20px"
          flexWrap="wrap"
          alignItems="start"
          justifyContent={{ base: 'start', sm: 'space-between' }}
        >
          {/* Wax Trilium */}
          <Flex justifyContent="start" gap={3}>
            <WaxIcon color={Colors.DI_SERRIA} boxSize={40} style={{ position: 'relative' }} />
            <Flex direction="column" justifyContent="end">
              <Text lineHeight="0.8" fontFamily="Orbitron" fontSize={{ base: '16px', md: '20px' }}>
                {formatNumber(walletDetails.tlm_balance, 4, 4)}
              </Text>
              <Text
                fontFamily="Titillium Web"
                fontWeight="bold"
                fontSize={12}
                letterSpacing="0.1em"
                color={Colors.DI_SERRIA}
              >
                WAX Trillium
              </Text>
            </Flex>
          </Flex>
          {/* Staked Wax Trilium */}
          {totalDAOsStakes > 0 && (
            <Flex
              justifyContent="start"
              color={Colors.RADICAL_RED}
              gap={3}
              minW={{ base: '200px', '2xl': '235px' }}
            >
              <Box w={10} position="relative" fill={Colors.RADICAL_RED}>
                <Icon
                  as={LockIcon}
                  boxSize={30}
                  height="auto"
                  position="absolute"
                  left={5}
                  bottom={4}
                  zIndex={2}
                />
                <WaxIcon boxSize={40} color={Colors.RADICAL_RED} />
              </Box>
              <Flex direction="column" justifyContent="end">
                <Text
                  lineHeight="0.8"
                  fontFamily="Orbitron"
                  color={Colors.SNOW_WHITE}
                  fontSize={{ base: '16px', md: '20px' }}
                >
                  {formatNumber(totalDAOsStakes, 4, 4)}
                </Text>
                <Text
                  fontSize={12}
                  fontWeight="bold"
                  letterSpacing="0.1em"
                  color={Colors.RADICAL_RED}
                  fontFamily="Titillium Web"
                >
                  Staked WAX Trillium
                </Text>
              </Flex>
            </Flex>
          )}
        </Flex>
      </Flex>
      {/* SHARDS */}
      <Flex
        w="100%"
        direction="column"
        alignItems="start"
        paddingInline={{ base: '5%', '2xl': '0px' }}
      >
        <Box mb={4} alignSelf={{ base: 'start', md: 'start' }}>
          <Flex>
            <ShardsIcon color={Colors.GRAY} boxSize="20px" />
            <Text ml={2} mb={1} fontSize="small" color={Colors.GRAY} fontFamily="Orbitron">
              Shards
            </Text>
          </Flex>
        </Box>
        <Flex
          w="100%"
          gap="20px"
          flexWrap="wrap"
          alignItems="start"
          justifyContent={{ base: 'start', sm: 'space-between' }}
        >
          {/* Current Shards */}
          <Flex justifyContent="start">
            <Flex alignItems="center" justifyContent="center" h="30px" mr="10px">
              <ShardsIcon boxSize="40px" color={Colors.SNOW_WHITE} />
            </Flex>

            <Flex direction="column" alignItems="start">
              <Text
                ml="5px"
                fontWeight={400}
                fontFamily="orb"
                textAlign="center"
                letterSpacing="0.1em"
                color={Colors.SNOW_WHITE}
                fontSize={{ base: '16px', md: '20px' }}
              >
                {formatUserPointsWithDecimal(
                  get(walletDetails, 'userpoints_details.redeemable_points', 0)
                )}
              </Text>
            </Flex>
          </Flex>
          {/* Use Shards */}
          <Flex
            w={{ base: '100%', sm: 'auto' }}
            minW={{ base: '100%', md: 'max-content', '2xl': '235px' }}
            maxW={{ base: '100%', md: 'max-content', '2xl': '235px' }}
            justifyContent={{ base: 'center', '2xl': 'start' }}
          >
            <Button
              size="md"
              fontSize={16}
              isFullWidth
              variant="primary"
              leftIcon={<ShardsIcon boxSize="25px" color={Colors.SNOW_WHITE} />}
              onClick={() => {
                navigate(PagePath.Outpost)
              }}
            >
              Use Shards
            </Button>
          </Flex>
        </Flex>
      </Flex>
      {/* MISSIONS */}
      <Flex
        w="100%"
        direction="column"
        alignItems="start"
        paddingInline={{ base: '5%', '2xl': '0px' }}
      >
        <Box mb={4} alignSelf={{ base: 'start', md: 'start' }}>
          <Flex>
            <MissionsIcon color={Colors.GRAY} boxSize="20px" />
            <Flex gap="7px">
              <Text ml={2} fontSize="small" color={Colors.GRAY} fontFamily="Orbitron">
                Missions BSC Wallets
              </Text>
              <GlossaryInfoIcon
                width={16}
                height={16}
                glossaryId={TooltipLocations.PROFILE_MISSIONS_WALLET}
              />
            </Flex>
          </Flex>
        </Box>
        <Flex
          w="100%"
          gap="20px"
          flexWrap="wrap"
          alignItems="start"
          justifyContent={{ base: 'center', '2xl': 'start' }}
        >
          {(wallet.connectedWallets.length === 0 || wallet.connecting) && (
            <Flex
              w="100%"
              alignItems="start"
              justifyContent={{ base: 'center', sm: 'space-between' }}
            >
              <ConnectWalletBtn onClick={() => wallet.connect()} />
            </Flex>
          )}
          {wallet.connectedChain &&
            parseInt(wallet.connectedChain.id, 16) === config.BscChainId && (
              <Flex
                w="100%"
                gap="20px"
                flexWrap="wrap"
                alignItems="start"
                justifyContent={{ base: 'start', sm: 'space-between' }}
              >
                <Flex justifyContent="start" ml="-10px" minW="200px">
                  <TriliumBSCBalance />
                </Flex>
                <Flex justifyContent="start" minW={{ base: '200px', md: '235px' }} gap={3}>
                  <StakedTriliumBalance />
                </Flex>
              </Flex>
            )}
        </Flex>
      </Flex>
    </Flex>
  )
}
