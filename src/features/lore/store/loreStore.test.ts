import { act, renderHook } from '@testing-library/react'

import { useLoreStore } from './loreStore'

describe('useLoreStore', () => {
  afterEach(() => {
    act(() => {
      useLoreStore.setState({ selectedProposalId: null, stakedInput: 0 })
    })
  })

  it('starts with no proposal selected and zero staked input', () => {
    const { result } = renderHook(() => useLoreStore())
    expect(result.current.selectedProposalId).toBeNull()
    expect(result.current.stakedInput).toBe(0)
  })

  it('selects a proposal', () => {
    const { result } = renderHook(() => useLoreStore())

    act(() => {
      result.current.selectProposal(42)
    })

    expect(result.current.selectedProposalId).toBe(42)
  })

  it('clears the selected proposal', () => {
    const { result } = renderHook(() => useLoreStore())

    act(() => {
      result.current.selectProposal(42)
    })
    expect(result.current.selectedProposalId).toBe(42)

    act(() => {
      result.current.clearSelection()
    })

    expect(result.current.selectedProposalId).toBeNull()
  })

  it('sets the staked input amount', () => {
    const { result } = renderHook(() => useLoreStore())

    act(() => {
      result.current.setStakedInput(1000)
    })

    expect(result.current.stakedInput).toBe(1000)
  })

  it('normalizes NaN staked input to zero', () => {
    const { result } = renderHook(() => useLoreStore())

    act(() => {
      result.current.setStakedInput(500)
    })
    expect(result.current.stakedInput).toBe(500)

    act(() => {
      result.current.setStakedInput(NaN)
    })

    expect(result.current.stakedInput).toBe(0)
  })
})
