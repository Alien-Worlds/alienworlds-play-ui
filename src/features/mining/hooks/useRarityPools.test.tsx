import { renderHook, waitFor } from '@testing-library/react'
import { createQueryWrapper, mockStore } from 'features/mining/testUtils/mockStore'

import { useRarityPools } from './useRarityPools'

jest.mock('store', () => jest.requireActual('features/mining/testUtils/mockStore').storeMock)

const getRarityPools = jest.fn()

beforeEach(() => {
  getRarityPools.mockReset()
  mockStore({ effects: { wax: { api: { getRarityPools } } } })
})

const RARITIES = ['Abundant', 'Common', 'Rare', 'Epic', 'Legendary', 'Mythical']

describe('useRarityPools', () => {
  it('returns the pools in rarity order with their amounts and rates', async () => {
    getRarityPools.mockResolvedValue({
      pool_buckets: [...RARITIES].reverse().map((key, i) => ({ key, value: `${i + 1}.5000 TLM` })),
      rates: [{ key: 'Rare', value: '12.5' }],
    })

    const { result } = renderHook(() => useRarityPools('eyeke'), {
      wrapper: createQueryWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(getRarityPools).toHaveBeenCalledWith('eyeke')
    expect(result.current.data.map((x) => x.rarityName)).toEqual(RARITIES)
    expect(result.current.data[2]).toEqual({
      rarityName: 'Rare',
      amount: '4.5000 TLM',
      rawAmount: 4.5,
      percentage: 12.5,
    })
    expect(result.current.data[0].percentage).toBe(0)
  })

  it('returns no pools when the chain returns nothing', async () => {
    getRarityPools.mockResolvedValue(null)

    const { result } = renderHook(() => useRarityPools('eyeke'), {
      wrapper: createQueryWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual([])
  })

  it('does not fetch without a planet', () => {
    const { result } = renderHook(() => useRarityPools(''), { wrapper: createQueryWrapper() })

    expect(result.current.fetchStatus).toBe('idle')
  })
})
