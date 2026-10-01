import { renderHook, waitFor } from '@testing-library/react'
import { createQueryWrapper } from 'features/mining/testUtils/mockStore'

import { useRarityPools } from './useRarityPools'

const mockGetRarityPools = jest.fn()
jest.mock('features/mining/utils/chainReads', () => ({
  getRarityPools: (planet: string) => mockGetRarityPools(planet),
}))

beforeEach(() => {
  mockGetRarityPools.mockReset()
})

const RARITIES = ['Abundant', 'Common', 'Rare', 'Epic', 'Legendary', 'Mythical']

describe('useRarityPools', () => {
  it('returns the pools in rarity order with their amounts and rates', async () => {
    mockGetRarityPools.mockResolvedValue({
      pool_buckets: [...RARITIES].reverse().map((key, i) => ({ key, value: `${i + 1}.5000 TLM` })),
      rates: [{ key: 'Rare', value: '12.5' }],
    })

    const { result } = renderHook(() => useRarityPools('eyeke'), {
      wrapper: createQueryWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(mockGetRarityPools).toHaveBeenCalledWith('eyeke')
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
    mockGetRarityPools.mockResolvedValue(null)

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
