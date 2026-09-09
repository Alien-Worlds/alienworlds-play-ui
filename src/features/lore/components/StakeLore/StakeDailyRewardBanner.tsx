import { InfoIcon, TotalVotePowerIcon } from '@alien-worlds/icons'
import { Colors } from 'shared/util/colors'

type StakeDailyRewardBannerProps = {
  newDailyReward: string
}

export function StakeDailyRewardBanner({ newDailyReward }: StakeDailyRewardBannerProps) {
  return (
    <>
      <div
        className="hidden h-12 w-full items-center justify-center gap-2 rounded-lg p-4 md:flex"
        style={{ backgroundColor: Colors.DODGE_BLUE }}
      >
        <InfoIcon boxSize="26px" className="shrink-0" />

        <p className="text-[16px] font-normal">New total</p>
        <p className="text-[16px] font-bold">Daily VP Reward</p>
        <TotalVotePowerIcon boxSize="24px" color={Colors.SNOW_WHITE} className="shrink-0" />
        <p className="text-[18px]">{newDailyReward}</p>
      </div>

      <div
        className="flex w-full flex-col justify-center gap-2 rounded-lg p-3 md:hidden"
        style={{ backgroundColor: Colors.DODGE_BLUE }}
      >
        <div className="flex w-full justify-between">
          <div className="flex gap-1">
            <p className="text-[16px] font-normal">New total</p>
            <p className="text-[16px] font-bold">Daily VP Reward:</p>
          </div>
          <InfoIcon boxSize="20px" className="shrink-0" />
        </div>

        <div className="flex items-center justify-items-center gap-[8px]">
          <TotalVotePowerIcon boxSize="24px" color={Colors.SNOW_WHITE} className="shrink-0" />
          <p className="text-[18px]">{newDailyReward}</p>
        </div>
      </div>
    </>
  )
}
