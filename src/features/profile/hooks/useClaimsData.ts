/**
 * Custom Hook: useClaimsData
 *
 * This hook manages claims-related data and actions.
 * It provides functionality for fetching and claiming rewards.
 */

import { useState, useMemo } from 'react'

import { useUserDaoBalances } from 'graphql/hooks/useUserDaoBalances'
import { useWalletDetails } from 'graphql/hooks/useWalletDetails'
import { useAppState, useActions } from 'store'

import { CLAIMS_CONSTANTS } from '../constants/profile.constants'
import { ClaimableReward, UseClaimsDataReturn } from '../types/profile.types'
import { calculateTimeRemaining, isRewardClaimable, generateClaimKey } from '../utils/profile.utils'

export const useClaimsData = (): UseClaimsDataReturn => {
  const {
    wax: { walletId },
  } = useAppState()

  const {
    wax: {
      tryClaimMiningRewards,
      tryClaimLandownerAllowance,
      tryClaimLandownerCommissions,
      tryClaimUnstake,
    },
  } = useActions()

  const { walletDetails, loading: walletLoading } = useWalletDetails(walletId)
  const { userDaoBalances, loading: daoLoading } = useUserDaoBalances({ walletId })

  const [claimingStates, setClaimingStates] = useState<Record<string, boolean>>({})

  const claims = useMemo((): ClaimableReward[] => {
    if (!walletDetails || !userDaoBalances) return []

    const claimsList: ClaimableReward[] = []

    // Mining rewards
    const miningAmount = walletDetails.mining_claim?.amount || '0.0000 TLM'
    const miningTimeRemaining = calculateTimeRemaining(
      walletDetails.mining_claim?.last_claim_time,
      CLAIMS_CONSTANTS.MINING_REWARD_COOLDOWN_HOURS
    )

    claimsList.push({
      type: 'mining',
      amount: miningAmount,
      isClaimable: isRewardClaimable(miningAmount, miningTimeRemaining),
      timeRemaining: miningTimeRemaining,
    })

    // Commission rewards
    const commissionAmount = walletDetails.land_comms?.amount || '0.0000 TLM'
    claimsList.push({
      type: 'commission',
      amount: commissionAmount,
      isClaimable: isRewardClaimable(commissionAmount),
      timeRemaining: 0,
    })

    // DTAL rewards
    const dtalAmount = walletDetails.land_ratings_payout || '0.0000 TLM'
    claimsList.push({
      type: 'dtal',
      amount: dtalAmount,
      isClaimable: isRewardClaimable(dtalAmount),
      timeRemaining: 0,
    })

    // Unstake rewards
    Object.entries(userDaoBalances).forEach(([planetId, data]) => {
      if ((data as any).stake_details.unstakes.length > 0) {
        const unstake = (data as any).stake_details.unstakes[0]
        const releaseTime = new Date(unstake.release_time)
        const now = new Date()
        const isReady = releaseTime <= now

        claimsList.push({
          type: 'unstake',
          amount: unstake.stake,
          isClaimable: isReady,
          planet: planetId,
          releaseTime: unstake.release_time,
        })
      }
    })

    return claimsList
  }, [walletDetails, userDaoBalances])

  const claimReward = async (type: string, planetId?: string): Promise<void> => {
    const claimKey = generateClaimKey(type, planetId)

    try {
      setClaimingStates((prev) => ({ ...prev, [claimKey]: true }))

      switch (type) {
        case 'mining':
          await tryClaimMiningRewards()
          break
        case 'commission':
          await tryClaimLandownerCommissions()
          break
        case 'dtal':
          await tryClaimLandownerAllowance()
          break
        case 'unstake':
          if (planetId) {
            await tryClaimUnstake('4,' + planetId)
          }
          break
        default:
          throw new Error(`Unknown claim type: ${type}`)
      }
    } catch (error) {
      console.error('Claim failed:', error)
      throw error
    } finally {
      setClaimingStates((prev) => ({ ...prev, [claimKey]: false }))
    }
  }

  const loading = walletLoading || daoLoading || Object.values(claimingStates).some(Boolean)
  const error = null // Add error handling logic here

  return {
    claims,
    loading,
    error,
    claimReward,
  }
}
