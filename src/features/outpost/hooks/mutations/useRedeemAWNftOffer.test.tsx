import { ReactNode } from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'

import { useRedeemAWNftOffer } from './useRedeemAWNftOffer'

const mockRedeemAWNftOffer = jest.fn()
jest.mock('features/outpost/utils/redeemOffers', () => ({
  redeemAWNftOffer: (offerId: number) => mockRedeemAWNftOffer(offerId),
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
  jest.spyOn(queryClient, 'invalidateQueries')
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
  return { queryClient, ...renderHook(() => useRedeemAWNftOffer(), { wrapper }) }
}

describe('useRedeemAWNftOffer', () => {
  beforeEach(() => jest.clearAllMocks())

  it('redeems the offer, toasts success and refreshes the AW offers', async () => {
    mockRedeemAWNftOffer.mockResolvedValue({ transaction_id: 'tx' })
    const { result, queryClient } = renderRedeem()

    act(() => result.current.mutate({ offerId: 5, pointsRequired: 100 }))

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(mockRedeemAWNftOffer).toHaveBeenCalledWith(5)
    expect(mockToastMessage).toHaveBeenCalledWith('Fuse success')
    expect(queryClient.invalidateQueries).toHaveBeenCalledWith(['aw-nft-offers'])
  })

  it('shows "Not enough shards", not success, when the chain rejects for points', async () => {
    mockRedeemAWNftOffer.mockRejectedValue(
      new Error('assertion failure with message: Not enough points available')
    )
    const { result } = renderRedeem()

    act(() => result.current.mutate({ offerId: 5, pointsRequired: 100 }))

    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(mockToastErrorMessage).toHaveBeenCalledWith('Not enough shards')
    expect(mockToastMessage).not.toHaveBeenCalled()
  })

  it('shows "Fuse failed" for any other failure, e.g. rejecting in the wallet', async () => {
    mockRedeemAWNftOffer.mockRejectedValue(new Error('User canceled request'))
    const { result } = renderRedeem()

    act(() => result.current.mutate({ offerId: 5, pointsRequired: 100 }))

    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(mockToastErrorMessage).toHaveBeenCalledWith('Fuse failed')
    expect(mockToastMessage).not.toHaveBeenCalled()
  })
})
