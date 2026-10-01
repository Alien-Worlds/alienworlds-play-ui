import { SlotVariant } from 'features/mining/types/LandownerTypes'

import { fetchLandBoostsByDay, getLandBoostSlots } from './landBoosts'

const mockGetTableRows = jest.fn()
jest.mock('shared/wax/tables', () => ({
  getTableRows: (query: unknown) => mockGetTableRows(query),
}))

const mockToastErrorMessage = jest.fn()
jest.mock('shared/util/toast', () => ({
  toastErrorMessage: (message: string) => mockToastErrorMessage(message),
}))

beforeEach(() => jest.clearAllMocks())

describe('fetchLandBoostsByDay', () => {
  it("reads the land's boosts and adds each boost level's details", async () => {
    mockGetTableRows.mockResolvedValue([
      { day: 7, boosts_used: [{ booster: 'bob.wam', level: 40000 }] },
    ])

    const boosts = await fetchLandBoostsByDay('42', 7)

    expect(mockGetTableRows).toHaveBeenCalledWith({
      table: 'boosts',
      scope: 'awlndratings',
      code: 'awlndratings',
      upper_bound: '42',
      lower_bound: '42',
      limit: 1,
    })
    expect(boosts).toEqual([
      { booster: 'bob.wam', name: 'Small Boost', percentage: 0.03, price: 4 },
    ])
  })

  it('returns no boosts when the latest row is another day', async () => {
    mockGetTableRows.mockResolvedValue([{ day: 6, boosts_used: [{ booster: 'a', level: 40000 }] }])

    expect(await fetchLandBoostsByDay('42', 7)).toEqual([])
  })

  it('returns null without a table result', async () => {
    mockGetTableRows.mockResolvedValue(null)

    expect(await fetchLandBoostsByDay('42', 7)).toBeNull()
  })

  it('toasts and returns null when the read fails', async () => {
    mockGetTableRows.mockRejectedValue(new Error('rpc down'))

    expect(await fetchLandBoostsByDay('42', 7)).toBeNull()
    expect(mockToastErrorMessage).toHaveBeenCalledWith('rpc down')
  })
})

describe('getLandBoostSlots', () => {
  const boost: any = { name: 'Small Boost', booster: 'bob.wam', percentage: 0.03 }

  it('lists used, open, the next locked and the remaining slots, 15 in all', () => {
    const slots = getLandBoostSlots([boost], { data: { openslots: 3 } } as any)

    expect(slots).toHaveLength(15)
    expect(slots[0]).toEqual({
      mod: SlotVariant.USED,
      number: 1,
      name: 'Small Boost',
      origin: 'bob.wam',
      percentage: 0.03,
    })
    expect(slots.slice(1, 5).map((x) => x.mod)).toEqual([
      SlotVariant.ADD,
      SlotVariant.ADD,
      SlotVariant.LOCKED,
      SlotVariant.EMPTY,
    ])
    expect(slots.map((x) => x.number)).toEqual(Array.from({ length: 15 }, (_, i) => i + 1))
  })

  it('has no locked slot when all 15 are open', () => {
    const slots = getLandBoostSlots([], { data: { openslots: 15 } } as any)

    expect(slots.every((x) => x.mod === SlotVariant.ADD)).toBe(true)
  })

  it('has no slots without a land', () => {
    expect(getLandBoostSlots([boost], null)).toEqual([])
  })
})
