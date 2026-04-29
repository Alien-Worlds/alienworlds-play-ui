import { useEffect, useMemo, useState } from 'react'

import { DateTime } from 'luxon'

import { useLoreData } from '../data/LoreDataProvider'
import { parseTokenAmount, parseStakeAmount } from '../utils/staking'

export function useLiveVotePower(pollInterval = 6000) {
  const { globals, loreVoterInfo } = useLoreData()
  const [currentVotePower, setCurrentVotePower] = useState(0)

  const powerPerDay = useMemo(() => parseTokenAmount(globals?.power_per_day), [globals])

  useEffect(() => {
    const stakedAmount = parseStakeAmount(loreVoterInfo?.staked_amount)

    if (!loreVoterInfo?.last_claim || !powerPerDay || stakedAmount <= 0) {
      setCurrentVotePower(0)
      return undefined
    }

    const lastClaim = DateTime.fromISO(loreVoterInfo.last_claim)

    const calculateVotePower = () => {
      const now = DateTime.now().toUTC()
      const elapsedSeconds = now.diff(lastClaim).as('seconds')
      const baseVotePower = parseTokenAmount(loreVoterInfo.vote_power)
      return Math.ceil(
        baseVotePower + (elapsedSeconds * stakedAmount * powerPerDay) / (24 * 60 * 60)
      )
    }

    setCurrentVotePower(calculateVotePower())
    const intervalId = setInterval(() => {
      setCurrentVotePower(calculateVotePower())
    }, pollInterval)

    return () => clearInterval(intervalId)
  }, [loreVoterInfo, powerPerDay, pollInterval])

  return { currentVotePower }
}
