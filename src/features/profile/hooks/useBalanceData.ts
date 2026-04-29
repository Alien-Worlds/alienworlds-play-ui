/**
 * Custom Hook: useBalanceData
 *
 * This hook manages balance-related data fetching and calculations.
 * It provides a clean interface for components to access balance information.
 */

import { useMemo } from 'react'

import { useUserDaoBalances } from 'graphql/hooks/useUserDaoBalances'
import { useWalletDetails } from 'graphql/hooks/useWalletDetails'
import { useAppState } from 'store'

import { BalanceData, UseBalanceDataReturn } from '../types/profile.types'
import { calculateTotalStaked, extractBalanceValue } from '../utils/profile.utils'

export const useBalanceData = (): UseBalanceDataReturn => {
  const {
    wax: { walletId },
  } = useAppState()

  const { walletDetails, loading: walletLoading } = useWalletDetails(walletId)
  const { userDaoBalances, loading: daoLoading } = useUserDaoBalances({ walletId })

  const balanceData = useMemo((): BalanceData | null => {
    if (!walletDetails || !userDaoBalances) return null

    const tlmBalance = extractBalanceValue(walletDetails.tlm_balance)
    const totalStaked = calculateTotalStaked(userDaoBalances)
    const shards = extractBalanceValue(walletDetails.userpoints_details?.redeemable_points || '0')

    return {
      tlmBalance,
      stakedAmount: totalStaked,
      shards,
      bscBalance: 0, // Add BSC balance logic here
      stakedBscBalance: 0, // Add staked BSC balance logic here
    }
  }, [walletDetails, userDaoBalances])

  const loading = walletLoading || daoLoading
  const error = null // Add error handling logic here

  const refresh = async (): Promise<void> => {
    // Add refresh logic here
    // This could trigger a refetch of the queries
  }

  return {
    balanceData,
    loading,
    error,
    refresh,
  }
}
