import { useCallback, useMemo } from 'react'

import { useApolloClient } from '@apollo/client'
import { WALLET_DETAILS_QUERY_ALL } from 'graphql/queries/walletDetails'
import { get } from 'lodash'
import { useModalStore } from 'shared/store/modalStore'
import { useSessionStore } from 'shared/store/sessionStore'

import { useLoreData } from '../data/LoreDataProvider'
import { useLoreStore } from '../store/loreStore'
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
  const walletId = useSessionStore((state) => state.walletId)
  const isDemoUser = useSessionStore((state) => state.isDemoUser)
  const { walletDetails, loreVoterInfo, globals, loadingLores, walletDetailsLoading } =
    useLoreData()
  const stakeLore = useLoreStore((state) => state.stakeLore)
  const claimLoreReward = useLoreStore((state) => state.claimLoreReward)
  const loadLorePullRequests = useLoreStore((state) => state.loadLorePullRequests)
  const setSecondaryModalActive = useModalStore((state) => state.setSecondaryModalActive)
  const setPrimaryModalActive = useModalStore((state) => state.setPrimaryModalActive)

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

  const stakedInput = useLoreStore((state) => state.stakedInput)
  const setStakedInput = useLoreStore((state) => state.setStakedInput)

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

      await stakeLore(amount)
      await client.refetchQueries({ include: [WALLET_DETAILS_QUERY_ALL] })
    },
    [client, isDemoUser, openLoginModalIfDemo, stakeLore]
  )

  const onUnstakeAll = useCallback(() => {
    if (isDemoUser) {
      openLoginModalIfDemo()
      return
    }

    setSecondaryModalActive({ modalName: 'UnstakeAllLoreModal', value: true })
  }, [isDemoUser, openLoginModalIfDemo, setSecondaryModalActive])

  const onSubmitLore = useCallback(() => {
    loadLorePullRequests()

    if (isDemoUser) {
      openLoginModalIfDemo()
      return
    }

    setSecondaryModalActive({ modalName: 'SubmitLoreModal', value: true })
  }, [loadLorePullRequests, isDemoUser, openLoginModalIfDemo, setSecondaryModalActive])

  const onChangeStakeInput = useCallback(
    (amount: number) => {
      setStakedInput(amount)
    },
    [setStakedInput]
  )

  const onClaimReward = useCallback(async () => {
    if (isDemoUser) {
      openLoginModalIfDemo()
      return
    }

    await claimLoreReward()
    await client.refetchQueries({ include: [WALLET_DETAILS_QUERY_ALL] })
  }, [client, isDemoUser, openLoginModalIfDemo, claimLoreReward])

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
