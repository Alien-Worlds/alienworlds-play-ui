import { getDefaultLandAssetsFilter } from 'store/atomic/helpers'
import { createAtomicMock } from 'store/atomic/testUtils/createAtomicMock'
import { LandAssetsFilter } from 'store/atomic/types'

jest.mock('routes', () => ({ router: { state: { location: { pathname: '/mining/planet' } } } }))

const PLANET = 'Eyeke'

const makeLand = (id: string, overrides: Record<string, any> = {}) => ({
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

const setup = (lands: any[] | undefined, filter: Partial<LandAssetsFilter> = {}) =>
  createAtomicMock(
    (state) => {
      state.atomic.landAssetsFilter = { ...getDefaultLandAssetsFilter(), sortBy: null, ...filter }
    },
    { whereToMine: PLANET, planetLandsAssets: lands ? { [PLANET]: lands } : {} }
  )

const ids = (state: any) => state.atomic.landAssetsFilter.filteredLands.map((x: any) => x.asset_id)

describe('atomic.filterLandAssets', () => {
  it('returns no lands when the planet has none loaded', () => {
    const { state, actions } = setup(undefined)

    actions.filterLandAssets()

    expect(state.atomic.landAssetsFilter.filteredLands).toEqual([])
  })

  // Current behaviour, pinned because the store migration would change it: the default ranges
  // are meant to be skipped by identity (`filter.commission !== DEFAULT_COMMISSION_RANGE`), but
  // Overmind hands out state as proxies, so the check never matches and the defaults filter too.
  // A plain Zustand object would pass the identity check and start showing these lands.
  it('filters by the default ranges too', () => {
    const { state, actions } = setup([
      makeLand('1'),
      makeLand('2', { commission: 9000 }),
      makeLand('3', { delay: 900 }),
      makeLand('4', { ease: 900 }),
      makeLand('5', { difficulty: 90 }),
      makeLand('6', { luck: 900 }),
    ])

    actions.filterLandAssets()

    expect(ids(state)).toEqual(['1'])
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
      const { state, actions } = setup(
        [makeLand('match', match), makeLand('miss', { [matchKey]: miss[matchKey] })],
        filter
      )

      actions.filterLandAssets()

      expect(ids(state)).toEqual(['match'])
    })

    it('treats range bounds as inclusive', () => {
      const { state, actions } = setup(
        [makeLand('low', { commission: 500 }), makeLand('high', { commission: 1500 })],
        { commission: [5, 15] }
      )

      actions.filterLandAssets()

      expect(ids(state)).toEqual(['low', 'high'])
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
      [
        'Terrain',
        [{ terrain: 'Plains' }, { terrain: 'Desert' }, { terrain: 'Mountains' }],
        ['2', '3', '1'],
      ],
    ])('sorts by %s', (sortBy, lands, expected) => {
      const { state, actions } = setup(
        lands.map((overrides, i) => makeLand(`${i + 1}`, overrides)),
        { sortBy }
      )

      actions.filterLandAssets()

      expect(ids(state)).toEqual(expected)
    })

    it('reverses the order when reversed', () => {
      const { state, actions } = setup(
        [makeLand('1', { commission: 100 }), makeLand('2', { commission: 200 })],
        { sortBy: 'Commission', reversed: true }
      )

      actions.filterLandAssets()

      expect(ids(state)).toEqual(['2', '1'])
    })

    // Current behaviour, pinned so the store migration keeps it. Both look unintended:
    // 'Rarity' looks the rarity string up in a list of option objects (always -1), and
    // 'Recharge Multiplier' compares `a.data.delay` with itself.
    it.each(['Rarity', 'Recharge Multiplier'])('leaves the order unchanged for %s', (sortBy) => {
      const { state, actions } = setup(
        [
          makeLand('1', { rarity: 'Epic', delay: 30 }),
          makeLand('2', { rarity: 'Common', delay: 10 }),
          makeLand('3', { rarity: 'Rare', delay: 20 }),
        ],
        { sortBy }
      )

      actions.filterLandAssets()

      expect(ids(state)).toEqual(['1', '2', '3'])
    })
  })
})

describe('atomic.setLandAssetsFilter / resetLandAssetsFilter', () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('stores the filter, shows loading while debounced, then applies it', async () => {
    const { state, actions } = setup([makeLand('1', { owner: 'bob.wam' }), makeLand('2')])

    const promise = actions.setLandAssetsFilter({
      ...getDefaultLandAssetsFilter(),
      owner: 'bob',
    })

    expect(state.atomic.landAssetsFilter.owner).toBe('bob')
    expect(state.atomic.landAssetsFilter.isLoading).toBe(true)

    jest.advanceTimersByTime(200)
    await promise

    expect(state.atomic.landAssetsFilter.isLoading).toBe(false)
    expect(ids(state)).toEqual(['1'])
  })

  it('resets to the default filter and re-applies it', async () => {
    const { state, actions } = setup([makeLand('1', { owner: 'bob.wam' }), makeLand('2')], {
      owner: 'bob',
      sortBy: 'Owner',
    })

    const promise = actions.resetLandAssetsFilter()
    jest.advanceTimersByTime(200)
    await promise

    expect(state.atomic.landAssetsFilter).toEqual(
      expect.objectContaining({ owner: null, sortBy: 'Random', isLoading: false })
    )
    expect(ids(state).sort()).toEqual(['1', '2'])
  })
})
