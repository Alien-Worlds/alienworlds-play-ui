import { useSessionStore } from 'shared/store/sessionStore'

import {
  claimLandownerAllowance,
  claimLandownerCommissions,
  claimMiningRewards,
  claimUnstake,
} from './claims'

jest.mock('shared/util/config', () => ({ config: { DemoUserWaxAccount: 'demo.wam' } }))

const mockTransact = jest.fn()
jest.mock('./transact', () => ({
  transact: (actions: unknown) => mockTransact(actions),
}))

const mockToastMessage = jest.fn()
const mockToastErrorMessage = jest.fn()
jest.mock('shared/util/toast', () => ({
  toastMessage: (message: string) => mockToastMessage(message),
  toastErrorMessage: (message: string) => mockToastErrorMessage(message),
}))

const auth = [{ actor: 'player.wam', permission: 'active' }]

describe('claims', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.spyOn(console, 'error').mockImplementation(() => {})
    mockTransact.mockResolvedValue({})
    useSessionStore.setState({ walletId: 'player.wam' })
  })

  afterEach(() => {
    jest.restoreAllMocks()
    useSessionStore.setState({ walletId: null })
  })

  it('claims mining rewards from m.federation', async () => {
    await expect(claimMiningRewards()).resolves.toBe(true)
    expect(mockTransact).toHaveBeenCalledWith([
      {
        account: 'm.federation',
        name: 'claimmines',
        authorization: auth,
        data: { receiver: 'player.wam' },
      },
    ])
  })

  it('claims landowner commissions from m.federation', async () => {
    await expect(claimLandownerCommissions()).resolves.toBe(true)
    expect(mockTransact).toHaveBeenCalledWith([
      {
        account: 'm.federation',
        name: 'claimcomms',
        authorization: auth,
        data: { receiver: 'player.wam' },
      },
    ])
  })

  it('claims the landowner allowance from awlndratings', async () => {
    await expect(claimLandownerAllowance()).resolves.toBe(true)
    expect(mockTransact).toHaveBeenCalledWith([
      {
        account: 'awlndratings',
        name: 'claimpay',
        authorization: auth,
        data: { receiver: 'player.wam' },
      },
    ])
  })

  it('claims unstaked DAO tokens from token.worlds and toasts success', async () => {
    await expect(claimUnstake('4,NERI')).resolves.toBe(true)
    expect(mockTransact).toHaveBeenCalledWith([
      {
        account: 'token.worlds',
        name: 'claimunstkes',
        authorization: auth,
        data: { account: 'player.wam', token_symbol: '4,NERI' },
      },
    ])
    expect(mockToastMessage).toHaveBeenCalledWith('TLM claimed successfully.')
  })

  it('does not toast success for the reward claims', async () => {
    await claimMiningRewards()
    await claimLandownerCommissions()
    await claimLandownerAllowance()
    expect(mockToastMessage).not.toHaveBeenCalled()
  })

  it('toasts the chain error and resolves false when the transaction fails', async () => {
    mockTransact.mockRejectedValueOnce(new Error('assertion failure: nothing to claim'))

    await expect(claimMiningRewards()).resolves.toBe(false)
    expect(mockToastErrorMessage).toHaveBeenCalledWith('Error: assertion failure: nothing to claim')
  })

  it('does nothing and resolves false without a wallet', async () => {
    useSessionStore.setState({ walletId: null })

    await expect(claimUnstake('4,NERI')).resolves.toBe(false)
    expect(mockTransact).not.toHaveBeenCalled()
  })
})
