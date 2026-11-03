import { useSessionStore } from 'shared/store/sessionStore'

import { redeemAWNftOffer, redeemCommunityNftOffer, redeemLevelOffer } from './redeemOffers'

jest.mock('shared/util/config', () => ({ config: { DemoUserWaxAccount: 'demo.wam' } }))

const mockTransact = jest.fn()
jest.mock('shared/wax/transact', () => ({
  transact: (actions: unknown) => mockTransact(actions),
}))

const auth = [{ actor: 'player.wam', permission: 'active' }]
const buyMintRam = {
  account: 'eosio',
  name: 'buyrambytes',
  authorization: auth,
  data: { payer: 'player.wam', receiver: 'mint.worlds', bytes: 152 },
}

describe('redeemOffers', () => {
  beforeEach(() => {
    mockTransact.mockReset().mockResolvedValue({ transaction_id: 'tx' })
    useSessionStore.setState({ walletId: 'player.wam' })
  })

  afterEach(() => {
    useSessionStore.setState({ walletId: null })
  })

  it('redeems an AW NFT offer, buying mint RAM first', async () => {
    await expect(redeemAWNftOffer(5)).resolves.toEqual({ transaction_id: 'tx' })
    expect(mockTransact).toHaveBeenCalledWith([
      buyMintRam,
      {
        account: 'uspts.worlds',
        name: 'redeempntnft',
        authorization: auth,
        data: { user: 'player.wam', offer_id: 5 },
      },
    ])
  })

  it('redeems a community offer without buying RAM', async () => {
    await redeemCommunityNftOffer(8)
    expect(mockTransact).toHaveBeenCalledWith([
      {
        account: 'uspts.worlds',
        name: 'redeemprenft',
        authorization: auth,
        data: { user: 'player.wam', offer_id: 8 },
      },
    ])
  })

  it('redeems a level reward, buying mint RAM first', async () => {
    await redeemLevelOffer(3)
    expect(mockTransact).toHaveBeenCalledWith([
      buyMintRam,
      {
        account: 'uspts.worlds',
        name: 'redeemlvlnft',
        authorization: auth,
        data: { user: 'player.wam', id: 3 },
      },
    ])
  })

  it('throws the transaction error, so the mutation fails', async () => {
    mockTransact.mockRejectedValue(new Error('Not enough points available'))
    await expect(redeemAWNftOffer(5)).rejects.toThrow('Not enough points available')
  })

  it('throws without a wallet, without signing', async () => {
    useSessionStore.setState({ walletId: null })

    await expect(redeemCommunityNftOffer(8)).rejects.toThrow('No wallet id')
    expect(mockTransact).not.toHaveBeenCalled()
  })
})
