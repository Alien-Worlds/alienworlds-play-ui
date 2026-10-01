import { AssetSchema } from 'store/atomic/types'
import {
  calculateChargeTime,
  calculateMineDelay,
  calculateMiningPower,
  calculateNftLuck,
  calculatePow,
  mapBagToMiningParams,
} from 'store/main/helpers'

const tool = (data: Record<string, any>, schema = AssetSchema.TOOL): any => ({
  schema: { schema_name: schema },
  data: { delay: 0, difficulty: 0, ease: 0, luck: 0, rarity: 'Common', ...data },
})

const land: any = { data: { delay: 20, difficulty: 1, ease: 15, luck: 12 } }

describe('mapBagToMiningParams', () => {
  it('sums one tool as-is', () => {
    expect(mapBagToMiningParams([tool({ delay: 100, difficulty: 2, ease: 30 })])).toEqual({
      delay: 100,
      difficulty: 2,
      ease: 3,
    })
  })

  it('takes half the fastest charge off for two tools', () => {
    expect(mapBagToMiningParams([tool({ delay: 100 }), tool({ delay: 61 })]).delay).toBe(131)
  })

  it('takes the fastest charge off for three tools', () => {
    expect(
      mapBagToMiningParams([tool({ delay: 100 }), tool({ delay: 60 }), tool({ delay: 80 })]).delay
    ).toBe(180)
  })

  it('is zero for an empty bag', () => {
    expect(mapBagToMiningParams([])).toEqual({ delay: 0, difficulty: 0, ease: 0 })
  })
})

describe('calculateChargeTime', () => {
  it('scales the bag charge by the land multiplier', () => {
    expect(calculateChargeTime([tool({ delay: 100 })], land)).toBe(200)
  })

  it('rounds to whole seconds', () => {
    expect(calculateChargeTime([tool({ delay: 33 })], { data: { delay: 15 } } as any)).toBe(50)
  })

  it.each([
    ['bag', null, land],
    ['land', [tool({ delay: 100 })], null],
  ])('returns -1 without a %s', (_, bag, l) => {
    expect(calculateChargeTime(bag, l)).toBe(-1)
  })
})

describe('calculateMiningPower', () => {
  it('multiplies the summed tool power by the land power', () => {
    expect(calculateMiningPower([tool({ ease: 30 }), tool({ ease: 12 })], land)).toBe('6.30')
  })

  it('is 0.00 without a bag or land', () => {
    expect(calculateMiningPower(null, land)).toBe('0.00')
    expect(calculateMiningPower([tool({ ease: 30 })], null)).toBe('0.00')
  })
})

describe('calculateNftLuck', () => {
  it('multiplies the summed tool luck by the land luck', () => {
    expect(calculateNftLuck([tool({ luck: 20 }), tool({ luck: 5 })], land)).toBe('3.00')
  })

  it('ignores abundant tools', () => {
    expect(
      calculateNftLuck([tool({ luck: 20, rarity: 'Abundant' }), tool({ luck: 5 })], land)
    ).toBe('0.60')
  })

  it('counts abundant NFTs that are not tools', () => {
    expect(calculateNftLuck([tool({ luck: 20, rarity: 'Abundant' }, AssetSchema.CREW)], land)).toBe(
      '2.40'
    )
  })

  it('is 0.00 without a bag or land', () => {
    expect(calculateNftLuck(null, land)).toBe('0.00')
  })
})

describe('calculatePow', () => {
  it('adds the tool and land difficulty', () => {
    expect(calculatePow([tool({ difficulty: 2 }), tool({ difficulty: 3 })], land)).toBe(6)
  })

  it('is empty without a bag or land', () => {
    expect(calculatePow(null, land)).toBe('')
  })
})

describe('calculateMineDelay', () => {
  const params = (delay: number) => ({ delay, difficulty: 0, ease: 0 })

  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(new Date('2026-09-30T12:00:00.000Z'))
  })

  afterEach(() => jest.useRealTimers())

  it('has no delay before the first mine', () => {
    expect(calculateMineDelay('0'.repeat(64), '2026-09-30T11:59:59', params(100), params(10))).toBe(
      0
    )
  })

  it('returns the milliseconds left on the charge', () => {
    // 60s charge x 1.5 land multiplier = 90s, mined 30s ago
    expect(calculateMineDelay('abc', '2026-09-30T11:59:30', params(60), params(15))).toBe(60000)
  })

  it('has no delay once charged', () => {
    expect(calculateMineDelay('abc', '2026-09-30T11:00:00', params(60), params(15))).toBe(0)
  })
})
