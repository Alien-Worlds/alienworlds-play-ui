import { act, renderHook } from '@testing-library/react'

let mockLoreData: any

jest.mock('../data/LoreDataProvider', () => ({
  useLoreData: () => mockLoreData,
}))

import { useLiveVotePower } from './useLiveVotePower'

describe('useLiveVotePower', () => {
  afterEach(() => {
    jest.useRealTimers()
  })

  it('returns 0 when there is no last_claim', () => {
    mockLoreData = {
      globals: { power_per_day: '1.0000 TLM' },
      loreVoterInfo: { staked_amount: '100.0000 TLM', vote_power: '5.0000 TLM' },
    }

    const { result } = renderHook(() => useLiveVotePower())
    expect(result.current.currentVotePower).toBe(0)
  })

  it('returns 0 when the staked amount is zero', () => {
    mockLoreData = {
      globals: { power_per_day: '1.0000 TLM' },
      loreVoterInfo: {
        staked_amount: '0.0000 TLM',
        vote_power: '5.0000 TLM',
        last_claim: '2024-01-01T00:00:00.000Z',
      },
    }

    const { result } = renderHook(() => useLiveVotePower())
    expect(result.current.currentVotePower).toBe(0)
  })

  it('returns 0 when powerPerDay is missing', () => {
    mockLoreData = {
      globals: {},
      loreVoterInfo: {
        staked_amount: '100.0000 TLM',
        vote_power: '5.0000 TLM',
        last_claim: '2024-01-01T00:00:00.000Z',
      },
    }

    const { result } = renderHook(() => useLiveVotePower())
    expect(result.current.currentVotePower).toBe(0)
  })

  it('computes vote power from elapsed time since the last claim and polls for updates', () => {
    jest.useFakeTimers()
    jest.setSystemTime(new Date('2024-01-01T00:00:10.000Z'))

    mockLoreData = {
      globals: { power_per_day: '1.0000 TLM' },
      loreVoterInfo: {
        staked_amount: '8640.0000 TLM',
        vote_power: '5.0000 TLM',
        last_claim: '2024-01-01T00:00:00.000Z',
      },
    }

    const { result } = renderHook(() => useLiveVotePower(6000))
    // elapsed 10s: 5 + (10 * 8640 * 1) / 86400 = 5 + 1 = 6
    expect(result.current.currentVotePower).toBe(6)

    act(() => {
      jest.advanceTimersByTime(6000)
    })
    // elapsed 16s: 5 + (16 * 8640 * 1) / 86400 = 5 + 1.6 -> ceil -> 7
    expect(result.current.currentVotePower).toBe(7)
  })
})
