import { Flex, useBreakpointValue } from '@chakra-ui/react'
import { StakeActions } from 'features/lore/components/StakeLore/StakeActions'
import { StakeDailyRewardBanner } from 'features/lore/components/StakeLore/StakeDailyRewardBanner'
import { StakeMetrics } from 'features/lore/components/StakeLore/StakeMetrics'
import { StakeRewardsLore } from 'features/lore/components/StakeLore/StakeRewardsLore'
import { useStakeLore } from 'features/lore/hooks/useStakeLore'
import { LoadingSpinner } from 'features/syndicates/components/LoadingSpinner/LoadingSpinner'
import { Colors } from 'shared/util/colors'
import { useScreenSize } from 'shared/util/hooks'

const StakeLore = ({ currentNumber }: { currentNumber: number }) => {
  const { isMobile, isDesktop } = useScreenSize()
  const isFullWidth =
    useBreakpointValue({
      base: true,
      md: false,
    }) ?? false
  const {
    walletId,
    walletBalance,
    stakedAmount,
    tlmPoolSize,
    poolShare,
    pendingRewards,
    dailyReward,
    handlers,
    state,
    isLoading,
  } = useStakeLore()

  if (isLoading) return <LoadingSpinner />

  return (
    <Flex direction="column" gap={4}>
      <Flex
        backgroundColor={Colors.BLACK_SOLID_90}
        borderRadius="20px"
        px={{ base: '16px', md: '24px', '2xl': '36px' }}
        py={{ base: '20px', md: '30px' }}
        width="100%"
        flexDirection="column"
        gap={8}
      >
        <StakeMetrics
          walletId={walletId}
          walletBalance={walletBalance}
          stakedAmount={stakedAmount}
          tlmPoolSize={tlmPoolSize}
          currentVotePower={currentNumber}
          dailyReward={dailyReward}
        />

        <StakeActions
          onSubmitStake={handlers.onSubmitStake}
          onUnstakeAll={handlers.onUnstakeAll}
          onSubmitLore={handlers.onSubmitLore}
          onStakeInputChange={handlers.onChangeStakeInput}
          isMobile={isMobile}
          isDesktop={isDesktop}
          isFullWidth={isFullWidth}
          walletBalance={walletBalance}
        />
      </Flex>
      <StakeDailyRewardBanner newDailyReward={state.newDailyReward} />

      <StakeRewardsLore
        poolShare={poolShare}
        pendingRewards={pendingRewards}
        dailyReward={dailyReward}
      />
    </Flex>
  )
}
export { StakeLore }
