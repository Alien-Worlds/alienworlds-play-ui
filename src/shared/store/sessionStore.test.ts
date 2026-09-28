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

  it('starts with no wallet, isDemoUser false, and logged out', () => {
    const { result } = renderHook(() => useSessionStore())

    expect(result.current.walletId).toBeNull()
    expect(result.current.isDemoUser).toBe(false)
    expect(result.current.isLoggedIn).toBe(false)
    expect(result.current.currentWallet).toBeNull()
    expect(result.current.isAuthenticating).toBeNull()
  })

  it('setWalletId stores the wallet, marks a real wallet as not a demo user, and logs in', () => {
    const { result } = renderHook(() => useSessionStore())

    act(() => {
      result.current.setWalletId('someplayer.wam')
    })

    expect(result.current.walletId).toBe('someplayer.wam')
    expect(result.current.isDemoUser).toBe(false)
    expect(result.current.isLoggedIn).toBe(true)
  })

  it('setWalletId marks the configured demo account as isDemoUser', () => {
    const { result } = renderHook(() => useSessionStore())

    act(() => {
      result.current.setWalletId('demo.wam')
    })

    expect(result.current.walletId).toBe('demo.wam')
    expect(result.current.isDemoUser).toBe(true)
  })

  it('setWalletId(null) clears the wallet, isDemoUser, and isLoggedIn', () => {
    const { result } = renderHook(() => useSessionStore())

    act(() => {
      result.current.setWalletId('demo.wam')
    })
    act(() => {
      result.current.setWalletId(null)
    })

    expect(result.current.walletId).toBeNull()
    expect(result.current.isDemoUser).toBe(false)
    expect(result.current.isLoggedIn).toBe(false)
  })

  it('setCurrentWallet stores the active wallet type', () => {
    const { result } = renderHook(() => useSessionStore())

    act(() => {
      result.current.setCurrentWallet('wax')
    })

    expect(result.current.currentWallet).toBe('wax')
  })

  it('setIsAuthenticating tracks the in-flight login state', () => {
    const { result } = renderHook(() => useSessionStore())

    act(() => {
      result.current.setIsAuthenticating(true)
    })
    expect(result.current.isAuthenticating).toBe(true)

    act(() => {
      result.current.setIsAuthenticating(false)
    })
    expect(result.current.isAuthenticating).toBe(false)
  })
})
