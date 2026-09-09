import { renderHook } from '@testing-library/react'

import {
  LoreDataProvider,
  useLoreData,
  useLoreGlobals,
  useLoreLoadingState,
  useLoreProposals,
  useLoreVotingInfo,
} from './LoreDataProvider'

let mockLoresResult: any = { lores: null, loading: false }
let mockWalletDetailsResult: any = { walletDetails: null, loading: false }

jest.mock('graphql/hooks/useLoreProposals', () => ({
  useLores: () => mockLoresResult,
}))

jest.mock('graphql/hooks/useWalletDetails', () => ({
  useWalletDetails: () => mockWalletDetailsResult,
}))

jest.mock('store', () => ({
  useAppState: () => ({
    wax: { walletId: 'wallet.wam' },
  }),
}))

describe('LoreDataProvider', () => {
  beforeEach(() => {
    mockLoresResult = {
      lores: {
        proposals: [{ proposal_id: 1, title: 'Lore 1' }],
        globals: { fee: '200.0000 TLM', power_per_day: '0.0100 TLM' },
      },
      loading: false,
    }
    mockWalletDetailsResult = {
      walletDetails: {
        tlm_balance: '10.0000 TLM',
        tokenized_lore: { staked_amount: '5.0000 TLM' },
      },
      loading: false,
    }
  })

  it('throws when useLoreData is used outside the provider', () => {
    const { result } = renderHook(() => {
      try {
        return useLoreData()
      } catch (error) {
        return error
      }
    })
    expect(result.current).toBeInstanceOf(Error)
    expect((result.current as Error).message).toBe(
      'useLoreData must be used within a LoreDataProvider'
    )
  })

  it('exposes proposals, globals, wallet details and loading flags', () => {
    const { result } = renderHook(() => useLoreData(), {
      wrapper: ({ children }) => <LoreDataProvider>{children}</LoreDataProvider>,
    })

    expect(result.current.proposals).toEqual([{ proposal_id: 1, title: 'Lore 1' }])
    expect(result.current.globals).toEqual({ fee: '200.0000 TLM', power_per_day: '0.0100 TLM' })
    expect(result.current.walletDetails.tlm_balance).toBe('10.0000 TLM')
    expect(result.current.loreVoterInfo).toEqual({ staked_amount: '5.0000 TLM' })
    expect(result.current.loadingLores).toBe(false)
    expect(result.current.walletDetailsLoading).toBe(false)
  })

  it('defaults proposals to an empty array and lores to null when there is no data', () => {
    mockLoresResult = { lores: null, loading: true }

    const { result } = renderHook(() => useLoreData(), {
      wrapper: ({ children }) => <LoreDataProvider>{children}</LoreDataProvider>,
    })

    expect(result.current.lores).toBeNull()
    expect(result.current.proposals).toEqual([])
    expect(result.current.globals).toBeUndefined()
    expect(result.current.loadingLores).toBe(true)
  })

  it('useLoreGlobals returns only the globals slice', () => {
    const { result } = renderHook(() => useLoreGlobals(), {
      wrapper: ({ children }) => <LoreDataProvider>{children}</LoreDataProvider>,
    })

    expect(result.current).toEqual({ fee: '200.0000 TLM', power_per_day: '0.0100 TLM' })
  })

  it('useLoreProposals returns only the proposals slice', () => {
    const { result } = renderHook(() => useLoreProposals(), {
      wrapper: ({ children }) => <LoreDataProvider>{children}</LoreDataProvider>,
    })

    expect(result.current).toEqual([{ proposal_id: 1, title: 'Lore 1' }])
  })

  it('useLoreLoadingState returns only the loading flags', () => {
    mockWalletDetailsResult = { walletDetails: null, loading: true }

    const { result } = renderHook(() => useLoreLoadingState(), {
      wrapper: ({ children }) => <LoreDataProvider>{children}</LoreDataProvider>,
    })

    expect(result.current).toEqual({ loadingLores: false, walletDetailsLoading: true })
  })

  it('useLoreVotingInfo returns the voter info and wallet details', () => {
    const { result } = renderHook(() => useLoreVotingInfo(), {
      wrapper: ({ children }) => <LoreDataProvider>{children}</LoreDataProvider>,
    })

    expect(result.current.loreVoterInfo).toEqual({ staked_amount: '5.0000 TLM' })
    expect(result.current.walletDetails.tlm_balance).toBe('10.0000 TLM')
  })
})
