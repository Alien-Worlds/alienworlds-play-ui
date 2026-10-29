import { act, renderHook } from '@testing-library/react'
import { useSessionStore } from 'shared/store/sessionStore'

import { useLevelNftRewards } from './useLevelNftRewards'

jest.mock('shared/util/config', () => ({ config: { DemoUserWaxAccount: 'demo.wam' } }))

const levelOffer = (level: number) => ({ id: level, level, template_id: level * 100, required: 0 })
const levelNftOffers = [levelOffer(2), levelOffer(3), levelOffer(4)]

let mockLevelNftOffers = levelNftOffers
jest.mock('features/outpost/hooks/queries/useLevelNftOffers', () => ({
  useLevelNftOffers: () => ({ levelNftOffers: mockLevelNftOffers }),
}))

const mockUseWalletDetails = jest.fn()
jest.mock('graphql/hooks/useWalletDetails', () => ({
  useWalletDetails: (walletId: string) => mockUseWalletDetails(walletId),
}))

const atLevel = (top_level: number) => ({ walletDetails: { userpoints_details: { top_level } } })

describe('useLevelNftRewards', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockLevelNftOffers = levelNftOffers
    useSessionStore.setState({ walletId: 'player.wam' })
  })

  // The hook is still mounted here (Testing Library unmounts after this hook).
  afterEach(() => act(() => useSessionStore.setState({ walletId: null })))

  it("reads the player's level for the logged-in wallet", () => {
    mockUseWalletDetails.mockReturnValue(atLevel(1))
    renderHook(() => useLevelNftRewards())
    expect(mockUseWalletDetails).toHaveBeenCalledWith('player.wam')
  })

  it('has no current reward at level 1, and offers level 2 next', () => {
    mockUseWalletDetails.mockReturnValue(atLevel(1))
    const { result } = renderHook(() => useLevelNftRewards())

    expect(result.current.currentLevelReward).toEqual(
      expect.objectContaining({ id: 0, level: 1, required: 0 })
    )
    expect(result.current.nextLevelReward).toEqual(levelOffer(2))
  })

  it("gives the reward for the player's level and the one after it", () => {
    mockUseWalletDetails.mockReturnValue(atLevel(3))
    const { result } = renderHook(() => useLevelNftRewards())

    expect(result.current.currentLevelReward).toEqual(levelOffer(3))
    expect(result.current.nextLevelReward).toEqual(levelOffer(4))
  })

  it('has no next reward at the highest level', () => {
    mockUseWalletDetails.mockReturnValue(atLevel(4))
    const { result } = renderHook(() => useLevelNftRewards())

    expect(result.current.currentLevelReward).toEqual(levelOffer(4))
    expect(result.current.nextLevelReward).toBeUndefined()
  })

  it("has no next reward until the wallet's details load", () => {
    mockUseWalletDetails.mockReturnValue({ walletDetails: null })
    const { result } = renderHook(() => useLevelNftRewards())

    expect(result.current.currentLevelReward.level).toBe(1)
    expect(result.current.nextLevelReward).toBeUndefined()
  })
})
