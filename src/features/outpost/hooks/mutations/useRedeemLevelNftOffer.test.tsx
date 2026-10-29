import { ReactNode } from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'

import { useRedeemLevelNftOffer } from './useRedeemLevelNftOffer'

const mockRedeemLevelOffer = jest.fn()
jest.mock('features/outpost/utils/redeemOffers', () => ({
  redeemLevelOffer: (levelOfferId: number) => mockRedeemLevelOffer(levelOfferId),
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
  jest.spyOn(queryClient, 'resetQueries')
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
  return { queryClient, ...renderHook(() => useRedeemLevelNftOffer(), { wrapper }) }
}

describe('useRedeemLevelNftOffer', () => {
  beforeEach(() => jest.clearAllMocks())

  it('claims the level reward, toasts success and reloads the user points', async () => {
    mockRedeemLevelOffer.mockResolvedValue({ transaction_id: 'tx' })
    const { result, queryClient } = renderRedeem()

    act(() => result.current.mutate({ levelOfferId: 3 }))

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(mockRedeemLevelOffer).toHaveBeenCalledWith(3)
    expect(mockToastMessage).toHaveBeenCalledWith(
      'Rank Status Updated and NFT Successfully Claimed'
    )
    expect(queryClient.resetQueries).toHaveBeenCalledWith(['user-points'])
  })

  it('toasts the failure, not success, when the claim fails', async () => {
    mockRedeemLevelOffer.mockRejectedValue(new Error('User canceled request'))
    const { result } = renderRedeem()

    act(() => result.current.mutate({ levelOfferId: 3 }))

    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(mockToastErrorMessage).toHaveBeenCalledWith(
      'Rank Status failed to Update and NFT failed to Claim'
    )
    expect(mockToastMessage).not.toHaveBeenCalled()
  })
})
