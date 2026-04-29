import { useMemo } from 'react'

import { LandSlot, SlotVariant } from 'features/mining/types/LandownerTypes'
import { filter } from 'lodash'
import { useAppState } from 'store'

export const useLandBoostSlots = () => {
  const {
    wax: { managingLandBoostFullSlots },
  } = useAppState()

  const firstAvailableSlot = useMemo(() => {
    const usedSlots = filter(
      managingLandBoostFullSlots,
      (slot: LandSlot) => slot.mod === SlotVariant.USED
    )
    return usedSlots.length + 1
  }, [managingLandBoostFullSlots])

  const getFirstAvailableSlot = useMemo(() => () => firstAvailableSlot, [firstAvailableSlot])

  return {
    getFirstAvailableSlot: getFirstAvailableSlot,
    firstAvailableSlot,
  }
}
