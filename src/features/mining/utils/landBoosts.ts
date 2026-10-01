import { IAsset } from 'atomicassets/build/API/Explorer/Objects'
import { LandBoost, LandSlot, SlotVariant } from 'features/mining/types/LandownerTypes'
import { BoostLevels } from 'features/mining/utils/constants'
import { filter, find, forEach, map } from 'lodash'
import { Constants } from 'shared/util/constants'
import { toastErrorMessage } from 'shared/util/toast'
import { getTableRows } from 'shared/wax/tables'

type LandBoostsRow = { day: number; boosts_used: { booster: string; level: number }[] }

/**
 * The boosts applied to a land on a given 25h day, each with its boost level's details.
 * Toasts and returns null if the chain read fails. Ported from Overmind's wax.getLandBoostsByDay.
 */
export const fetchLandBoostsByDay = async (
  landId: string,
  day: number
): Promise<LandBoost[] | null> => {
  try {
    const rows = await getTableRows<LandBoostsRow>({
      table: Constants.CONTRACT_TABLE_LANDBOOSTS,
      scope: Constants.CONTRACT_LAND_RATINGS,
      code: Constants.CONTRACT_LAND_RATINGS,
      upper_bound: landId,
      lower_bound: landId,
      limit: 1, // the latest day's boosts
    })
    if (!rows) return null

    const [boostsOfDay] = filter(rows, (row) => row.day === day)
    if (!boostsOfDay) return []

    return map(boostsOfDay.boosts_used, ({ level, ...rest }) => ({
      ...rest,
      ...find(BoostLevels, (l) => l.price === level / 10000),
    }))
  } catch (error) {
    toastErrorMessage(error?.message ?? 'Load Land Boosts has failed.')
    console.error(error)
    return null
  }
}

const TOTAL_SLOTS = 15

/**
 * A land's 15 boost slots: used ones (with their boost), open ones, the next locked one that can
 * be unlocked, and the remaining locked ones.
 */
export const getLandBoostSlots = (boosts: LandBoost[], land: IAsset | null): LandSlot[] => {
  if (!land) return []

  const openSlots = land.data?.openslots ?? Constants.DEFAULT_LAND_OPENSLOTS
  const slots: LandSlot[] = []

  forEach(boosts, (boost, index) => {
    slots.push({
      mod: SlotVariant.USED,
      number: index + 1,
      name: boost.name,
      origin: boost.booster,
      percentage: boost.percentage,
    })
  })

  forEach(Array(Math.max(openSlots - boosts.length, 0)), () => {
    slots.push({ mod: SlotVariant.ADD, number: slots.length + 1 })
  })

  if (slots.length < TOTAL_SLOTS) {
    slots.push({ mod: SlotVariant.LOCKED, number: slots.length + 1 })
  }

  forEach(Array(TOTAL_SLOTS - slots.length), () => {
    slots.push({ mod: SlotVariant.EMPTY, number: slots.length + 1 })
  })

  return slots
}
