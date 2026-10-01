import {
  buildApplyMainBoostActions,
  buildBoostSlotActions,
  buildSetCommissionActions,
  buildSetMinBoostActions,
  buildShineActions,
  buildUnlockSlotActions,
} from './miningActions'

const auth = [{ actor: 'owner.wam', permission: 'active' }]

describe('buildShineActions', () => {
  it('pays the shine cost and sends the NFTs to s.federation', () => {
    const shineData: any = { info: { cost: '40.0000 TLM' } }

    expect(buildShineActions('owner.wam', ['1', '2', '3', '4'], shineData)).toEqual([
      {
        account: 'alien.worlds',
        name: 'transfer',
        authorization: auth,
        data: { from: 'owner.wam', to: 's.federation', quantity: '40.0000 TLM', memo: 'Shining' },
      },
      {
        account: 'atomicassets',
        name: 'transfer',
        authorization: auth,
        data: {
          from: 'owner.wam',
          to: 's.federation',
          asset_ids: ['1', '2', '3', '4'],
          memo: 'Shining',
        },
      },
    ])
  })
})

describe('buildSetCommissionActions', () => {
  it('sets the profit share on awlndratings', () => {
    expect(buildSetCommissionActions('owner.wam', '42', '1250')).toEqual([
      {
        account: 'awlndratings',
        name: 'setprofitshr',
        authorization: auth,
        data: { owner: 'owner.wam', land_id: '42', profit_share: '1250' },
      },
    ])
  })
})

describe('buildApplyMainBoostActions', () => {
  it.each([
    ['MEGA Boost', 'megaboost'],
    ['SUPER Boost', 'superboost'],
  ])('burns the %s NFT and applies it', (name, action) => {
    const boost: any = { asset_id: '7', name }

    expect(buildApplyMainBoostActions('owner.wam', '42', boost)).toEqual([
      {
        account: 'atomicassets',
        name: 'transfer',
        authorization: auth,
        data: {
          from: 'owner.wam',
          to: 'awlndratings',
          asset_ids: ['7'],
          memo: `<${name}> for land id 42`,
        },
      },
      { account: 'awlndratings', name: action, authorization: auth, data: { land_id: '42' } },
    ])
  })
})

describe('buildSetMinBoostActions', () => {
  it('sets the minimum boost on awlndratings', () => {
    expect(buildSetMinBoostActions('owner.wam', '42', '16.0000 TLM')).toEqual([
      {
        account: 'awlndratings',
        name: 'setminboost',
        authorization: auth,
        data: { owner: 'owner.wam', land_id: '42', minboost: '16.0000 TLM' },
      },
    ])
  })
})

describe('buildBoostSlotActions', () => {
  it('pays boost.worlds and boosts the land', () => {
    expect(buildBoostSlotActions('owner.wam', '42', '4.0000 TLM')).toEqual([
      {
        account: 'alien.worlds',
        name: 'transfer',
        authorization: auth,
        data: {
          from: 'owner.wam',
          to: 'boost.worlds',
          quantity: '4.0000 TLM',
          memo: 'landrating - boostslot for 42',
        },
      },
      {
        account: 'awlndratings',
        name: 'boost',
        authorization: auth,
        data: { payer: 'owner.wam', land_id: '42', amount: '4.0000 TLM' },
      },
    ])
  })
})

describe('buildUnlockSlotActions', () => {
  it('pays boost.worlds and opens the next slot', () => {
    expect(buildUnlockSlotActions('owner.wam', '42', '420.0000 TLM')).toEqual([
      {
        account: 'alien.worlds',
        name: 'transfer',
        authorization: auth,
        data: {
          from: 'owner.wam',
          to: 'boost.worlds',
          quantity: '420.0000 TLM',
          memo: 'landrating - openslot for 42',
        },
      },
      {
        account: 'awlndratings',
        name: 'openslot',
        authorization: auth,
        data: { owner: 'owner.wam', land_id: '42' },
      },
    ])
  })
})
