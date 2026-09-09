import {
  LockIcon,
  TLMPoolSizeIcon,
  TotalVotePowerIcon,
  TotalVotePowerPlusIcon,
  WaxIcon,
} from '@alien-worlds/icons'
import { Colors } from 'shared/util/colors'
import { formatNumber } from 'shared/util/numbers'

type StakeMetricsProps = {
  walletId: string
  walletBalance: number
  stakedAmount: number
  tlmPoolSize: number
  currentVotePower: number
  dailyReward: string
}

const metricLabelClass = 'font-tlm text-[12px] font-bold tracking-[0.1em]'
const metricValueClass = 'font-orb text-[16px] leading-[0.8] md:text-[18px] 2xl:text-[20px]'

export function StakeMetrics({
  walletId,
  walletBalance,
  stakedAmount,
  tlmPoolSize,
  currentVotePower,
  dailyReward,
}: StakeMetricsProps) {
  return (
    <div className="grid w-full grid-cols-1 gap-[25px] md:grid-cols-2 md:gap-8 lg:grid-cols-3 xl:grid-cols-[160px_repeat(5,1fr)] 2xl:grid-cols-[180px_repeat(5,1fr)]">
      <div className="self-center">
        <div className="flex flex-col gap-5 lg:flex-row lg:gap-12 2xl:gap-24">
          <div className="flex flex-col items-start gap-1 self-start lg:self-center">
            <p
              className="text-[22px] font-semibold lg:text-[20px] 2xl:text-[30px]"
              style={{ color: Colors.SNOW_WHITE }}
            >
              Lore Balances
            </p>
            <p className="text-[16px]" style={{ color: Colors.DI_SERRIA }}>
              {walletId}
            </p>
          </div>
          <div
            className="h-px w-full lg:h-[88px] lg:w-px"
            style={{ backgroundColor: Colors.JUMBO }}
          />
        </div>
      </div>

      <div className="self-center">
        <div className="flex gap-3">
          <WaxIcon color={Colors.DI_SERRIA} boxSize={40} className="relative shrink-0" />
          <div className="flex flex-col justify-end">
            <p className={metricValueClass}>{formatNumber(walletBalance ?? 0, 4, 4)}</p>
            <p className={metricLabelClass} style={{ color: Colors.DI_SERRIA }}>
              WAX Trillium
            </p>
          </div>
        </div>
      </div>

      <div className="self-center">
        <div
          className="flex min-w-[200px] gap-3 2xl:min-w-[235px]"
          style={{ color: Colors.RADICAL_RED }}
        >
          <div className="relative w-10 shrink-0" style={{ fill: Colors.RADICAL_RED }}>
            <LockIcon boxSize={30} className="absolute bottom-4 left-5 z-[2]" />
            <WaxIcon boxSize={40} color={Colors.RADICAL_RED} />
          </div>
          <div className="flex flex-col justify-end">
            <p className={metricValueClass} style={{ color: Colors.SNOW_WHITE }}>
              {formatNumber(stakedAmount ?? 0, 4, 4)}
            </p>
            <p className={metricLabelClass} style={{ color: Colors.RADICAL_RED }}>
              Staked WAX Trillium
            </p>
          </div>
        </div>
      </div>

      <div className="self-center">
        <div className="flex gap-3">
          <TotalVotePowerIcon boxSize="42px" color={Colors.CARIBBEAN_GREEN} className="shrink-0" />
          <div className="flex flex-col justify-end">
            <p className={metricValueClass} style={{ color: Colors.SNOW_WHITE }}>
              {currentVotePower}
            </p>
            <p className={metricLabelClass} style={{ color: Colors.CARIBBEAN_GREEN }}>
              Vote Power
            </p>
          </div>
        </div>
      </div>

      <div className="self-center">
        <div className="flex gap-3">
          <TotalVotePowerPlusIcon boxSize="42px" color={Colors.DODGE_BLUE} className="shrink-0" />
          <div className="flex flex-col justify-end">
            <p className={metricValueClass} style={{ color: Colors.SNOW_WHITE }}>
              {dailyReward}
            </p>
            <p className={metricLabelClass} style={{ color: Colors.DODGE_BLUE }}>
              Daily VP Reward
            </p>
          </div>
        </div>
      </div>
      <div className="self-center">
        <div className="flex gap-3">
          <TLMPoolSizeIcon boxSize="42px" color={Colors.SNOW_WHITE} className="shrink-0" />
          <div className="flex flex-col justify-end">
            <p className={metricValueClass} style={{ color: Colors.SNOW_WHITE }}>
              {formatNumber(tlmPoolSize ?? 0, 4, 4)}
            </p>
            <p className={metricLabelClass} style={{ color: Colors.SNOW_WHITE }}>
              TLM Pool Size
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
