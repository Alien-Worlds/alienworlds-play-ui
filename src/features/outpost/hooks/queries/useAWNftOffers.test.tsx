import { renderHook, waitFor } from '@testing-library/react'
import { DateTime } from 'luxon'
import { createQueryWrapper } from 'shared/hooks/queries/testUtils'
import { useSessionStore } from 'shared/store/sessionStore'

import { useAWNftOffers } from './useAWNftOffers'

jest.mock('shared/util/config', () => ({ config: { DemoUserWaxAccount: 'demo.wam' } }))

// The chain and AtomicAssets reads; the shared query hooks in between are real.
const mockGetPointsOffers = jest.fn()
jest.mock('shared/wax/userPoints', () => ({
  getPointsOffers: () => mockGetPointsOffers(),
}))

const mockGetTemplatesByIds = jest.fn()
jest.mock('shared/util/atomicassets', () => ({
  getTemplatesByIds: (ids: string[]) => mockGetTemplatesByIds(ids),
}))

const iso = (hoursFromNow: number) =>
  DateTime.utc().plus({ hours: hoursFromNow }).toISO({ includeOffset: false })
const offer = (id: number, startInHours: number, endInHours: number) => ({
  id,
  level: 1,
  template_id: id * 10,
  required: 1000,
  start: iso(startInHours),
  end: iso(endInHours),
})
const template = (template_id: string) => ({
  template_id,
  immutable_data: { img: `Qm${template_id}` },
})

const ongoing = offer(1, -24, 48)
const startsSoon = offer(2, 3, 72)
const ended = offer(3, -72, -1)
const startsNextWeek = offer(4, 24 * 7, 24 * 14)

describe('useAWNftOffers', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    useSessionStore.setState({ walletId: 'player.wam' })
    mockGetPointsOffers.mockResolvedValue([startsSoon, ended, ongoing, startsNextWeek])
    mockGetTemplatesByIds.mockResolvedValue([template('10'), template('20')])
  })

  afterEach(() => useSessionStore.setState({ walletId: null }))

  it('shows current offers, then those starting within a day, each with its NFT template', async () => {
    const { wrapper } = createQueryWrapper()
    const { result } = renderHook(() => useAWNftOffers(), { wrapper })

    await waitFor(() => expect(result.current.pointsOffers).toHaveLength(2))
    expect(result.current.pointsOffers).toEqual([
      { ...ongoing, asset: { ...template('10'), data: template('10').immutable_data } },
      { ...startsSoon, asset: { ...template('20'), data: template('20').immutable_data } },
    ])
  })

  it('only loads templates for the offers it shows', async () => {
    const { wrapper } = createQueryWrapper()
    renderHook(() => useAWNftOffers(), { wrapper })

    await waitFor(() => expect(mockGetTemplatesByIds).toHaveBeenCalledWith(['10', '20']))
  })

  it('is loading until both the offers and their templates are in', async () => {
    let resolveTemplates: (templates: unknown) => void
    mockGetTemplatesByIds.mockReturnValue(new Promise((resolve) => (resolveTemplates = resolve)))
    const { wrapper } = createQueryWrapper()
    const { result } = renderHook(() => useAWNftOffers(), { wrapper })

    expect(result.current.isLoading).toBe(true)
    await waitFor(() => expect(mockGetTemplatesByIds).toHaveBeenCalled())
    expect(result.current.isLoading).toBe(true)

    resolveTemplates([template('10'), template('20')])
    await waitFor(() => expect(result.current.isLoading).toBe(false))
  })

  it('leaves out an offer whose template is missing', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {})
    mockGetTemplatesByIds.mockResolvedValue([template('20')])
    const { wrapper } = createQueryWrapper()
    const { result } = renderHook(() => useAWNftOffers(), { wrapper })

    await waitFor(() => expect(result.current.pointsOffers).toHaveLength(1))
    expect(result.current.pointsOffers[0].id).toBe(2)
    jest.restoreAllMocks()
  })

  it('has no offers without a wallet, and loads no templates', async () => {
    useSessionStore.setState({ walletId: null })
    const { wrapper } = createQueryWrapper()
    const { result } = renderHook(() => useAWNftOffers(), { wrapper })

    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.pointsOffers).toEqual([])
    expect(mockGetPointsOffers).not.toHaveBeenCalled()
    expect(mockGetTemplatesByIds).not.toHaveBeenCalled()
  })
})
