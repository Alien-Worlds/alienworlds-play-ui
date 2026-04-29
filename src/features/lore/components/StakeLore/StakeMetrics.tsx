import { LockIcon, TotalVotePowerIcon, TotalVotePowerPlusIcon, WaxIcon } from '@alien-worlds/icons'
import { Box, Flex, Grid, GridItem, Icon, Text } from '@chakra-ui/react'
import { Colors } from 'shared/util/colors'
import { formatNumber } from 'shared/util/numbers'

type StakeMetricsProps = {
  walletId: string
  walletBalance: number
  stakedAmount: number
  currentVotePower: number
  dailyReward: string
}

const metricLabelStyles = {
  fontFamily: 'Titillium Web',
  fontWeight: 'bold',
  fontSize: 12,
  letterSpacing: '0.1em',
} as const

const metricValueStyles = {
  lineHeight: '0.8',
  fontFamily: 'Orbitron',
  fontSize: { base: '16px', md: '18px', '2xl': '20px' },
} as const

export function StakeMetrics({
  walletId,
  walletBalance,
  stakedAmount,
  currentVotePower,
  dailyReward,
}: StakeMetricsProps) {
  return (
    <Grid
      gridTemplateColumns={{
        base: 'repeat(1,1fr)',
        md: 'repeat(2,1fr)',
        lg: 'repeat(3,1fr)',
        xl: 'repeat(5,1fr)',
      }}
      width="100%"
      gap={{ base: '25px', md: 8 }}
    >
      <GridItem alignSelf="center">
        <Flex
          gap={{ base: '20px', xl: 12, '2xl': 24 }}
          flexDirection={{ base: 'column', lg: 'row' }}
        >
          <Flex gap="4px" direction="column" alignSelf={{ base: 'flex-start', lg: 'center' }}>
            <Text
              fontSize={{ base: '22px', lg: '20px', '2xl': '30px' }}
              fontWeight="600"
              color={Colors.SNOW_WHITE}
            >
              Lore Balances
            </Text>
            <Text fontSize="16px" color={Colors.DI_SERRIA}>
              {walletId}
            </Text>
          </Flex>
          <Box
            backgroundColor={Colors.JUMBO}
            width={{ base: '100%', lg: '1px' }}
            height={{ base: '1px', lg: '88px' }}
          />
        </Flex>
      </GridItem>

      <GridItem alignSelf="center">
        <Flex gap={3}>
          <WaxIcon color={Colors.DI_SERRIA} boxSize={40} style={{ position: 'relative' }} />
          <Flex direction="column" justifyContent="end">
            <Text {...metricValueStyles}>{formatNumber(walletBalance ?? 0, 4, 4)}</Text>
            <Text {...metricLabelStyles} color={Colors.DI_SERRIA}>
              WAX Trillium
            </Text>
          </Flex>
        </Flex>
      </GridItem>

      <GridItem alignSelf="center">
        <Flex color={Colors.RADICAL_RED} gap={3} minW={{ base: '200px', '2xl': '235px' }}>
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
            <Text {...metricValueStyles} color={Colors.SNOW_WHITE}>
              {formatNumber(stakedAmount ?? 0, 4, 4)}
            </Text>
            <Text {...metricLabelStyles} color={Colors.RADICAL_RED}>
              Staked WAX Trillium
            </Text>
          </Flex>
        </Flex>
      </GridItem>

      <GridItem alignSelf="center">
        <Flex gap={3}>
          <TotalVotePowerIcon boxSize="42px" color={Colors.CARIBBEAN_GREEN} />
          <Flex direction="column" justifyContent="end">
            <Text {...metricValueStyles} color={Colors.SNOW_WHITE}>
              {currentVotePower}
            </Text>
            <Text {...metricLabelStyles} color={Colors.CARIBBEAN_GREEN}>
              Vote Power
            </Text>
          </Flex>
        </Flex>
      </GridItem>

      <GridItem alignSelf="center">
        <Flex gap={3}>
          <TotalVotePowerPlusIcon boxSize="42px" color={Colors.DODGE_BLUE} />
          <Flex direction="column" justifyContent="end">
            <Text {...metricValueStyles} color={Colors.SNOW_WHITE}>
              {dailyReward}
            </Text>
            <Text {...metricLabelStyles} color={Colors.DODGE_BLUE}>
              Daily VP Reward
            </Text>
          </Flex>
        </Flex>
      </GridItem>
    </Grid>
  )
}
