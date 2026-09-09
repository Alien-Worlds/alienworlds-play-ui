import { useBreakpointValue } from '@alien-worlds/uikit'
import { StakeActions } from 'features/lore/components/StakeLore/StakeActions'
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
    <div className="flex flex-col gap-4">
      <div
        className="flex w-full flex-col gap-8 rounded-[20px] px-4 py-5 md:px-6 md:py-[30px] 2xl:px-9"
        style={{ backgroundColor: Colors.BLACK_SOLID_90 }}
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
          newDailyReward={state.newDailyReward}
        />
      </div>

      <StakeRewardsLore
        poolShare={poolShare}
        pendingRewards={pendingRewards}
        dailyReward={dailyReward}
        onClaimReward={handlers.onClaimReward}
      />
    </div>
  )
}
export { StakeLore }
