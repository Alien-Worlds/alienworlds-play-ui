import { renderHook } from '@testing-library/react'

import { useProfileData } from './useProfileData'

let mockIsDemoUser = false
let mockWalletId = 'wallet.wam'
jest.mock('shared/store/sessionStore', () => ({
  useSessionStore: (selector: (state: unknown) => unknown) =>
    selector({ walletId: mockWalletId, isDemoUser: mockIsDemoUser }),
}))

const mockUseWalletDetails = jest.fn()
jest.mock('graphql/hooks/useWalletDetails', () => ({
  useWalletDetails: (...args: unknown[]) => mockUseWalletDetails(...args),
}))

const mockUseLevelNftRewards = jest.fn()
jest.mock('features/outpost/hooks/queries/useLevelNftRewards', () => ({
  useLevelNftRewards: () => mockUseLevelNftRewards(),
}))

describe('useProfileData', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  it('returns null profileData until wallet details and level reward are loaded', () => {
    mockWalletId = 'wallet.wam'
    mockIsDemoUser = false
    mockUseWalletDetails.mockReturnValue({ walletDetails: null, loading: false })
    mockUseLevelNftRewards.mockReturnValue({ currentLevelReward: null })

    const { result } = renderHook(() => useProfileData())
    expect(result.current.profileData).toBeNull()
  })

  it('builds profileData once wallet details and level reward resolve', () => {
    mockWalletId = 'wallet.wam'
    mockIsDemoUser = false
    mockUseWalletDetails.mockReturnValue({
      walletDetails: { userpoints_details: { total_points: 250 } },
      loading: false,
    })
    mockUseLevelNftRewards.mockReturnValue({ currentLevelReward: { level: 4 } })

    const { result } = renderHook(() => useProfileData())

    expect(result.current.profileData).toEqual({
      walletId: 'wallet.wam',
      isDemoUser: false,
      currentLevel: 4,
      userPoints: 250,
      avatarUrl: undefined,
      rank: '4',
    })
  })

  it('shows the demo account tag for demo users', () => {
    mockWalletId = 'wallet.wam'
    mockIsDemoUser = true
    mockUseWalletDetails.mockReturnValue({
      walletDetails: { userpoints_details: { total_points: 0 } },
      loading: false,
    })
    mockUseLevelNftRewards.mockReturnValue({ currentLevelReward: { level: 1 } })

    const { result } = renderHook(() => useProfileData())

    expect(result.current.profileData?.walletId).toBe('Demo Account')
  })

  it('reflects wallet loading state', () => {
    mockWalletId = 'wallet.wam'
    mockIsDemoUser = false
    mockUseWalletDetails.mockReturnValue({ walletDetails: null, loading: true })
    mockUseLevelNftRewards.mockReturnValue({ currentLevelReward: null })

    const { result } = renderHook(() => useProfileData())
    expect(result.current.loading).toBe(true)
  })
})
