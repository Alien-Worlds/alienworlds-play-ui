import { getDailyReward, parseStakeAmount, parseTokenAmount } from './staking'

describe('parseStakeAmount', () => {
  it('returns 0 for null or undefined', () => {
    expect(parseStakeAmount(null)).toBe(0)
    expect(parseStakeAmount(undefined)).toBe(0)
  })

  it('returns 0 when the string has no numeric match', () => {
    expect(parseStakeAmount('no numbers here')).toBe(0)
  })

  it('parses a plain number', () => {
    expect(parseStakeAmount(1234)).toBe(1234)
  })

  it('parses a decimal number', () => {
    expect(parseStakeAmount(12.3456)).toBe(12.3456)
  })

  it('extracts the leading numeric value from a token-amount string', () => {
    expect(parseStakeAmount('123.4500 TLM')).toBe(123.45)
  })
})

describe('parseTokenAmount', () => {
  it('returns 0 for null or undefined', () => {
    expect(parseTokenAmount(null)).toBe(0)
    expect(parseTokenAmount(undefined)).toBe(0)
  })

  it('parses a plain number', () => {
    expect(parseTokenAmount(500)).toBe(500)
  })

  it('parses the numeric prefix of a token-amount string', () => {
    expect(parseTokenAmount('987.6543 TLM')).toBe(987.6543)
  })

  it('returns NaN for a non-numeric string (no numeric prefix to parse)', () => {
    expect(parseTokenAmount('TLM')).toBeNaN()
  })
})

describe('getDailyReward', () => {
  it('returns "0.00" when stakedAmount is falsy', () => {
    expect(getDailyReward(0, 5)).toBe('0.00')
  })

  it('returns "0.00" when powerPerDay is falsy', () => {
    expect(getDailyReward(100, 0)).toBe('0.00')
  })

  it('multiplies staked amount by power per day, fixed to two decimals', () => {
    expect(getDailyReward(100, 0.5)).toBe('50.00')
  })

  it('rounds to two decimal places', () => {
    expect(getDailyReward(3, 1.111)).toBe('3.33')
  })
})
