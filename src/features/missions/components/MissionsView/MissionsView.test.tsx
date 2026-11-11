import { fireEvent, screen } from '@testing-library/react'
import { buildExplorer, buildMission } from 'features/missions/testUtils/fixtures'
import { mockStore, renderMissions } from 'features/missions/testUtils/mockStore'
import { mockOnboard, onboardWallet } from 'features/missions/testUtils/onboardMock'
import { MissionStatus } from 'store/missions/types'

import { MissionsView } from './MissionsView'

// The missions summary in the main drawer.

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
  'features/glossary/components/GlossaryInfoIcon/GlossaryInfoIcon',
  () => jest.requireActual('features/missions/testUtils/mocks').glossaryIconMock
)
jest.mock('shared/util/config', () => ({
  config: { ...jest.requireActual('shared/util/config').config, BscChainId: 56 },
}))

const actions = {
  web3: { setWallet: jest.fn(), setIsAutoConnect: jest.fn(), setIsSync: jest.fn() },
}

const setup = () => {
  const departed = buildMission({ id: '1', status: MissionStatus.Departed })
  mockStore({
    state: {
      web3: {
        userWallet: null,
        bscTlmBalanceFormatted: '1,234.5',
        bscStakedTlmBalanceFormatted: '20.0',
      },
      missions: {
        explorer: buildExplorer([departed, buildMission({ id: '2' })]),
        currentMissions: [departed],
        availableMissions: [buildMission({ id: '3' }), buildMission({ id: '4' })],
        missionsToClaimCount: 0,
        totalMissionsRewards: 12.5,
      },
      main: { runtimeInSeconds: 0 },
    },
    actions,
  })
  return renderMissions(<MissionsView />)
}

beforeEach(() => {
  jest.clearAllMocks()
  mockOnboard()
})

describe('MissionsView', () => {
  it('asks to connect a BSC wallet', () => {
    const { connect } = mockOnboard()
    setup()

    fireEvent.click(screen.getByRole('button', { name: 'Connect Wallet' }))

    expect(connect).toHaveBeenCalled()
    expect(screen.getByText('Binance Smart Chain Network')).toBeInTheDocument()
  })

  it('asks to switch to BSC on another chain', () => {
    mockOnboard({
      wallets: [onboardWallet()],
      wallet: onboardWallet(),
      connectedChain: { id: '0x1' },
    })
    setup()

    expect(screen.getByText(/Make sure you are connected to the/)).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Connect Wallet' })).not.toBeInTheDocument()
  })

  it('shows the active missions, balances, rewards and next countdown', () => {
    mockOnboard({
      wallets: [onboardWallet()],
      wallet: onboardWallet(),
      connectedChain: { id: '0x38' },
    })
    setup()

    expect(screen.getByText('1 / 2')).toBeInTheDocument()
    expect(screen.getByText('1,234.5')).toBeInTheDocument()
    expect(screen.getByText('20.0')).toBeInTheDocument()
    expect(screen.getByText('12.5000')).toBeInTheDocument()
    expect(screen.getByText(/Finishing in:/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Open My Missions/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Missions Centre/ })).toBeInTheDocument()
  })
})
