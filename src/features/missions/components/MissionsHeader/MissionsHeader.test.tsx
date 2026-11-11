import { fireEvent, screen } from '@testing-library/react'
import { buildUserWallet } from 'features/missions/testUtils/fixtures'
import { mockStore, renderMissions } from 'features/missions/testUtils/mockStore'
import { mockOnboard, onboardWallet } from 'features/missions/testUtils/onboardMock'

import { MissionsHeader } from './MissionsHeader'

jest.mock('store', () => jest.requireActual('features/missions/testUtils/mockStore').storeMock)
jest.mock(
  '@web3-onboard/react',
  () => jest.requireActual('features/missions/testUtils/onboardMock').onboardMock
)
jest.mock(
  '@alien-worlds/uikit',
  () => jest.requireActual('features/missions/testUtils/mocks').uikitMock
)
jest.mock(
  'shared/layouts',
  () => jest.requireActual('features/missions/testUtils/mocks').layoutsMock
)
jest.mock(
  'features/glossary/components/GlossaryInfoIcon/GlossaryInfoIcon',
  () => jest.requireActual('features/missions/testUtils/mocks').glossaryIconMock
)
jest.mock('features/missions/components/MissionsTabs/MissionsTabs', () => ({
  MissionsTabs: () => <div data-testid="missions-tabs" />,
}))

const mockCopy = jest.fn()
jest.mock('react-use', () => ({
  ...jest.requireActual('react-use'),
  useCopyToClipboard: () => [{}, mockCopy],
}))

const setup = (at: string, userWallet: any = null) => {
  mockStore({
    state: {
      web3: {
        userWallet,
        bscTlmBalanceFormatted: '1,234.5',
        bscStakedTlmBalanceFormatted: '20.0',
      },
      missions: { subscribedEmail: null },
    },
    actions: { web3: { setWallet: jest.fn(), setIsAutoConnect: jest.fn(), setIsSync: jest.fn() } },
  })
  return renderMissions(<MissionsHeader />, { at })
}

beforeEach(() => {
  jest.clearAllMocks()
  mockOnboard()
})

describe('MissionsHeader', () => {
  it.each([
    ['/missions', 'Missions Centre', 'Explore Missions, Discover NFTs'],
    ['/missions/my', 'Missions Explorer', 'Monitor your ongoing Missions'],
    ['/missions/inventory', 'My NFTs Inventory', 'Claimed Mission NFTs (*view only)'],
  ])('titles %s', (at, title, subtitle) => {
    setup(at)

    expect(screen.getAllByText(title).length).toBeGreaterThan(0)
    expect(screen.getByText(subtitle)).toBeInTheDocument()
  })

  it('shows the BSC balances', () => {
    setup('/missions')

    expect(screen.getByText('1,234.5')).toBeInTheDocument()
    expect(screen.getByText('20.0')).toBeInTheDocument()
  })

  it('asks to connect a BSC wallet', () => {
    const { connect } = mockOnboard()
    setup('/missions')

    fireEvent.click(screen.getByRole('button', { name: 'Connect Wallet' }))

    expect(connect).toHaveBeenCalled()
  })

  it('shows the connected address, and copies it on click', () => {
    const address = '0x1234567890abcdef1234567890abcdef12345678'
    mockOnboard({ wallets: [onboardWallet(address)], wallet: onboardWallet(address) })
    setup('/missions', buildUserWallet(address))

    fireEvent.click(screen.getByText(address.substring(0, 28)))

    expect(mockCopy).toHaveBeenCalledWith(address)
    expect(screen.queryByRole('button', { name: 'Connect Wallet' })).not.toBeInTheDocument()
  })

  it('opens the newsletter sign-up', async () => {
    ;(window as any).mootrack = jest.fn()
    setup('/missions')

    fireEvent.click(screen.getAllByRole('button', { name: /NEWS, UPDATES AND MORE!/ })[0])

    expect(await screen.findByText(/After signing up for our newsletter/)).toBeInTheDocument()
  })
})
