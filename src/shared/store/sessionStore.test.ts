import { act, renderHook } from '@testing-library/react'

jest.mock('shared/util/config', () => ({
  config: {
    DemoUserWaxAccount: 'demo.wam',
  },
}))

// eslint-disable-next-line import/first
import { useSessionStore } from './sessionStore'

const initialState = useSessionStore.getState()

describe('useSessionStore', () => {
  afterEach(() => {
    act(() => {
      useSessionStore.setState(initialState, true)
    })
  })

  it('starts with no wallet and isDemoUser false', () => {
    const { result } = renderHook(() => useSessionStore())

    expect(result.current.walletId).toBeNull()
    expect(result.current.isDemoUser).toBe(false)
  })

  it('setWalletId stores the wallet and marks a real wallet as not a demo user', () => {
    const { result } = renderHook(() => useSessionStore())

    act(() => {
      result.current.setWalletId('someplayer.wam')
    })

    expect(result.current.walletId).toBe('someplayer.wam')
    expect(result.current.isDemoUser).toBe(false)
  })

  it('setWalletId marks the configured demo account as isDemoUser', () => {
    const { result } = renderHook(() => useSessionStore())

    act(() => {
      result.current.setWalletId('demo.wam')
    })

    expect(result.current.walletId).toBe('demo.wam')
    expect(result.current.isDemoUser).toBe(true)
  })

  it('setWalletId(null) clears the wallet and isDemoUser', () => {
    const { result } = renderHook(() => useSessionStore())

    act(() => {
      result.current.setWalletId('demo.wam')
    })
    act(() => {
      result.current.setWalletId(null)
    })

    expect(result.current.walletId).toBeNull()
    expect(result.current.isDemoUser).toBe(false)
  })
})
