import { act, renderHook } from '@testing-library/react'

import { useLoreDashboard } from './useLoreDashboard'
import { useLoreStore } from '../store/loreStore'

let mockLoreData: any
let mockLoreFilter: any

jest.mock('../data/LoreDataProvider', () => ({
  useLoreData: () => mockLoreData,
}))

jest.mock('store', () => ({
  useAppState: () => ({
    wax: { loreFilter: mockLoreFilter },
  }),
}))

describe('useLoreDashboard', () => {
  beforeEach(() => {
    mockLoreFilter = { sortBy: 0, reversed: false }
    mockLoreData = {
      loadingLores: false,
      proposals: [
        { proposal_id: 1, title: 'Zeta', proposer: 'bob' },
        { proposal_id: 2, title: 'Alpha', proposer: 'alice' },
      ],
    }
    act(() => {
      useLoreStore.setState({ selectedProposalId: null, stakedInput: 0 })
    })
  })

  it('reflects the loading state from lore data', () => {
    mockLoreData = { ...mockLoreData, loadingLores: true }
    const { result } = renderHook(() => useLoreDashboard())
    expect(result.current.isLoading).toBe(true)
  })

  it('has no lore selected initially', () => {
    const { result } = renderHook(() => useLoreDashboard())
    expect(result.current.selectedProposalId).toBeNull()
    expect(result.current.selectedLore).toBeNull()
  })

  it('selects a lore by proposal id', () => {
    const { result } = renderHook(() => useLoreDashboard())

    act(() => {
      result.current.handleSelectLore(2)
    })

    expect(result.current.selectedProposalId).toBe(2)
    expect(result.current.selectedLore?.title).toBe('Alpha')
  })

  it('clears the selection', () => {
    const { result } = renderHook(() => useLoreDashboard())

    act(() => {
      result.current.handleSelectLore(1)
    })
    expect(result.current.selectedProposalId).toBe(1)

    act(() => {
      result.current.clearSelection()
    })

    expect(result.current.selectedProposalId).toBeNull()
    expect(result.current.selectedLore).toBeNull()
  })

  it('shares selection state across hook instances via the store', () => {
    const { result: dashboardA } = renderHook(() => useLoreDashboard())
    const { result: dashboardB } = renderHook(() => useLoreDashboard())

    act(() => {
      dashboardA.current.handleSelectLore(1)
    })

    expect(dashboardB.current.selectedProposalId).toBe(1)
  })
})
