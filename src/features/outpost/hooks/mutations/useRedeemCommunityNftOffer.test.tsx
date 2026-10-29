import { ReactNode } from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'

import { useRedeemCommunityNftOffer } from './useRedeemCommunityNftOffer'

const mockRedeemCommunityNftOffer = jest.fn()
jest.mock('features/outpost/utils/redeemOffers', () => ({
  redeemCommunityNftOffer: (offerId: number) => mockRedeemCommunityNftOffer(offerId),
}))

const mockToastMessage = jest.fn()
const mockToastErrorMessage = jest.fn()
jest.mock('shared/util/toast', () => ({
  toastMessage: (message: string) => mockToastMessage(message),
  toastErrorMessage: (message: string) => mockToastErrorMessage(message),
}))

const renderRedeem = () => {
  const queryClient = new QueryClient({
    defaultOptions: { mutations: { retry: false } },
    // Failed mutations are expected here; keep React Query from logging them.
    logger: { log: () => {}, warn: () => {}, error: () => {} },
  })
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
  return renderHook(() => useRedeemCommunityNftOffer(), { wrapper })
}

describe('useRedeemCommunityNftOffer', () => {
  beforeEach(() => jest.clearAllMocks())

  it('redeems the offer and toasts success', async () => {
    mockRedeemCommunityNftOffer.mockResolvedValue({ transaction_id: 'tx' })
    const { result } = renderRedeem()

    act(() => result.current.mutate({ offerId: 8, pointsRequired: 50 }))

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(mockRedeemCommunityNftOffer).toHaveBeenCalledWith(8)
    expect(mockToastMessage).toHaveBeenCalledWith('Fuse success')
  })

  it('shows "Not enough shards", not success, when the chain rejects for points', async () => {
    mockRedeemCommunityNftOffer.mockRejectedValue(new Error('Not enough points available'))
    const { result } = renderRedeem()

    act(() => result.current.mutate({ offerId: 8, pointsRequired: 50 }))

    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(mockToastErrorMessage).toHaveBeenCalledWith('Not enough shards')
    expect(mockToastMessage).not.toHaveBeenCalled()
  })

  it('shows "Fuse failed" for any other failure', async () => {
    mockRedeemCommunityNftOffer.mockRejectedValue(new Error('User canceled request'))
    const { result } = renderRedeem()

    act(() => result.current.mutate({ offerId: 8, pointsRequired: 50 }))

    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(mockToastErrorMessage).toHaveBeenCalledWith('Fuse failed')
  })
})
