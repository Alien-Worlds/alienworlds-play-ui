import { BigNumber } from 'ethers'
import { buildUserWallet } from 'features/missions/testUtils/fixtures'

import { getBscAddress, getInitialBscWalletState, useBscWalletStore } from './bscWalletStore'

const realStore = useBscWalletStore.getState()
const state = () => useBscWalletStore.getState()

beforeEach(() => {
  useBscWalletStore.setState({ ...realStore, ...getInitialBscWalletState() }, true)
})

describe('useBscWalletStore', () => {
  it('starts with no wallet, auto-connect on and nothing synced', () => {
    expect(state()).toMatchObject({
      userWallet: null,
      isAutoConnect: true,
      isSync: false,
      bscTlmBalanceFormatted: null,
      bscStakedTlmBalanceFormatted: null,
    })
  })

  it('formats the BSC balances (4 decimals), or null without them', () => {
    state().setBscTlmBalance(BigNumber.from(123456789))
    state().setBscStakedTlmBalance(25000)
    expect(state().bscTlmBalanceFormatted).toBe('12,345.6789')
    expect(state().bscStakedTlmBalanceFormatted).toBe('2.5')

    state().setBscTlmBalance(null)
    state().setBscStakedTlmBalance(null)
    expect(state().bscTlmBalanceFormatted).toBeNull()
    expect(state().bscStakedTlmBalanceFormatted).toBeNull()
  })

  it('stores the wallet, auto-connect and sync flags, and NFT progress', () => {
    const wallet = buildUserWallet() as any

    state().setWallet(wallet)
    state().setIsAutoConnect(false)
    state().setIsSync(true)
    state().setTotalMissionsNfts(8)
    state().setLoadedMissionsNfts(2)

    expect(state()).toMatchObject({
      userWallet: wallet,
      isAutoConnect: false,
      isSync: true,
      loadingProgressMissionsNfts: 25,
    })
  })
})

describe('getBscAddress', () => {
  it("is the wallet's first address", () => {
    expect(getBscAddress(buildUserWallet('0xfirst') as any)).toBe('0xfirst')
    expect(getBscAddress(null)).toBeUndefined()
    expect(getBscAddress({ accounts: [] } as any)).toBeUndefined()
  })
})
