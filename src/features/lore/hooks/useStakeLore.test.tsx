import { act, renderHook } from '@testing-library/react'

import { useStakeLore } from './useStakeLore'
import { useLoreStore } from '../store/loreStore'

const mockRefetchQueries = jest.fn()
jest.mock('@apollo/client', () => ({
  ...jest.requireActual('@apollo/client'),
  useApolloClient: () => ({ refetchQueries: mockRefetchQueries }),
}))

let mockLoreData: any
let mockIsDemoUser = false
const mockTryStakeVotePowerLore = jest.fn()
const mockTryClaimLoreReward = jest.fn()
const mockSetSecondaryModalActive = jest.fn()
const mockSetPrimaryModalActive = jest.fn()
const mockGetLorePullRequests = jest.fn()

jest.mock('../data/LoreDataProvider', () => ({
  useLoreData: () => mockLoreData,
}))

jest.mock('store', () => ({
  useAppState: () => ({
    wax: { walletId: 'wallet.wam', isDemoUser: mockIsDemoUser },
  }),
  useActions: () => ({
    wax: {
      tryStakeVotePowerLore: mockTryStakeVotePowerLore,
      tryClaimLoreReward: mockTryClaimLoreReward,
    },
    modal: {
      setSecondaryModalActive: mockSetSecondaryModalActive,
      setPrimaryModalActive: mockSetPrimaryModalActive,
    },
    main: { getLorePullRequests: mockGetLorePullRequests },
  }),
}))

describe('useStakeLore', () => {
  beforeEach(() => {
    mockIsDemoUser = false
    mockLoreData = {
      walletDetails: { tlm_balance: '100.0000 TLM' },
      loreVoterInfo: {
        staked_amount: '50.0000 TLM',
        reward_global: { tlm_pool_size: '1000.0000 TLM' },
        voter_rewards: { percent_of_pool: '5.0', pending_rewards: '2.5000 TLM' },
      },
      globals: { power_per_day: '0.1000 TLM' },
      loadingLores: false,
      walletDetailsLoading: false,
    }
    act(() => {
      useLoreStore.setState({ selectedProposalId: null, stakedInput: 0 })
    })
    jest.clearAllMocks()
  })

  it('derives balances and rewards from lore data', () => {
    const { result } = renderHook(() => useStakeLore())

    expect(result.current.walletBalance).toBe(100)
    expect(result.current.stakedAmount).toBe(50)
    expect(result.current.tlmPoolSize).toBe(1000)
    expect(result.current.poolShare).toBe(5)
    expect(result.current.pendingRewards).toBe(2.5)
    expect(result.current.dailyReward).toBe('5.00')
    expect(result.current.isLoading).toBe(false)
  })

  it('updates the staked input preview through the shared store', () => {
    const { result } = renderHook(() => useStakeLore())

    act(() => {
      result.current.handlers.onChangeStakeInput(50)
    })

    expect(result.current.state.stakedInput).toBe(50)
    // (50 staked + 50 preview) * 0.1 power per day = 10.00
    expect(result.current.state.newDailyReward).toBe('10.00')
  })

  it('submits a stake and refetches wallet details when not a demo user', async () => {
    const { result } = renderHook(() => useStakeLore())

    await act(async () => {
      await result.current.handlers.onSubmitStake('25')
    })

    expect(mockTryStakeVotePowerLore).toHaveBeenCalledWith('25')
    expect(mockRefetchQueries).toHaveBeenCalled()
  })

  it('opens the login modal instead of submitting a stake for a demo user', async () => {
    mockIsDemoUser = true
    const { result } = renderHook(() => useStakeLore())

    await act(async () => {
      await result.current.handlers.onSubmitStake('25')
    })

    expect(mockTryStakeVotePowerLore).not.toHaveBeenCalled()
    expect(mockSetPrimaryModalActive).toHaveBeenCalledWith({ modalName: 'LoginModal', value: true })
  })

  it('opens the unstake-all modal when not a demo user', () => {
    const { result } = renderHook(() => useStakeLore())

    act(() => {
      result.current.handlers.onUnstakeAll()
    })

    expect(mockSetSecondaryModalActive).toHaveBeenCalledWith({
      modalName: 'UnstakeAllLoreModal',
      value: true,
    })
  })

  it('fetches pull requests and opens the submit-lore modal when not a demo user', () => {
    const { result } = renderHook(() => useStakeLore())

    act(() => {
      result.current.handlers.onSubmitLore()
    })

    expect(mockGetLorePullRequests).toHaveBeenCalled()
    expect(mockSetSecondaryModalActive).toHaveBeenCalledWith({
      modalName: 'SubmitLoreModal',
      value: true,
    })
  })

  it('claims rewards and refetches wallet details when not a demo user', async () => {
    const { result } = renderHook(() => useStakeLore())

    await act(async () => {
      await result.current.handlers.onClaimReward()
    })

    expect(mockTryClaimLoreReward).toHaveBeenCalled()
    expect(mockRefetchQueries).toHaveBeenCalled()
  })
})
