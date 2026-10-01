import { buildSetAvatarActions, buildSetBagActions, buildSetLandActions } from './assetActions'

const auth = [{ actor: 'miner.wam', permission: 'active' }]

describe('buildSetBagActions', () => {
  it('sets the bag on m.federation', () => {
    expect(buildSetBagActions('miner.wam', ['1', '2'])).toEqual([
      {
        account: 'm.federation',
        name: 'setbag',
        authorization: auth,
        data: { account: 'miner.wam', items: ['1', '2'] },
      },
    ])
  })
})

describe('buildSetLandActions', () => {
  it('sets the mining land on m.federation', () => {
    expect(buildSetLandActions('miner.wam', '42')).toEqual([
      {
        account: 'm.federation',
        name: 'setland',
        authorization: auth,
        data: { account: 'miner.wam', land_id: '42' },
      },
    ])
  })
})

describe('buildSetAvatarActions', () => {
  const setAvatar = (avatarId: string) => ({
    account: 'federation',
    name: 'setavatar',
    authorization: auth,
    data: { account: 'miner.wam', avatar_id: avatarId },
  })

  it('sets an avatar on federation', () => {
    expect(buildSetAvatarActions('miner.wam', '1099')).toEqual([setAvatar('1099')])
  })

  it.each(['1', '2'])('buys RAM for mint.worlds first for starter avatar %s', (avatarId) => {
    expect(buildSetAvatarActions('miner.wam', avatarId)).toEqual([
      {
        account: 'eosio',
        name: 'buyrambytes',
        authorization: auth,
        data: { payer: 'miner.wam', receiver: 'mint.worlds', bytes: 152 },
      },
      setAvatar(avatarId),
    ])
  })
})
