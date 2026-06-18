import { LandOccupancyIcon, TotalVotePowerPlusIcon, TriliumIcon } from '@alien-worlds/icons'
import { Box, Flex, Grid, GridItem, Text } from '@chakra-ui/react'
import { Colors } from 'shared/util/colors'
import { formatNumber } from 'shared/util/numbers'

type StakeRewardsLoreProps = {
  poolShare: number
  pendingRewards: number
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

export function StakeRewardsLore({
  dailyReward,
  poolShare,
  pendingRewards,
}: StakeRewardsLoreProps) {
  return (
    <Flex
      backgroundColor={Colors.BLACK_SOLID_90}
      borderRadius="20px"
      px={{ base: '16px', md: '24px', '2xl': '36px' }}
      py={{ base: '20px', md: '30px' }}
      width="100%"
      flexDirection="column"
      gap={8}
    >
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
            <Flex
              gap="4px"
              direction="column"
              alignSelf={{ base: 'flex-start', lg: 'center' }}
              minW="140px"
            >
              <Text
                fontSize={{ base: '22px', lg: '20px', '2xl': '30px' }}
                fontWeight="600"
                color={Colors.SNOW_WHITE}
              >
                Rewards
              </Text>
              <Text fontSize="16px" color={Colors.SILVER}>
                Claim when accrued
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
            <LandOccupancyIcon
              color={Colors.SNOW_WHITE}
              boxSize={40}
              style={{ position: 'relative' }}
            />
            <Flex direction="column" justifyContent="end">
              <Text {...metricValueStyles}>{formatNumber(poolShare ?? 0, 4, 4)}</Text>
              <Text {...metricLabelStyles} color={Colors.DI_SERRIA}>
                Your Pool Share
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

        <GridItem alignSelf="center">
          <Flex gap={3}>
            <TriliumIcon boxSize="42px" color={Colors.PUNCH} />
            <Flex direction="column" justifyContent="end">
              <Text {...metricValueStyles} color={Colors.SNOW_WHITE}>
                {formatNumber(pendingRewards ?? 0, 4, 4)}
              </Text>
              <Text {...metricLabelStyles} color={Colors.PUNCH}>
                Unclaimed Rewards
              </Text>
            </Flex>
          </Flex>
        </GridItem>
      </Grid>
    </Flex>
  )
}
