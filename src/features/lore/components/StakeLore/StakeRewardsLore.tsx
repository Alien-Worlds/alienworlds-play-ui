import {
  LandOccupancyIcon,
  TLMPoolSizeIcon,
  TotalVotePowerIcon,
  TotalVotePowerPlusIcon,
  TriliumIcon,
  TriliumLockIcon,
} from '@alien-worlds/icons'
import { Button } from '@alien-worlds/uikit'
import { Box, Flex, Grid, GridItem, Icon, Text } from '@chakra-ui/react'
import { Colors } from 'shared/util/colors'
import { formatNumber } from 'shared/util/numbers'

type StakeRewardsLoreProps = {
  poolShare: number
  pendingRewards: number
  dailyReward: string
  onClaimReward: () => Promise<void>
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

type GradientBadgeProps = {
  width?: string | number
  height?: string | number
  children?: React.ReactNode
}

function GradientBadge({ width = '64px', height = '24px', children }: GradientBadgeProps) {
  return (
    <Flex
      width={width}
      height={height}
      padding="6px 12px"
      justifyContent="center"
      alignItems="center"
      gap="6px"
      borderRadius="8px"
      border="1px solid #D1D1D3"
      background="linear-gradient(180deg, #9C33B6 0%, #4F60BC 48.96%, #4657A5 51.04%, #009BD4 79.17%)"
    >
      <Text
        fontFamily="Titillium Web"
        fontSize="12px"
        fontWeight="600"
        color={Colors.SNOW_WHITE}
        whiteSpace="nowrap"
      >
        {children}
      </Text>
    </Flex>
  )
}

export function StakeRewardsLore({
  dailyReward,
  poolShare,
  pendingRewards,
  onClaimReward,
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

        <GridItem alignSelf="center" justifySelf={{ base: 'start', xl: 'end' }}>
          <Button variant="secondary" size="lg" fontSize={18} onClick={onClaimReward}>
            Claim TLM Reward
          </Button>
        </GridItem>
      </Grid>

      <Grid
        gridTemplateColumns={{
          base: 'repeat(1,1fr)',
          md: 'repeat(2,1fr)',
          lg: 'repeat(3,1fr)',
          xl: 'repeat(4,1fr)',
        }}
        width="100%"
        gap={{ base: '25px', md: 8 }}
      >
        <GridItem alignSelf="center">
          <Flex
            borderColor={Colors.JUMBO}
            borderWidth="1px"
            borderRadius="20px"
            p="20px"
            height="200px"
            justifyContent="space-between"
            flexDirection="column"
          >
            <Flex gap="8px" alignItems="center">
              <TriliumIcon boxSize="36px" color={Colors.DI_SERRIA} />
              <Icon viewBox="0 0 25 8" color="#777778" boxSize="24px">
                <path
                  d="M0.5 3.18201C0.223858 3.18201 0 3.40586 0 3.68201C0 3.95815 0.223858 4.18201 0.5 4.18201V3.68201V3.18201ZM24.8536 4.03556C25.0488 3.8403 25.0488 3.52372 24.8536 3.32845L21.6716 0.146473C21.4763 -0.0487893 21.1597 -0.0487893 20.9645 0.146473C20.7692 0.341735 20.7692 0.658318 20.9645 0.85358L23.7929 3.68201L20.9645 6.51043C20.7692 6.7057 20.7692 7.02228 20.9645 7.21754C21.1597 7.4128 21.4763 7.4128 21.6716 7.21754L24.8536 4.03556ZM0.5 3.68201V4.18201H24.5V3.68201V3.18201H0.5V3.68201Z"
                  fill="#777778"
                />
              </Icon>
              <TriliumLockIcon boxSize="36px" color={Colors.RADICAL_RED} />
            </Flex>

            <Flex flexDirection="column" gap="4px" alignItems="start">
              <Text fontSize="16px" fontFamily="tlm" color={Colors.SNOW_WHITE} fontWeight="700">
                1. Stake TLM
              </Text>
              <Text fontSize="16px" fontFamily="tlm" color={Colors.SILVER}>
                Lock TLM to begin generating Vote Power{' '}
                <Box as="span" display="inline-flex" verticalAlign="-3px">
                  <TotalVotePowerIcon boxSize="16px" color={Colors.CARIBBEAN_GREEN} />
                </Box>
              </Text>
            </Flex>
          </Flex>
        </GridItem>
        <GridItem alignSelf="center">
          <Flex
            borderColor={Colors.JUMBO}
            borderWidth="1px"
            borderRadius="20px"
            p="20px"
            height="200px"
            justifyContent="space-between"
            flexDirection="column"
          >
            <Flex gap="8px" alignItems="center">
              <TotalVotePowerIcon boxSize="36px" color={Colors.CARIBBEAN_GREEN} />
              <Icon viewBox="0 0 25 8" color="#777778" boxSize="24px">
                <path
                  d="M0.5 3.18201C0.223858 3.18201 0 3.40586 0 3.68201C0 3.95815 0.223858 4.18201 0.5 4.18201V3.68201V3.18201ZM24.8536 4.03556C25.0488 3.8403 25.0488 3.52372 24.8536 3.32845L21.6716 0.146473C21.4763 -0.0487893 21.1597 -0.0487893 20.9645 0.146473C20.7692 0.341735 20.7692 0.658318 20.9645 0.85358L23.7929 3.68201L20.9645 6.51043C20.7692 6.7057 20.7692 7.02228 20.9645 7.21754C21.1597 7.4128 21.4763 7.4128 21.6716 7.21754L24.8536 4.03556ZM0.5 3.68201V4.18201H24.5V3.68201V3.18201H0.5V3.68201Z"
                  fill="#777778"
                />
              </Icon>
              <TotalVotePowerPlusIcon boxSize="36px" color={Colors.DODGE_BLUE} />
            </Flex>

            <Flex flexDirection="column" gap="4px" alignItems="start">
              <Text fontSize="16px" fontFamily="tlm" color={Colors.SNOW_WHITE} fontWeight="700">
                2. Generate VP
              </Text>
              <Flex gap="8px" alignItems="center">
                <Text fontSize="16px" fontFamily="tlm" color={Colors.SILVER}>
                  VP accumulates continuously while TLM remains staked
                </Text>
              </Flex>
            </Flex>
          </Flex>
        </GridItem>
        <GridItem alignSelf="center">
          <Flex
            borderColor={Colors.JUMBO}
            borderWidth="1px"
            borderRadius="20px"
            p="20px"
            height="200px"
            justifyContent="space-between"
            flexDirection="column"
          >
            <Flex gap="8px" alignItems="center">
              <TotalVotePowerIcon boxSize="36px" color={Colors.CARIBBEAN_GREEN} />
              <Icon viewBox="0 0 25 8" color="#777778" boxSize="24px">
                <path
                  d="M0.5 3.18201C0.223858 3.18201 0 3.40586 0 3.68201C0 3.95815 0.223858 4.18201 0.5 4.18201V3.68201V3.18201ZM24.8536 4.03556C25.0488 3.8403 25.0488 3.52372 24.8536 3.32845L21.6716 0.146473C21.4763 -0.0487893 21.1597 -0.0487893 20.9645 0.146473C20.7692 0.341735 20.7692 0.658318 20.9645 0.85358L23.7929 3.68201L20.9645 6.51043C20.7692 6.7057 20.7692 7.02228 20.9645 7.21754C21.1597 7.4128 21.4763 7.4128 21.6716 7.21754L24.8536 4.03556ZM0.5 3.68201V4.18201H24.5V3.68201V3.18201H0.5V3.68201Z"
                  fill="#777778"
                />
              </Icon>
              <GradientBadge>Vote</GradientBadge>
            </Flex>

            <Flex flexDirection="column" gap="4px" alignItems="start">
              <Text fontSize="16px" fontFamily="tlm" color={Colors.SNOW_WHITE} fontWeight="700">
                3. Vote on Proposals
              </Text>
              <Text fontSize="16px" fontFamily="tlm" color={Colors.SILVER}>
                Spend VP to vote and activate reward participation{' '}
                <Box as="span" display="inline-flex" verticalAlign="-3px">
                  <Icon viewBox="0 0 18 18">
                    <path
                      d="M7.7472 10.2529V9.36475V3.55994C4.51173 3.8137 1.94238 6.50993 1.94238 9.80884C1.94238 13.2664 4.73377 16.0577 8.19128 16.0577C11.4902 16.0577 14.1864 13.4884 14.4085 10.2529H8.63537H7.7472Z"
                      fill="white"
                    />
                    <path
                      d="M9.65047 1.94226C9.46014 1.94226 9.26982 2.0057 9.14294 2.13258C9.01606 2.25946 8.9209 2.41807 8.9209 2.60839V8.38148C8.9209 8.76213 9.2381 9.04761 9.58703 9.04761H15.3601C15.5504 9.04761 15.7408 8.98417 15.8676 8.82557C15.9945 8.69869 16.058 8.50836 16.058 8.31804C15.8042 4.95569 13.0445 2.19602 9.65047 1.94226ZM10.2849 7.71536V3.40139C12.4419 3.84548 14.1865 5.55838 14.6306 7.74708H10.2849V7.71536Z"
                      fill="white"
                    />
                  </Icon>
                </Box>
              </Text>
            </Flex>
          </Flex>
        </GridItem>
        <GridItem alignSelf="center">
          <Flex
            borderColor={Colors.JUMBO}
            borderWidth="1px"
            borderRadius="20px"
            p="20px"
            height="200px"
            justifyContent="space-between"
            flexDirection="column"
          >
            <Flex gap="8px" alignItems="center">
              <GradientBadge>Vote</GradientBadge>

              <Icon viewBox="0 0 25 8" color="#777778" boxSize="24px">
                <path
                  d="M0.5 3.18201C0.223858 3.18201 0 3.40586 0 3.68201C0 3.95815 0.223858 4.18201 0.5 4.18201V3.68201V3.18201ZM24.8536 4.03556C25.0488 3.8403 25.0488 3.52372 24.8536 3.32845L21.6716 0.146473C21.4763 -0.0487893 21.1597 -0.0487893 20.9645 0.146473C20.7692 0.341735 20.7692 0.658318 20.9645 0.85358L23.7929 3.68201L20.9645 6.51043C20.7692 6.7057 20.7692 7.02228 20.9645 7.21754C21.1597 7.4128 21.4763 7.4128 21.6716 7.21754L24.8536 4.03556ZM0.5 3.68201V4.18201H24.5V3.68201V3.18201H0.5V3.68201Z"
                  fill="#777778"
                />
              </Icon>
              <TLMPoolSizeIcon boxSize="36px" color={Colors.SNOW_WHITE} />
            </Flex>

            <Flex flexDirection="column" gap="4px" alignItems="start">
              <Text fontSize="16px" fontFamily="tlm" color={Colors.SNOW_WHITE} fontWeight="700">
                4. Earn TLM Rewards
              </Text>
              <Text fontSize="16px" fontFamily="tlm" color={Colors.SILVER}>
                Commit more VP to increase your share of TLM rewards{' '}
                <Box as="span" display="inline-flex" verticalAlign="-2px">
                  <TriliumIcon boxSize="16px" color={Colors.DI_SERRIA} />
                </Box>
              </Text>
            </Flex>
          </Flex>
        </GridItem>
      </Grid>
    </Flex>
  )
}
