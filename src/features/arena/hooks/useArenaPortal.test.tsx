import React from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'

import { useArenaCategories, useArenaPortal } from './useArenaPortal'

jest.mock('shared/util/config', () => ({
  config: {
    ArenaPortalApiUrl: 'https://example.com/arena-portal',
    ArenaCategoriesApiUrl: 'https://example.com/arena-categories',
    CMSApiToken: 'token',
  },
}))

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  // eslint-disable-next-line react/display-name
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

describe('useArenaPortal', () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('sorts and returns arena portal items by sortOrder', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      json: async () => ({
        data: [
          { id: 2, attributes: { sortOrder: 2 } },
          { id: 1, attributes: { sortOrder: 1 } },
        ],
      }),
    }) as jest.Mock

    const { result } = renderHook(() => useArenaPortal(), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data.map((item) => item.id)).toEqual([1, 2])
  })

  it('appends default pagination page size to the request URL', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      json: async () => ({ data: [] }),
    }) as jest.Mock

    const { result } = renderHook(() => useArenaPortal(), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('pagination%5BpageSize%5D=100'),
      expect.any(Object)
    )
  })
})

describe('useArenaCategories', () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('returns arena categories from the API response', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      json: async () => ({ data: [{ id: 1, attributes: { name: 'Racing' } }] }),
    }) as jest.Mock

    const { result } = renderHook(() => useArenaCategories(), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data).toEqual([{ id: 1, attributes: { name: 'Racing' } }])
  })
})
