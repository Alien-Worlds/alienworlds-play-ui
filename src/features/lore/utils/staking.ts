import { split, toNumber } from 'lodash'

const stakeAmountRegex = /\d+(\.\d+)?/

export function parseStakeAmount(stakedAmount?: string | number | null): number {
  if (stakedAmount === null || stakedAmount === undefined) {
    return 0
  }

  const normalizedStakeAmount =
    typeof stakedAmount === 'number' ? stakedAmount.toString() : stakedAmount

  const match = normalizedStakeAmount.match(stakeAmountRegex)

  if (!match) {
    return 0
  }

  return Number(match[0])
}

export function parseTokenAmount(amount?: string | number | null): number {
  if (amount === null || amount === undefined) {
    return 0
  }

  const normalizedAmount = typeof amount === 'number' ? amount.toString() : amount

  return toNumber(split(normalizedAmount, ' ')[0])
}

export function getDailyReward(stakedAmount: number, powerPerDay: number): string {
  if (!stakedAmount || !powerPerDay) {
    return '0.00'
  }

  return (stakedAmount * powerPerDay).toFixed(2)
}
