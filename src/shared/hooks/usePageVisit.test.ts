import { renderHook } from '@testing-library/react'
import { useAssetsStore } from 'shared/store/assetsStore'
import { useModalStore } from 'shared/store/modalStore'
import { PagePath } from 'store/main/types'

import { usePageVisit } from './usePageVisit'

const mockCollectEvent = jest.fn()
jest.mock('store', () => ({
  useActions: () => ({ wax: { collectEvent: mockCollectEvent } }),
}))

const presetAssetsFilter = jest.fn()

beforeEach(() => {
  jest.clearAllMocks()
  useAssetsStore.setState({ presetAssetsFilter })
  useModalStore.setState({ isMainDrawerOpen: true })
})

describe('usePageVisit', () => {
  it('closes the main drawer and records the visit once', () => {
    const { rerender } = renderHook(() => usePageVisit(PagePath.Planet))
    rerender()

    expect(useModalStore.getState().isMainDrawerOpen).toBe(false)
    expect(mockCollectEvent).toHaveBeenCalledTimes(1)
    expect(mockCollectEvent).toHaveBeenCalledWith({
      name: 'page_visit',
      fields: { location: '/mining/planet' },
    })
    expect(presetAssetsFilter).not.toHaveBeenCalled()
  })

  it("presets the page's asset filter when asked", () => {
    renderHook(() => usePageVisit(PagePath.Inventory, { presetAssetsFilter: true }))

    expect(presetAssetsFilter).toHaveBeenCalledTimes(1)
  })
})
