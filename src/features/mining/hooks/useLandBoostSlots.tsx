import { useMemo } from 'react'

import { useMiningStore } from 'features/mining/store/miningStore'
import { LandSlot, SlotVariant } from 'features/mining/types/LandownerTypes'
import { filter } from 'lodash'

export const useLandBoostSlots = () => {
  const managingLandBoostFullSlots = useMiningStore((state) => state.managingLandBoostFullSlots)

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
