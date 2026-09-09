import {
  LandOccupancyIcon,
  TLMPoolSizeIcon,
  TotalVotePowerIcon,
  TotalVotePowerPlusIcon,
  TriliumIcon,
  TriliumLockIcon,
} from '@alien-worlds/icons'
import { Button } from '@alien-worlds/uikit'
import { Colors } from 'shared/util/colors'
import { formatNumber } from 'shared/util/numbers'

type StakeRewardsLoreProps = {
  poolShare: number
  pendingRewards: number
  dailyReward: string
  onClaimReward: () => Promise<void>
}

const metricLabelClass = 'font-tlm text-[12px] font-bold tracking-[0.1em]'
const metricValueClass = 'font-orb text-[16px] leading-[0.8] md:text-[18px] 2xl:text-[20px]'

type GradientBadgeProps = {
  width?: string | number
  height?: string | number
  children?: React.ReactNode
}

function GradientBadge({ width = '64px', height = '24px', children }: GradientBadgeProps) {
  return (
    <div
      className="flex items-center justify-center gap-[6px] rounded-lg border px-3 py-[6px]"
      style={{
        width,
        height,
        borderColor: '#D1D1D3',
        background:
          'linear-gradient(180deg, #9C33B6 0%, #4F60BC 48.96%, #4657A5 51.04%, #009BD4 79.17%)',
      }}
    >
      <p
        className="whitespace-nowrap font-tlm text-[12px] font-semibold"
        style={{ color: Colors.SNOW_WHITE }}
      >
        {children}
      </p>
    </div>
  )
}

function ArrowSeparator() {
  return (
    <svg viewBox="0 0 25 8" width="24" height="24">
      <path
        d="M0.5 3.18201C0.223858 3.18201 0 3.40586 0 3.68201C0 3.95815 0.223858 4.18201 0.5 4.18201V3.68201V3.18201ZM24.8536 4.03556C25.0488 3.8403 25.0488 3.52372 24.8536 3.32845L21.6716 0.146473C21.4763 -0.0487893 21.1597 -0.0487893 20.9645 0.146473C20.7692 0.341735 20.7692 0.658318 20.9645 0.85358L23.7929 3.68201L20.9645 6.51043C20.7692 6.7057 20.7692 7.02228 20.9645 7.21754C21.1597 7.4128 21.4763 7.4128 21.6716 7.21754L24.8536 4.03556ZM0.5 3.68201V4.18201H24.5V3.68201V3.18201H0.5V3.68201Z"
        fill="#777778"
      />
    </svg>
  )
}

function VoteIcon() {
  return (
    <svg viewBox="0 0 18 18" style={{ width: '1em', height: '1em' }}>
      <path
        d="M7.7472 10.2529V9.36475V3.55994C4.51173 3.8137 1.94238 6.50993 1.94238 9.80884C1.94238 13.2664 4.73377 16.0577 8.19128 16.0577C11.4902 16.0577 14.1864 13.4884 14.4085 10.2529H8.63537H7.7472Z"
        fill="white"
      />
      <path
        d="M9.65047 1.94226C9.46014 1.94226 9.26982 2.0057 9.14294 2.13258C9.01606 2.25946 8.9209 2.41807 8.9209 2.60839V8.38148C8.9209 8.76213 9.2381 9.04761 9.58703 9.04761H15.3601C15.5504 9.04761 15.7408 8.98417 15.8676 8.82557C15.9945 8.69869 16.058 8.50836 16.058 8.31804C15.8042 4.95569 13.0445 2.19602 9.65047 1.94226ZM10.2849 7.71536V3.40139C12.4419 3.84548 14.1865 5.55838 14.6306 7.74708H10.2849V7.71536Z"
        fill="white"
      />
    </svg>
  )
}

export function StakeRewardsLore({
  dailyReward,
  poolShare,
  pendingRewards,
  onClaimReward,
}: StakeRewardsLoreProps) {
  return (
    <div
      className="flex w-full flex-col gap-8 rounded-[20px] px-4 py-5 md:px-6 md:py-[30px] 2xl:px-9"
      style={{ backgroundColor: Colors.BLACK_SOLID_90 }}
    >
      <div className="grid w-full grid-cols-1 gap-5 md:grid-cols-2 md:gap-1 lg:grid-cols-3 lg:gap-2 xl:grid-cols-5 xl:gap-6 2xl:gap-8">
        <div className="self-center">
          <div className="flex flex-col gap-5 lg:flex-row lg:gap-12 2xl:gap-24">
            <div className="flex min-w-[140px] flex-col items-start gap-1 self-start lg:self-center">
              <p
                className="text-[22px] font-semibold lg:text-[20px] 2xl:text-[30px]"
                style={{ color: Colors.SNOW_WHITE }}
              >
                Rewards
              </p>
              <p className="text-[16px]" style={{ color: Colors.SILVER }}>
                Claim when accrued
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
            <LandOccupancyIcon
              color={Colors.SNOW_WHITE}
              boxSize={40}
              className="relative shrink-0"
            />
            <div className="flex flex-col justify-end">
              <p className={metricValueClass}>{formatNumber(poolShare ?? 0, 4, 4)}%</p>
              <p className={metricLabelClass} style={{ color: Colors.DI_SERRIA }}>
                Your Pool Share
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
            <TriliumIcon boxSize="42px" color={Colors.PUNCH} className="shrink-0" />
            <div className="flex flex-col justify-end">
              <p className={metricValueClass} style={{ color: Colors.SNOW_WHITE }}>
                {formatNumber(pendingRewards ?? 0, 4, 4)}
              </p>
              <p className={metricLabelClass} style={{ color: Colors.PUNCH }}>
                Unclaimed Rewards
              </p>
            </div>
          </div>
        </div>

        <div className="self-center justify-self-start xl:justify-self-end">
          <Button variant="secondary" size="lg" fontSize={18} onClick={onClaimReward}>
            Claim TLM Reward
          </Button>
        </div>
      </div>

      <div className="grid w-full grid-cols-1 gap-[15px] md:grid-cols-2 md:gap-6 lg:grid-cols-3 xl:grid-cols-4">
        <div
          className="flex h-[200px] flex-col justify-between rounded-[20px] border p-5"
          style={{ borderColor: Colors.JUMBO }}
        >
          <div className="flex items-center gap-2">
            <TriliumIcon boxSize="36px" color={Colors.DI_SERRIA} className="shrink-0" />
            <ArrowSeparator />
            <TriliumLockIcon boxSize="36px" color={Colors.RADICAL_RED} className="shrink-0" />
          </div>

          <div className="flex flex-col items-start gap-1">
            <p className="font-tlm text-[16px] font-bold" style={{ color: Colors.SNOW_WHITE }}>
              1. Stake TLM
            </p>
            <p className="font-tlm text-[16px]" style={{ color: Colors.SILVER }}>
              Lock TLM to begin generating Vote Power{' '}
              <span className="inline-flex" style={{ verticalAlign: '-3px' }}>
                <TotalVotePowerIcon
                  boxSize="16px"
                  color={Colors.CARIBBEAN_GREEN}
                  className="shrink-0"
                />
              </span>
            </p>
          </div>
        </div>
        <div
          className="flex h-[200px] flex-col justify-between rounded-[20px] border p-5"
          style={{ borderColor: Colors.JUMBO }}
        >
          <div className="flex items-center gap-2">
            <TotalVotePowerIcon
              boxSize="36px"
              color={Colors.CARIBBEAN_GREEN}
              className="shrink-0"
            />
            <ArrowSeparator />
            <TotalVotePowerPlusIcon boxSize="36px" color={Colors.DODGE_BLUE} className="shrink-0" />
          </div>

          <div className="flex flex-col items-start gap-1">
            <p className="font-tlm text-[16px] font-bold" style={{ color: Colors.SNOW_WHITE }}>
              2. Generate VP
            </p>
            <div className="flex items-center gap-2">
              <p className="font-tlm text-[16px]" style={{ color: Colors.SILVER }}>
                VP accumulates continuously while TLM remains staked
              </p>
            </div>
          </div>
        </div>
        <div
          className="flex h-[200px] flex-col justify-between rounded-[20px] border p-5"
          style={{ borderColor: Colors.JUMBO }}
        >
          <div className="flex items-center gap-2">
            <TotalVotePowerIcon
              boxSize="36px"
              color={Colors.CARIBBEAN_GREEN}
              className="shrink-0"
            />
            <ArrowSeparator />
            <GradientBadge>Vote</GradientBadge>
          </div>

          <div className="flex flex-col items-start gap-1">
            <p className="font-tlm text-[16px] font-bold" style={{ color: Colors.SNOW_WHITE }}>
              3. Vote on Proposals
            </p>
            <p className="font-tlm text-[16px]" style={{ color: Colors.SILVER }}>
              Spend VP to vote and activate reward participation{' '}
              <span className="inline-flex" style={{ verticalAlign: '-3px' }}>
                <VoteIcon />
              </span>
            </p>
          </div>
        </div>
        <div
          className="flex h-[200px] flex-col justify-between rounded-[20px] border p-5"
          style={{ borderColor: Colors.JUMBO }}
        >
          <div className="flex items-center gap-2">
            <GradientBadge>Vote</GradientBadge>
            <ArrowSeparator />
            <TLMPoolSizeIcon boxSize="36px" color={Colors.SNOW_WHITE} className="shrink-0" />
          </div>

          <div className="flex flex-col items-start gap-1">
            <p className="font-tlm text-[16px] font-bold" style={{ color: Colors.SNOW_WHITE }}>
              4. Earn TLM Rewards
            </p>
            <p className="font-tlm text-[16px]" style={{ color: Colors.SILVER }}>
              Commit more VP to increase your share of TLM rewards{' '}
              <span className="inline-flex" style={{ verticalAlign: '-2px' }}>
                <TriliumIcon boxSize="16px" color={Colors.DI_SERRIA} className="shrink-0" />
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
