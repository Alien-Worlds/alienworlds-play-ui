import { act, renderHook } from '@testing-library/react'

import { useInventoryStore } from './inventoryStore'
import { PAGINATION } from '../constants'

describe('useInventoryStore', () => {
  afterEach(() => {
    act(() => {
      useInventoryStore.setState({ visibleCount: PAGINATION.DEFAULT_ITEMS_PER_PAGE })
    })
  })

  it('starts with the default page size visible', () => {
    const { result } = renderHook(() => useInventoryStore())
    expect(result.current.visibleCount).toBe(PAGINATION.DEFAULT_ITEMS_PER_PAGE)
  })

  it('increases visibleCount by one page on loadMore', () => {
    const { result } = renderHook(() => useInventoryStore())

    act(() => {
      result.current.loadMore(1000)
    })

    expect(result.current.visibleCount).toBe(PAGINATION.DEFAULT_ITEMS_PER_PAGE * 2)
  })

  it('caps visibleCount at the total when loading more than is available', () => {
    const { result } = renderHook(() => useInventoryStore())

    act(() => {
      result.current.loadMore(40)
    })

    expect(result.current.visibleCount).toBe(40)
  })

  it('does not exceed the total across repeated loadMore calls', () => {
    const { result } = renderHook(() => useInventoryStore())

    act(() => {
      result.current.loadMore(40)
      result.current.loadMore(40)
    })

    expect(result.current.visibleCount).toBe(40)
  })

  it('resets visibleCount back to the default page size', () => {
    const { result } = renderHook(() => useInventoryStore())

    act(() => {
      result.current.loadMore(1000)
    })
    expect(result.current.visibleCount).toBe(PAGINATION.DEFAULT_ITEMS_PER_PAGE * 2)

    act(() => {
      result.current.reset()
    })

    expect(result.current.visibleCount).toBe(PAGINATION.DEFAULT_ITEMS_PER_PAGE)
  })
})
