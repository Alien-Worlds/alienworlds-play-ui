import { InfoIcon, TotalVotePowerIcon } from '@alien-worlds/icons'
import { Hide, Flex, Text } from '@chakra-ui/react'
import { Colors } from 'shared/util/colors'

type StakeDailyRewardBannerProps = {
  newDailyReward: string
}

export function StakeDailyRewardBanner({ newDailyReward }: StakeDailyRewardBannerProps) {
  return (
    <>
      <Hide below="md">
        <Flex
          bg={Colors.DODGE_BLUE}
          width="100%"
          height="48px"
          borderRadius="8px"
          justifyContent="center"
          alignItems="center"
          gap={2}
          padding={4}
        >
          <InfoIcon boxSize="26px" />

          <Text fontSize="16px" fontWeight={400}>
            New total
          </Text>
          <Text fontSize="16px" fontWeight={700}>
            Daily VP Reward
          </Text>
          <TotalVotePowerIcon boxSize="24px" color={Colors.SNOW_WHITE} />
          <Text fontSize="18px">{newDailyReward}</Text>
        </Flex>
      </Hide>

      <Hide above="md">
        <Flex
          bg={Colors.DODGE_BLUE}
          width="100%"
          borderRadius="8px"
          justifyContent="center"
          gap={2}
          padding="12px"
          direction="column"
        >
          <Flex width="100%" justifyContent="space-between">
            <Flex gap={1}>
              <Text fontSize="16px" fontWeight={400}>
                New total
              </Text>
              <Text fontSize="16px" fontWeight={700}>
                Daily VP Reward:
              </Text>
            </Flex>
            <InfoIcon boxSize="20px" />
          </Flex>

          <Flex justifyItems="center" alignItems="center" gap="8px">
            <TotalVotePowerIcon boxSize="24px" color={Colors.SNOW_WHITE} />
            <Text fontSize="18px">{newDailyReward}</Text>
          </Flex>
        </Flex>
      </Hide>
    </>
  )
}
