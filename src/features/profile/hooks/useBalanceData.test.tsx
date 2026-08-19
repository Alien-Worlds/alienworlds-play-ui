import { renderHook } from '@testing-library/react'

import { useBalanceData } from './useBalanceData'

const mockUseAppState = jest.fn()
jest.mock('store', () => ({
  useAppState: () => mockUseAppState(),
}))

const mockUseWalletDetails = jest.fn()
jest.mock('graphql/hooks/useWalletDetails', () => ({
  useWalletDetails: (...args: unknown[]) => mockUseWalletDetails(...args),
}))

const mockUseUserDaoBalances = jest.fn()
jest.mock('graphql/hooks/useUserDaoBalances', () => ({
  useUserDaoBalances: (...args: unknown[]) => mockUseUserDaoBalances(...args),
}))

describe('useBalanceData', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  it('returns null balanceData until wallet details and dao balances are loaded', () => {
    mockUseAppState.mockReturnValue({ wax: { walletId: 'wallet.wam' } })
    mockUseWalletDetails.mockReturnValue({ walletDetails: null, loading: false })
    mockUseUserDaoBalances.mockReturnValue({ userDaoBalances: null, loading: false })

    const { result } = renderHook(() => useBalanceData())
    expect(result.current.balanceData).toBeNull()
  })

  it('computes tlm balance, staked amount, and shards once data resolves', () => {
    mockUseAppState.mockReturnValue({ wax: { walletId: 'wallet.wam' } })
    mockUseWalletDetails.mockReturnValue({
      walletDetails: {
        tlm_balance: '12.5000 TLM',
        userpoints_details: { redeemable_points: '50' },
      },
      loading: false,
    })
    mockUseUserDaoBalances.mockReturnValue({
      userDaoBalances: {
        eyeke: { stake_details: { staked_amount: '10.0000 TLM' } },
        neri: { stake_details: { staked_amount: '5.0000 TLM' } },
      },
      loading: false,
    })

    const { result } = renderHook(() => useBalanceData())

    expect(result.current.balanceData).toEqual({
      tlmBalance: 12.5,
      stakedAmount: 15,
      shards: 50,
      bscBalance: 0,
      stakedBscBalance: 0,
    })
  })

  it('reflects combined loading state from wallet and dao queries', () => {
    mockUseAppState.mockReturnValue({ wax: { walletId: 'wallet.wam' } })
    mockUseWalletDetails.mockReturnValue({ walletDetails: null, loading: false })
    mockUseUserDaoBalances.mockReturnValue({ userDaoBalances: null, loading: true })

    const { result } = renderHook(() => useBalanceData())
    expect(result.current.loading).toBe(true)
  })
})
