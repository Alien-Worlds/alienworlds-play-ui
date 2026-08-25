import { useCallback, useMemo, useState } from 'react'

import { useApolloClient } from '@apollo/client'
import { WALLET_DETAILS_QUERY_ALL } from 'graphql/queries/walletDetails'
import { get } from 'lodash'
import { useAppState, useActions } from 'store'

import { useLoreData } from '../data/LoreDataProvider'
import { getDailyReward, parseStakeAmount, parseTokenAmount } from '../utils/staking'

type StakeLoreHandlers = {
  onSubmitStake: (amount: string) => Promise<void>
  onUnstakeAll: () => void
  onSubmitLore: () => void
  onChangeStakeInput: (amount: number) => void
  onClaimReward: () => Promise<void>
}

type StakeLoreState = {
  stakedInput: number
  newDailyReward: string
}

export function useStakeLore(): {
  walletId: string
  walletBalance: number
  stakedAmount: number
  tlmPoolSize: number
  poolShare: number
  pendingRewards: number
  dailyReward: string
  handlers: StakeLoreHandlers
  state: StakeLoreState
  isLoading: boolean
  isDemoUser: boolean
} {
  const client = useApolloClient()
  const {
    wax: { walletId, isDemoUser },
  } = useAppState()
  const { walletDetails, loreVoterInfo, globals, loadingLores, walletDetailsLoading } =
    useLoreData()
  const {
    wax: { tryStakeVotePowerLore, tryClaimLoreReward },
    modal: { setSecondaryModalActive, setPrimaryModalActive },
    main: { getLorePullRequests },
  } = useActions()

  const walletBalance = useMemo(
    () => parseTokenAmount(get(walletDetails, 'tlm_balance')),
    [walletDetails]
  )
  const stakedAmount = useMemo(
    () => parseStakeAmount(get(loreVoterInfo, 'staked_amount')),
    [loreVoterInfo]
  )
  const tlmPoolSize = useMemo(
    () => parseTokenAmount(get(loreVoterInfo, 'reward_global.tlm_pool_size')),
    [loreVoterInfo]
  )
  const poolShare = useMemo(
    () => parseStakeAmount(get(loreVoterInfo, 'voter_rewards.percent_of_pool')),
    [loreVoterInfo]
  )
  const pendingRewards = useMemo(
    () => parseTokenAmount(get(loreVoterInfo, 'voter_rewards.pending_rewards')),
    [loreVoterInfo]
  )
  const powerPerDay = useMemo(
    () => parseTokenAmount(get(globals, 'power_per_day')),
    [globals?.power_per_day]
  )

  const dailyReward = useMemo(
    () => getDailyReward(stakedAmount, powerPerDay),
    [powerPerDay, stakedAmount]
  )

  const [stakedInput, setStakedInput] = useState<number>(0)

  const newDailyReward = useMemo(() => {
    if (!powerPerDay) {
      return dailyReward
    }

    return getDailyReward(stakedAmount + stakedInput, powerPerDay)
  }, [dailyReward, powerPerDay, stakedAmount, stakedInput])

  const openLoginModalIfDemo = useCallback(
    () =>
      setPrimaryModalActive({
        modalName: 'LoginModal',
        value: true,
      }),
    [setPrimaryModalActive]
  )

  const onSubmitStake = useCallback(
    async (amount: string) => {
      if (isDemoUser) {
        openLoginModalIfDemo()
        return
      }

      await tryStakeVotePowerLore(amount)
      await client.refetchQueries({ include: [WALLET_DETAILS_QUERY_ALL] })
    },
    [client, isDemoUser, openLoginModalIfDemo, tryStakeVotePowerLore]
  )

  const onUnstakeAll = useCallback(() => {
    if (isDemoUser) {
      openLoginModalIfDemo()
      return
    }

    setSecondaryModalActive({ modalName: 'UnstakeAllLoreModal', value: true })
  }, [isDemoUser, openLoginModalIfDemo, setSecondaryModalActive])

  const onSubmitLore = useCallback(() => {
    getLorePullRequests()

    if (isDemoUser) {
      openLoginModalIfDemo()
      return
    }

    setSecondaryModalActive({ modalName: 'SubmitLoreModal', value: true })
  }, [getLorePullRequests, isDemoUser, openLoginModalIfDemo, setSecondaryModalActive])

  const onChangeStakeInput = useCallback((amount: number) => {
    setStakedInput(Number.isNaN(amount) ? 0 : amount)
  }, [])

  const onClaimReward = useCallback(async () => {
    if (isDemoUser) {
      openLoginModalIfDemo()
      return
    }

    await tryClaimLoreReward()
    await client.refetchQueries({ include: [WALLET_DETAILS_QUERY_ALL] })
  }, [client, isDemoUser, openLoginModalIfDemo, tryClaimLoreReward])

  return {
    walletId,
    walletBalance,
    stakedAmount,
    tlmPoolSize,
    poolShare,
    pendingRewards,
    dailyReward,
    handlers: {
      onSubmitStake,
      onUnstakeAll,
      onSubmitLore,
      onChangeStakeInput,
      onClaimReward,
    },
    state: {
      stakedInput,
      newDailyReward,
    },
    isLoading: Boolean(loadingLores || walletDetailsLoading),
    isDemoUser,
  }
}
