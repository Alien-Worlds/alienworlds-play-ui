import { getDefaultLandAssetsFilter } from 'store/atomic/helpers'
import { LandAssetsFilter } from 'store/atomic/types'

import { filterAndSortLands } from './landFilter'

const PLANET = 'Eyeke'

const makeLand = (id: string, overrides: Record<string, any> = {}): any => ({
  asset_id: id,
  owner: overrides.owner ?? 'owner.wam',
  data: {
    name: `${overrides.terrain ?? 'Plains'} on ${PLANET}`,
    rarity: overrides.rarity ?? 'Common',
    delay: overrides.delay ?? 20,
    ease: overrides.ease ?? 10,
    difficulty: overrides.difficulty ?? 1,
    luck: overrides.luck ?? 10,
  },
  mutable_data: { commission: overrides.commission ?? 1000 },
  immutable_data: { x: overrides.x ?? 1, y: overrides.y ?? 1 },
})

const filterIds = (lands: any[], filter: Partial<LandAssetsFilter> = {}) =>
  filterAndSortLands(lands, { ...getDefaultLandAssetsFilter(), sortBy: null, ...filter }).map(
    (x) => x.asset_id
  )

describe('filterAndSortLands', () => {
  it('keeps every land inside the default ranges', () => {
    expect(filterIds([makeLand('1'), makeLand('2', { owner: 'bob.wam' })])).toEqual(['1', '2'])
  })

  // The default ranges are applied like any other. They used to be skipped by identity, which
  // never matched under Overmind, so lands outside them have always been hidden.
  it('filters by the default ranges too', () => {
    expect(
      filterIds([
        makeLand('1'),
        makeLand('2', { commission: 9000 }),
        makeLand('3', { delay: 900 }),
        makeLand('4', { ease: 900 }),
        makeLand('5', { difficulty: 90 }),
        makeLand('6', { luck: 900 }),
      ])
    ).toEqual(['1'])
  })

  it('does not change the input list', () => {
    const lands = [makeLand('2', { owner: 'b.wam' }), makeLand('1', { owner: 'a.wam' })]

    filterAndSortLands(lands, { ...getDefaultLandAssetsFilter(), sortBy: 'Owner' })

    expect(lands.map((x) => x.asset_id)).toEqual(['2', '1'])
  })

  describe('filtering', () => {
    it.each<[string, Partial<LandAssetsFilter>, Record<string, any>]>([
      ['owner (substring)', { owner: 'bob' }, { owner: 'bobby.wam' }],
      ['terrain', { terrain: 'Mountains' }, { terrain: 'Mountains' }],
      ['rarity', { rarity: 'Epic' }, { rarity: 'Epic' }],
      ['commission (percent)', { commission: [5, 15] }, { commission: 1000 }],
      ['recharge (delay / 10)', { recharge: [1, 3] }, { delay: 20 }],
      ['mining power (ease / 10)', { miningPower: [1, 2] }, { ease: 15 }],
      ['pow (difficulty)', { pow: [1, 1] }, { difficulty: 1 }],
      ['nft power (luck / 10)', { luck: [1, 2] }, { luck: 15 }],
      ['x coordinate', { x: 3 }, { x: 3 }],
      ['y coordinate', { y: 4 }, { y: 4 }],
    ])('filters by %s', (_, filter, match) => {
      const miss = {
        owner: 'alice.wam',
        terrain: 'Plains',
        rarity: 'Common',
        commission: 2500,
        delay: 50,
        ease: 5,
        difficulty: 2,
        luck: 5,
        x: 9,
        y: 9,
      }
      const matchKey = Object.keys(match)[0]

      expect(
        filterIds(
          [makeLand('match', match), makeLand('miss', { [matchKey]: miss[matchKey] })],
          filter
        )
      ).toEqual(['match'])
    })

    it('matches a single value exactly', () => {
      expect(
        filterIds([makeLand('1', { commission: 1000 }), makeLand('2', { commission: 1200 })], {
          commission: 10,
        })
      ).toEqual(['1'])
    })

    it('treats range bounds as inclusive', () => {
      expect(
        filterIds([makeLand('low', { commission: 500 }), makeLand('high', { commission: 1500 })], {
          commission: [5, 15],
        })
      ).toEqual(['low', 'high'])
    })
  })

  describe('sorting', () => {
    it.each<[string, Record<string, any>[], string[]]>([
      [
        'Commission',
        [{ commission: 300 }, { commission: 100 }, { commission: 200 }],
        ['2', '3', '1'],
      ],
      ['Mining Power', [{ ease: 20 }, { ease: 10 }, { ease: 15 }], ['2', '3', '1']],
      ['NFT Power', [{ luck: 20 }, { luck: 10 }, { luck: 15 }], ['2', '3', '1']],
      ['POW', [{ difficulty: 2 }, { difficulty: 0 }, { difficulty: 1 }], ['2', '3', '1']],
      ['Owner', [{ owner: 'c.wam' }, { owner: 'a.wam' }, { owner: 'b.wam' }], ['2', '3', '1']],
      ['Recharge Multiplier', [{ delay: 30 }, { delay: 10 }, { delay: 20 }], ['2', '3', '1']],
      [
        'Terrain',
        [{ terrain: 'Plains' }, { terrain: 'Desert' }, { terrain: 'Mountains' }],
        ['2', '3', '1'],
      ],
    ])('sorts by %s', (sortBy, lands, expected) => {
      expect(
        filterIds(
          lands.map((overrides, i) => makeLand(`${i + 1}`, overrides)),
          { sortBy }
        )
      ).toEqual(expected)
    })

    it('sorts by rarity rank, not alphabetically', () => {
      expect(
        filterIds(
          [
            makeLand('legendary', { rarity: 'Legendary' }),
            makeLand('common', { rarity: 'Common' }),
            makeLand('epic', { rarity: 'Epic' }),
            makeLand('rare', { rarity: 'Rare' }),
          ],
          { sortBy: 'Rarity' }
        )
      ).toEqual(['common', 'rare', 'epic', 'legendary'])
    })

    it('reverses the order when reversed', () => {
      expect(
        filterIds([makeLand('1', { commission: 100 }), makeLand('2', { commission: 200 })], {
          sortBy: 'Commission',
          reversed: true,
        })
      ).toEqual(['2', '1'])
    })

    it('keeps the order without a sort', () => {
      expect(filterIds([makeLand('b', { owner: 'z.wam' }), makeLand('a')])).toEqual(['b', 'a'])
    })
  })
})
