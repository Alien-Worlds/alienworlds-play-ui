import { useSessionStore } from 'shared/store/sessionStore'

import { transact } from './transact'

jest.mock('shared/util/config', () => ({ config: { DemoUserWaxAccount: 'demo.wam' } }))

const action = { account: 'comp.worlds', name: 'claim', authorization: [], data: {} }

describe('transact', () => {
  afterEach(() => {
    useSessionStore.getState().setCurrentSession(null)
  })

  it('signs the actions with the current session', async () => {
    const session = { transact: jest.fn().mockResolvedValue('result') }
    useSessionStore.getState().setCurrentSession(session as any)

    await expect(transact([action])).resolves.toBe('result')
    expect(session.transact).toHaveBeenCalledWith(
      { actions: [action] },
      { blocksBehind: 3, expireSeconds: 1200 }
    )
  })

  it('unwraps a stored LoginResult', async () => {
    const session = { transact: jest.fn().mockResolvedValue('result') }
    useSessionStore.getState().setCurrentSession({ session } as any)

    await transact([action])
    expect(session.transact).toHaveBeenCalled()
  })

  it('throws when there is no session', async () => {
    await expect(transact([action])).rejects.toThrow('No active wallet session')
  })

  it('propagates transaction failures', async () => {
    const session = { transact: jest.fn().mockRejectedValue(new Error('assertion failure')) }
    useSessionStore.getState().setCurrentSession(session as any)

    await expect(transact([action])).rejects.toThrow('assertion failure')
  })
})
