import { renderHook, waitFor } from '@testing-library/react'
import { createQueryWrapper } from 'shared/hooks/queries/testUtils'
import { useSessionStore } from 'shared/store/sessionStore'

import { useLevelNftOffers } from './useLevelNftOffers'

jest.mock('shared/util/config', () => ({ config: { DemoUserWaxAccount: 'demo.wam' } }))

// The chain and AtomicAssets reads; the shared query hooks in between are real.
const mockGetLevelOffers = jest.fn()
jest.mock('shared/wax/userPoints', () => ({
  getLevelOffers: () => mockGetLevelOffers(),
}))

const mockGetTemplatesByIds = jest.fn()
jest.mock('shared/util/atomicassets', () => ({
  getTemplatesByIds: (ids: string[]) => mockGetTemplatesByIds(ids),
}))

const levelOffer = (level: number) => ({
  id: level,
  level,
  template_id: level * 100,
  required: level * 1000,
})
const template = (template_id: string) => ({
  template_id,
  immutable_data: { img: `Qm${template_id}` },
})

describe('useLevelNftOffers', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    useSessionStore.setState({ walletId: 'player.wam' })
  })

  afterEach(() => useSessionStore.setState({ walletId: null }))

  it('gives each level reward its NFT template', async () => {
    mockGetLevelOffers.mockResolvedValue([levelOffer(2), levelOffer(3)])
    mockGetTemplatesByIds.mockResolvedValue([template('200'), template('300')])
    const { wrapper } = createQueryWrapper()
    const { result } = renderHook(() => useLevelNftOffers(), { wrapper })

    await waitFor(() => expect(result.current.levelNftOffers).toHaveLength(2))
    expect(mockGetTemplatesByIds).toHaveBeenCalledWith(['200', '300'])
    expect(result.current.levelNftOffers[1]).toEqual({
      ...levelOffer(3),
      asset: { ...template('300'), data: template('300').immutable_data },
    })
    expect(result.current.isLoading).toBe(false)
  })

  it('has no rewards, and loads no templates, when there are no level offers', async () => {
    mockGetLevelOffers.mockResolvedValue(null)
    const { wrapper } = createQueryWrapper()
    const { result } = renderHook(() => useLevelNftOffers(), { wrapper })

    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.levelNftOffers).toEqual([])
    expect(mockGetTemplatesByIds).not.toHaveBeenCalled()
  })
})
