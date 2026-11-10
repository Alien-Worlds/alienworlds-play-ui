import { fireEvent, screen } from '@testing-library/react'
import { buildExplorer, buildMission } from 'features/missions/testUtils/fixtures'
import { mockStore, renderMissions } from 'features/missions/testUtils/mockStore'
import { mockOnboard, onboardWallet } from 'features/missions/testUtils/onboardMock'
import { MissionStatus } from 'store/missions/types'

import { MissionsViewMobile } from './MissionsViewMobile'

// The missions summary in the main drawer's header on mobile.

jest.mock('store', () => jest.requireActual('features/missions/testUtils/mockStore').storeMock)
jest.mock(
  '@web3-onboard/react',
  () => jest.requireActual('features/missions/testUtils/onboardMock').onboardMock
)
jest.mock(
  '@alien-worlds/uikit',
  () => jest.requireActual('features/missions/testUtils/mocks').uikitMock
)
jest.mock('shared/util/config', () => ({
  config: { ...jest.requireActual('shared/util/config').config, BscChainId: 56 },
}))

const mockNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}))

const setup = () => {
  mockStore({
    state: {
      web3: {
        userWallet: null,
        bscTlmBalanceFormatted: '1,234.5',
        bscStakedTlmBalanceFormatted: null,
      },
      missions: {
        explorer: buildExplorer([
          buildMission({ id: '1', status: MissionStatus.Departed }),
          buildMission({ id: '2', status: MissionStatus.Departed }),
        ]),
        availableMissions: [buildMission({ id: '3' })],
        totalMissionsRewards: 3,
      },
    },
    actions: { web3: { setWallet: jest.fn(), setIsAutoConnect: jest.fn(), setIsSync: jest.fn() } },
  })
  return renderMissions(<MissionsViewMobile />)
}

beforeEach(() => {
  jest.clearAllMocks()
  mockOnboard()
})

describe('MissionsViewMobile', () => {
  it('asks to connect a BSC wallet', () => {
    const { connect } = mockOnboard()
    setup()

    fireEvent.click(screen.getAllByRole('button', { name: 'Connect Wallet' })[0])

    expect(connect).toHaveBeenCalled()
  })

  it('shows the missions on, balances and total reward, and opens the centre', () => {
    mockOnboard({
      wallets: [onboardWallet()],
      wallet: onboardWallet(),
      connectedChain: { id: '0x38' },
    })
    setup()

    expect(screen.getByText('On Missions').closest('div').parentElement).toHaveTextContent('2 / 1')
    expect(screen.getByText('1,234.5')).toBeInTheDocument()
    expect(screen.getByText('3.0000')).toBeInTheDocument()
    expect(screen.getByText('0.0')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Open Mission Center' }))
    expect(mockNavigate).toHaveBeenCalledWith('/missions')
  })
})
