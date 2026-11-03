import { renderHook, waitFor } from '@testing-library/react'
import { useSessionStore } from 'shared/store/sessionStore'

import { useLoadAWNftOffers } from './useLoadAWNftOffers'
import { createQueryWrapper } from '../testUtils'

jest.mock('shared/util/config', () => ({ config: { DemoUserWaxAccount: 'demo.wam' } }))

const mockGetPointsOffers = jest.fn()
jest.mock('shared/wax/userPoints', () => ({
  getPointsOffers: () => mockGetPointsOffers(),
}))

describe('useLoadAWNftOffers', () => {
  beforeEach(() => {
    mockGetPointsOffers.mockReset().mockResolvedValue([{ id: 1 }])
    useSessionStore.setState({ walletId: 'player.wam' })
  })

  afterEach(() => useSessionStore.setState({ walletId: null }))

  it("loads the AW NFT offers under the key outpost's fuse refreshes", async () => {
    const { queryClient, wrapper } = createQueryWrapper()
    const { result } = renderHook(() => useLoadAWNftOffers(), { wrapper })

    await waitFor(() => expect(result.current.data).toEqual([{ id: 1 }]))
    expect(queryClient.getQueryData(['aw-nft-offers'])).toEqual([{ id: 1 }])
  })

  it('has no offers without a wallet, without reading the chain', async () => {
    useSessionStore.setState({ walletId: null })
    const { wrapper } = createQueryWrapper()
    const { result } = renderHook(() => useLoadAWNftOffers(), { wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toBeNull()
    expect(mockGetPointsOffers).not.toHaveBeenCalled()
  })
})
