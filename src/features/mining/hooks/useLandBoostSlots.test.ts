import { renderHook } from '@testing-library/react'
import { mockStore } from 'features/mining/testUtils/mockStore'
import { SlotVariant } from 'features/mining/types/LandownerTypes'

import { useLandBoostSlots } from './useLandBoostSlots'

jest.mock('store', () => jest.requireActual('features/mining/testUtils/mockStore').storeMock)

const render = (managingLandBoostFullSlots: any[] | null) => {
  mockStore({ state: { wax: { managingLandBoostFullSlots } } })
  return renderHook(() => useLandBoostSlots()).result.current
}

describe('useLandBoostSlots', () => {
  it('points at the slot after the used ones', () => {
    const result = render([
      { mod: SlotVariant.USED, number: 1 },
      { mod: SlotVariant.USED, number: 2 },
      { mod: SlotVariant.ADD, number: 3 },
      { mod: SlotVariant.LOCKED, number: 4 },
    ])

    expect(result.firstAvailableSlot).toBe(3)
    expect(result.getFirstAvailableSlot()).toBe(3)
  })

  it('starts at slot 1 when nothing is loaded', () => {
    expect(render(null).firstAvailableSlot).toBe(1)
  })
})
