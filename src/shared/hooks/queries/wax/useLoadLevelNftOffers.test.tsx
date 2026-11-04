import { renderHook, waitFor } from '@testing-library/react'
import { useSessionStore } from 'shared/store/sessionStore'

import { useLoadLevelNftOffers } from './useLoadLevelNftOffers'
import { createQueryWrapper } from '../testUtils'

jest.mock('shared/util/config', () => ({ config: { DemoUserWaxAccount: 'demo.wam' } }))

const mockGetLevelOffers = jest.fn()
jest.mock('shared/wax/userPoints', () => ({
  getLevelOffers: () => mockGetLevelOffers(),
}))

describe('useLoadLevelNftOffers', () => {
  beforeEach(() => {
    mockGetLevelOffers.mockReset().mockResolvedValue([{ id: 1, level: 2 }])
    useSessionStore.setState({ walletId: 'player.wam' })
  })

  afterEach(() => useSessionStore.setState({ walletId: null }))

  it('loads the level offers', async () => {
    const { queryClient, wrapper } = createQueryWrapper()
    const { result } = renderHook(() => useLoadLevelNftOffers(), { wrapper })

    await waitFor(() => expect(result.current.data).toEqual([{ id: 1, level: 2 }]))
    expect(queryClient.getQueryData(['level-nft-offers'])).toEqual([{ id: 1, level: 2 }])
  })

  it('has no offers without a wallet, without reading the chain', async () => {
    useSessionStore.setState({ walletId: null })
    const { wrapper } = createQueryWrapper()
    const { result } = renderHook(() => useLoadLevelNftOffers(), { wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toBeNull()
    expect(mockGetLevelOffers).not.toHaveBeenCalled()
  })
})
