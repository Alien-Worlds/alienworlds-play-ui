import { useSessionStore } from 'shared/store/sessionStore'

import { useCompetitionsStore } from './competitionsStore'

jest.mock('shared/util/config', () => ({ config: { DemoUserWaxAccount: 'demo.wam' } }))

const mockTransact = jest.fn()
jest.mock('shared/wax/transact', () => ({
  transact: (actions: unknown) => mockTransact(actions),
}))

const mockToastMessage = jest.fn()
const mockToastErrorMessage = jest.fn()
jest.mock('shared/util/toast', () => ({
  toastMessage: (message: string) => mockToastMessage(message),
  toastErrorMessage: (message: string) => mockToastErrorMessage(message),
}))

const initialState = useCompetitionsStore.getState()
const claim = (compId: number) => useCompetitionsStore.getState().claimTournamentReward(compId)

describe('useCompetitionsStore', () => {
  let errorSpy: jest.SpyInstance

  beforeEach(() => {
    jest.clearAllMocks()
    errorSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined)
    useCompetitionsStore.setState(initialState, true)
    useSessionStore.getState().setWalletId('alice.wam')
  })

  afterEach(() => {
    errorSpy.mockRestore()
  })

  it('sends the comp.worlds claim action signed by the current wallet', async () => {
    mockTransact.mockResolvedValue({})

    expect(await claim(7)).toBe(true)
    expect(mockTransact).toHaveBeenCalledWith([
      {
        account: 'comp.worlds',
        name: 'claim',
        authorization: [{ actor: 'alice.wam', permission: 'active' }],
        data: { id: 7, player: 'alice.wam' },
      },
    ])
    expect(mockToastMessage).toHaveBeenCalledWith('Tournament rewards claimed successfully.')
    expect(mockToastErrorMessage).not.toHaveBeenCalled()
  })

  it('does nothing without a wallet', async () => {
    useSessionStore.getState().setWalletId(null)

    expect(await claim(7)).toBe(false)
    expect(mockTransact).not.toHaveBeenCalled()
  })

  it('toasts the transaction error and resolves false', async () => {
    mockTransact.mockRejectedValue(new Error('assertion failure'))

    expect(await claim(7)).toBe(false)
    expect(mockToastErrorMessage).toHaveBeenCalledWith('assertion failure')
    expect(mockToastMessage).not.toHaveBeenCalled()
  })

  it('falls back to a generic message when the error has none', async () => {
    mockTransact.mockRejectedValue(undefined)

    expect(await claim(7)).toBe(false)
    expect(mockToastErrorMessage).toHaveBeenCalledWith('Claim tournament rewards has failed.')
  })

  it('tracks isClaimingReward while the claim is in flight', async () => {
    let resolveTransact: () => void
    mockTransact.mockReturnValue(new Promise<void>((resolve) => (resolveTransact = resolve)))

    const pending = claim(7)
    expect(useCompetitionsStore.getState().isClaimingReward).toBe(true)

    resolveTransact()
    await pending
    expect(useCompetitionsStore.getState().isClaimingReward).toBe(false)
  })
})
