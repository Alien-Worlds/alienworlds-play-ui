import { renderHook, waitFor } from '@testing-library/react'
import { useSessionStore } from 'shared/store/sessionStore'

import { useGetMemberTerms } from './useGetMemberTerms'
import { createQueryWrapper } from '../testUtils'

jest.mock('shared/util/config', () => ({ config: { DemoUserWaxAccount: 'demo.wam' } }))

const mockFetchIpfsText = jest.fn()
jest.mock('shared/util/ipfs', () => ({
  fetchIpfsText: (ipfsId: string) => mockFetchIpfsText(ipfsId),
}))

describe('useGetMemberTerms', () => {
  beforeEach(() => {
    mockFetchIpfsText.mockReset().mockResolvedValue('# Member terms')
    useSessionStore.setState({ walletId: 'player.wam' })
  })

  afterEach(() => useSessionStore.setState({ walletId: null }))

  it("loads the planet's member terms from IPFS", async () => {
    const { wrapper } = createQueryWrapper()
    const { result } = renderHook(() => useGetMemberTerms('QmTerms'), { wrapper })

    await waitFor(() => expect(result.current.data).toBe('# Member terms'))
    expect(mockFetchIpfsText).toHaveBeenCalledWith('QmTerms')
  })

  it("waits until the planet's terms id is known", () => {
    const { wrapper } = createQueryWrapper()
    renderHook(() => useGetMemberTerms(undefined), { wrapper })

    expect(mockFetchIpfsText).not.toHaveBeenCalled()
  })

  it('has no terms without a wallet, without fetching', async () => {
    useSessionStore.setState({ walletId: null })
    const { wrapper } = createQueryWrapper()
    const { result } = renderHook(() => useGetMemberTerms('QmTerms'), { wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toBeNull()
    expect(mockFetchIpfsText).not.toHaveBeenCalled()
  })
})
