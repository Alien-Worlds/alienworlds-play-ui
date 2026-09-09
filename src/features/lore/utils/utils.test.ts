import { LoreSortBy, LoreStatus } from 'features/lore/types/loreTypes'
import { LoreProposal } from 'graphql/types'

import { filterAssets, removeLastDecimalDigit, sortLores } from './utils'

const makeLore = (overrides: Record<string, any> = {}): LoreProposal =>
  ({
    proposal_id: 1,
    title: 'Alpha',
    proposer: 'alice',
    submitted: '2024-01-01T00:00:00.000Z',
    expires: '2024-02-01T00:00:00.000Z',
    earliest_exec: '2024-01-15T00:00:00.000Z',
    total_yes_votes: 10,
    total_no_votes: 2,
    status: LoreStatus.OPEN,
    ...overrides,
  } as unknown as LoreProposal)

describe('sortLores', () => {
  it('sorts by ID descending (numeric)', () => {
    const lores = [
      makeLore({ proposal_id: 1 }),
      makeLore({ proposal_id: 3 }),
      makeLore({ proposal_id: 2 }),
    ]
    const result = sortLores({ lores, sortBy: LoreSortBy.ID, reversed: false })
    expect(result.map((l) => l.proposal_id)).toEqual([3, 2, 1])
  })

  it('sorts by title alphabetically', () => {
    const lores = [
      makeLore({ title: 'Zeta' }),
      makeLore({ title: 'Alpha' }),
      makeLore({ title: 'Mid' }),
    ]
    const result = sortLores({ lores, sortBy: LoreSortBy.TITLE, reversed: false })
    expect(result.map((l) => l.title)).toEqual(['Alpha', 'Mid', 'Zeta'])
  })

  it('sorts by created by (proposer)', () => {
    const lores = [makeLore({ proposer: 'bob' }), makeLore({ proposer: 'alice' })]
    const result = sortLores({ lores, sortBy: LoreSortBy.CREATEDBY, reversed: false })
    expect(result.map((l) => l.proposer)).toEqual(['alice', 'bob'])
  })

  it('treats a missing submitted date as the epoch fallback', () => {
    const lores = [
      makeLore({ proposal_id: 1, submitted: '2024-05-01T00:00:00.000Z' }),
      makeLore({ proposal_id: 2, submitted: undefined }),
    ]
    const result = sortLores({ lores, sortBy: LoreSortBy.SUBMITTED, reversed: false })
    expect(result.map((l) => l.proposal_id)).toEqual([2, 1])
  })

  it('sorts by combined vote count (string comparison, single-digit totals)', () => {
    const lores = [
      makeLore({ proposal_id: 1, total_yes_votes: 1, total_no_votes: 1 }),
      makeLore({ proposal_id: 2, total_yes_votes: 2, total_no_votes: 3 }),
    ]
    const result = sortLores({ lores, sortBy: LoreSortBy.VOTES, reversed: false })
    expect(result.map((l) => l.proposal_id)).toEqual([1, 2])
  })

  it('sorts by status alphabetically', () => {
    const lores = [makeLore({ status: LoreStatus.OPEN }), makeLore({ status: LoreStatus.EXPIRED })]
    const result = sortLores({ lores, sortBy: LoreSortBy.STATUS, reversed: false })
    expect(result.map((l) => l.status)).toEqual([LoreStatus.EXPIRED, LoreStatus.OPEN])
  })

  it('reverses the sorted result when reversed is true', () => {
    const lores = [makeLore({ title: 'Alpha' }), makeLore({ title: 'Zeta' })]
    const result = sortLores({ lores, sortBy: LoreSortBy.TITLE, reversed: true })
    expect(result.map((l) => l.title)).toEqual(['Zeta', 'Alpha'])
  })

  it('does not mutate the input array', () => {
    const lores = [makeLore({ title: 'Zeta' }), makeLore({ title: 'Alpha' })]
    sortLores({ lores, sortBy: LoreSortBy.TITLE, reversed: false })
    expect(lores.map((l) => l.title)).toEqual(['Zeta', 'Alpha'])
  })

  it('leaves order unchanged for an unrecognized sortBy', () => {
    const lores = [makeLore({ proposal_id: 1 }), makeLore({ proposal_id: 2 })]
    const result = sortLores({ lores, sortBy: 999 as LoreSortBy, reversed: false })
    expect(result.map((l) => l.proposal_id)).toEqual([1, 2])
  })
})

describe('removeLastDecimalDigit', () => {
  it('removes the last digit after the decimal point', () => {
    expect(removeLastDecimalDigit(1.234)).toBe('1.23')
  })

  it('drops the decimal point entirely when only one decimal digit remains', () => {
    expect(removeLastDecimalDigit(1.2)).toBe('1')
  })

  it('returns whole numbers unchanged', () => {
    expect(removeLastDecimalDigit(42)).toBe('42')
  })
})

const makeAsset = (overrides: any = {}) => ({
  owner: 'alice',
  data: { name: 'Rocky on Neri', rarity: 'Common', delay: 10, ease: 10, difficulty: 1, luck: 10 },
  mutable_data: { commission: 500 },
  immutable_data: {},
  ...overrides,
})

describe('filterAssets', () => {
  const baseFilter = {
    owner: '',
    terrain: 'ALL',
    rarity: 'ALL',
    commission: [0, 25],
    recharge: [0.7, 5],
    miningPower: [0.6, 2.5],
    pow: [0, 2],
    luck: [0.5, 2.5],
  } as any

  it('returns all assets when the filter has no constraints', () => {
    const assets = [makeAsset(), makeAsset({ owner: 'bob' })]
    expect(filterAssets(assets, baseFilter)).toHaveLength(2)
  })

  it('filters by owner substring', () => {
    const assets = [makeAsset({ owner: 'alice' }), makeAsset({ owner: 'bob' })]
    const result = filterAssets(assets, { ...baseFilter, owner: 'ali' })
    expect(result).toHaveLength(1)
    expect(result[0].owner).toBe('alice')
  })

  it('filters by terrain', () => {
    const assets = [
      makeAsset({ data: { ...makeAsset().data, name: 'Rocky on Neri' } }),
      makeAsset({ data: { ...makeAsset().data, name: 'Barren on Magor' } }),
    ]
    const result = filterAssets(assets, { ...baseFilter, terrain: 'Rocky' })
    expect(result).toHaveLength(1)
    expect(result[0].data.name).toBe('Rocky on Neri')
  })

  it('filters by rarity', () => {
    const assets = [
      makeAsset({ data: { ...makeAsset().data, rarity: 'Common' } }),
      makeAsset({ data: { ...makeAsset().data, rarity: 'Rare' } }),
    ]
    const result = filterAssets(assets, { ...baseFilter, rarity: 'Rare' })
    expect(result).toHaveLength(1)
    expect(result[0].data.rarity).toBe('Rare')
  })

  it('sorts by rarity using the canonical rarity order', () => {
    const assets = [
      makeAsset({ owner: 'legendary-owner', data: { ...makeAsset().data, rarity: 'Legendary' } }),
      makeAsset({ owner: 'common-owner', data: { ...makeAsset().data, rarity: 'Common' } }),
    ]
    const result = filterAssets(assets, { ...baseFilter, sortBy: 'Rarity' })
    expect(result.map((a) => a.data.rarity)).toEqual(['Common', 'Legendary'])
  })

  it('reverses the sorted result when reversed is true', () => {
    const assets = [
      makeAsset({ data: { ...makeAsset().data, rarity: 'Common' } }),
      makeAsset({ data: { ...makeAsset().data, rarity: 'Legendary' } }),
    ]
    const result = filterAssets(assets, { ...baseFilter, sortBy: 'Rarity', reversed: true })
    expect(result.map((a) => a.data.rarity)).toEqual(['Legendary', 'Common'])
  })
})
