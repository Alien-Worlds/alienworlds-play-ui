import { act, renderHook, waitFor } from '@testing-library/react'

import { useProfileStore } from '../store/profileStore'
import { useClaimsData } from './useClaimsData'

const mockTryClaimMiningRewards = jest.fn().mockResolvedValue(undefined)
const mockTryClaimLandownerCommissions = jest.fn().mockResolvedValue(undefined)
const mockTryClaimLandownerAllowance = jest.fn().mockResolvedValue(undefined)
const mockTryClaimUnstake = jest.fn().mockResolvedValue(undefined)

jest.mock('store', () => ({
  useAppState: () => ({ wax: { walletId: 'wallet.wam' } }),
  useActions: () => ({
    wax: {
      tryClaimMiningRewards: mockTryClaimMiningRewards,
      tryClaimLandownerCommissions: mockTryClaimLandownerCommissions,
      tryClaimLandownerAllowance: mockTryClaimLandownerAllowance,
      tryClaimUnstake: mockTryClaimUnstake,
    },
  }),
}))

const mockWalletDetails: any = {
  mining_claim: { amount: '10.0000 TLM', last_claim_time: null },
  land_comms: { amount: '5.0000 TLM' },
  land_ratings_payout: '1.0000 TLM',
}

const mockUserDaoBalances: any = {
  eyeke: {
    stake_details: {
      unstakes: [{ stake: '2.0000 TLM', release_time: '2000-01-01T00:00:00.000Z' }],
    },
  },
}

jest.mock('graphql/hooks/useWalletDetails', () => ({
  useWalletDetails: () => ({ walletDetails: mockWalletDetails, loading: false }),
}))

jest.mock('graphql/hooks/useUserDaoBalances', () => ({
  useUserDaoBalances: () => ({ userDaoBalances: mockUserDaoBalances, loading: false }),
}))

describe('useClaimsData', () => {
  afterEach(() => {
    jest.clearAllMocks()
    act(() => {
      useProfileStore.setState({ claimingStates: {} })
    })
  })

  it('builds the claims list from wallet details and dao balances', () => {
    const { result } = renderHook(() => useClaimsData())

    expect(result.current.claims).toEqual([
      expect.objectContaining({ type: 'mining', amount: '10.0000 TLM' }),
      expect.objectContaining({ type: 'commission', amount: '5.0000 TLM' }),
      expect.objectContaining({ type: 'dtal', amount: '1.0000 TLM' }),
      expect.objectContaining({ type: 'unstake', planet: 'eyeke', isClaimable: true }),
    ])
  })

  it('invokes the mining claim action and toggles loading via the shared store', async () => {
    const { result } = renderHook(() => useClaimsData())

    let claimPromise: Promise<void>
    act(() => {
      claimPromise = result.current.claimReward('mining')
    })

    await act(async () => {
      await claimPromise
    })

    expect(mockTryClaimMiningRewards).toHaveBeenCalledTimes(1)
    await waitFor(() => expect(result.current.loading).toBe(false))
  })

  it('invokes the unstake claim action with the composed planet key', async () => {
    const { result } = renderHook(() => useClaimsData())

    await act(async () => {
      await result.current.claimReward('unstake', 'eyeke')
    })

    expect(mockTryClaimUnstake).toHaveBeenCalledWith('4,eyeke')
  })

  it('rethrows and clears the claiming state when the claim action fails', async () => {
    mockTryClaimLandownerCommissions.mockRejectedValueOnce(new Error('boom'))
    const { result } = renderHook(() => useClaimsData())

    await act(async () => {
      await expect(result.current.claimReward('commission')).rejects.toThrow('boom')
    })

    expect(useProfileStore.getState().claimingStates['commission']).toBe(false)
  })
})
