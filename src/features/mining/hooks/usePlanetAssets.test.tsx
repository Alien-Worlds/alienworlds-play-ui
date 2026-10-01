import { renderHook, waitFor } from '@testing-library/react'
import { createQueryWrapper, mockStore } from 'features/mining/testUtils/mockStore'

import { usePlanetAssets } from './usePlanetAssets'

jest.mock('store', () => jest.requireActual('features/mining/testUtils/mockStore').storeMock)

const getAssetsByIds = jest.fn()

beforeEach(() => {
  getAssetsByIds.mockReset()
  getAssetsByIds.mockImplementation(async (ids: string[]) => ids.map((id) => ({ asset_id: id })))
  mockStore({ effects: { atomic: { api: { getAssetsByIds } } } })
})

describe('usePlanetAssets', () => {
  it('fetches assets in batches of 100 and joins them', async () => {
    const ids = Array.from({ length: 250 }, (_, i) => `${i}`)

    const { result } = renderHook(() => usePlanetAssets(ids), { wrapper: createQueryWrapper() })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(getAssetsByIds.mock.calls.map(([batch]) => batch.length)).toEqual([100, 100, 50])
    expect(result.current.data).toHaveLength(250)
    expect(ids).toHaveLength(250)
  })

  it('does not fetch without ids', () => {
    const { result } = renderHook(() => usePlanetAssets([]), { wrapper: createQueryWrapper() })

    expect(result.current.fetchStatus).toBe('idle')
    expect(getAssetsByIds).not.toHaveBeenCalled()
  })
})
