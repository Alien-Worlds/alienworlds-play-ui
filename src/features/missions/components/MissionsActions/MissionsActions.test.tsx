import { fireEvent, renderHook, screen } from '@testing-library/react'
import { buildMission } from 'features/missions/testUtils/fixtures'
import { mockStore, renderMissions } from 'features/missions/testUtils/mockStore'
import { mockOnboard, onboardWallet } from 'features/missions/testUtils/onboardMock'
import { useModalStore } from 'shared/store/modalStore'
import { useSessionStore } from 'shared/store/sessionStore'
import { collectEvent } from 'shared/util/analytics'
import { Constants } from 'shared/util/constants'

import {
  ConnectWalletBtn,
  MissionsCentreBtn,
  MyMissionsBtn,
  useWalletConnect,
} from './MissionsActions'

jest.mock('store', () => jest.requireActual('features/missions/testUtils/mockStore').storeMock)
jest.mock(
  '@web3-onboard/react',
  () => jest.requireActual('features/missions/testUtils/onboardMock').onboardMock
)
jest.mock(
  '@alien-worlds/uikit',
  () => jest.requireActual('features/missions/testUtils/mocks').uikitMock
)
jest.mock('shared/util/analytics', () => ({ collectEvent: jest.fn() }))
jest.mock('shared/util/config', () => ({
  config: { ...jest.requireActual('shared/util/config').config, BscChainId: 56 },
}))

const mockNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}))

const initialModals = useModalStore.getState().primaryModals
const setWallet = jest.fn()
const setIsAutoConnect = jest.fn()
const setIsSync = jest.fn()

beforeEach(() => {
  jest.clearAllMocks()
  localStorage.clear()
  mockOnboard()
  useModalStore.setState({ primaryModals: initialModals })
  useSessionStore.setState({ isDemoUser: false, walletId: null })
})

describe('MyMissionsBtn and MissionsCentreBtn', () => {
  it('open My Missions, with the missions to claim', () => {
    mockStore({ state: { missions: { missionsToClaimCount: 2 } } })
    renderMissions(<MyMissionsBtn />)

    fireEvent.click(screen.getByRole('button'))

    expect(screen.getByRole('button')).toHaveTextContent('Open My Missions2')
    expect(mockNavigate).toHaveBeenCalledWith('/missions/my')
  })

  it('open the centre, with the missions boarding', () => {
    mockStore({ state: { missions: { availableMissions: [buildMission(), buildMission()] } } })
    renderMissions(<MissionsCentreBtn />)

    fireEvent.click(screen.getByRole('button'))

    expect(screen.getByRole('button')).toHaveTextContent('Missions Centre2')
    expect(mockNavigate).toHaveBeenCalledWith('/missions')
  })
})

describe('ConnectWalletBtn', () => {
  it('connects the BSC wallet', () => {
    const onClick = jest.fn()
    renderMissions(<ConnectWalletBtn onClick={onClick} />)

    fireEvent.click(screen.getByRole('button', { name: 'Connect Wallet' }))

    expect(onClick).toHaveBeenCalled()
  })

  it('asks a demo user to log in instead', () => {
    useSessionStore.setState({ isDemoUser: true })
    const onClick = jest.fn()
    renderMissions(<ConnectWalletBtn onClick={onClick} />)

    fireEvent.click(screen.getByRole('button', { name: 'Connect Wallet' }))

    expect(onClick).not.toHaveBeenCalled()
    expect(useModalStore.getState().primaryModals.LoginModal).toBe(true)
  })
})

describe('useWalletConnect', () => {
  const run = (userWallet: any = null) => {
    mockStore({
      state: { web3: { userWallet } },
      actions: { web3: { setWallet, setIsAutoConnect, setIsSync } },
    })
    return renderHook(() => useWalletConnect())
  }

  it('turns auto-connect off with no wallet connected', () => {
    run()

    expect(setIsAutoConnect).toHaveBeenCalledWith(false)
    expect(setWallet).not.toHaveBeenCalled()
  })

  it('stores the connected wallet, remembers it and switches to BSC', () => {
    const wallet = onboardWallet('0xmeta', 'MetaMask')
    const { setChain } = mockOnboard({ wallets: [wallet], wallet })

    run()

    expect(setWallet).toHaveBeenCalledWith(wallet)
    expect(JSON.parse(localStorage.getItem('connectedWallets'))).toEqual(['MetaMask'])
    expect(setChain).toHaveBeenCalledWith({ chainId: '0x38' })
    expect(setIsSync).not.toHaveBeenCalled()
  })

  it('reports the login with the WAX and BSC addresses', () => {
    useSessionStore.setState({ walletId: 'miner.wam' })
    const wallet = onboardWallet('0xmeta', 'MetaMask')
    mockOnboard({ wallets: [wallet], wallet })

    run()

    expect(collectEvent).toHaveBeenCalledWith({
      name: Constants.GA_AW_LOGIN,
      fields: { wallet: 'miner.wam', wallet_metamask: '0xmeta' },
    })
  })

  it('reports a Coinbase wallet under its own field', () => {
    const wallet = onboardWallet('0xcb', 'Coinbase Wallet')
    mockOnboard({ wallets: [wallet], wallet })

    run()

    expect(collectEvent).toHaveBeenCalledWith({
      name: Constants.GA_AW_LOGIN,
      fields: { wallet_cb: '0xcb' },
    })
  })

  it('finds the MetaMask wallet anywhere in the connected list', () => {
    const wallet = onboardWallet('0xtrust', 'Trust Wallet')
    mockOnboard({
      wallets: [wallet, onboardWallet('0xledger', 'Ledger'), onboardWallet('0xmeta', 'MetaMask')],
      wallet,
    })

    run()

    expect(collectEvent).toHaveBeenCalledWith({
      name: Constants.GA_AW_LOGIN,
      fields: { wallet_metamask: '0xmeta' },
    })
  })

  // The lookup used to step `i = +1`, so it never got past the second wallet and froze the tab.
  it('reports nothing when neither tracked wallet is connected, with several connected', () => {
    const wallet = onboardWallet('0xtrust', 'Trust Wallet')
    mockOnboard({ wallets: [wallet, onboardWallet('0xledger', 'Ledger')], wallet })

    run()

    expect(collectEvent).not.toHaveBeenCalled()
    expect(setWallet).toHaveBeenCalledWith(wallet)
  })

  it('asks for a resync when the wallet changes', () => {
    const wallet = onboardWallet('0xcb', 'Coinbase Wallet')
    mockOnboard({ wallets: [wallet], wallet })

    run({ label: 'MetaMask' })

    expect(setIsSync).toHaveBeenCalledWith(false)
  })

  it('returns the connection state', () => {
    const wallet = onboardWallet()
    const { connect } = mockOnboard({
      wallets: [wallet],
      wallet,
      connecting: true,
      connectedChain: { id: '0x38' },
    })

    const { result } = run()

    expect(result.current).toEqual({
      connect,
      connecting: true,
      connectedChain: { id: '0x38' },
      connectedWallets: [wallet],
    })
  })
})
