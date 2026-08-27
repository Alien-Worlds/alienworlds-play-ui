import { act, renderHook } from '@testing-library/react'

import { useProfileStore } from './profileStore'

describe('useProfileStore', () => {
  afterEach(() => {
    act(() => {
      useProfileStore.setState({ claimingStates: {} })
    })
  })

  it('starts with an empty claimingStates map', () => {
    const { result } = renderHook(() => useProfileStore())
    expect(result.current.claimingStates).toEqual({})
  })

  it('sets a claiming state for a given key', () => {
    const { result } = renderHook(() => useProfileStore())

    act(() => {
      result.current.setClaiming('mining', true)
    })

    expect(result.current.claimingStates).toEqual({ mining: true })
  })

  it('updates one key without clobbering others', () => {
    const { result } = renderHook(() => useProfileStore())

    act(() => {
      result.current.setClaiming('mining', true)
      result.current.setClaiming('commission', true)
    })

    act(() => {
      result.current.setClaiming('mining', false)
    })

    expect(result.current.claimingStates).toEqual({ mining: false, commission: true })
  })
})
