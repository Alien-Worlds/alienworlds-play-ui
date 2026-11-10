import { fireEvent, screen, waitFor } from '@testing-library/react'
import { buildUserWallet } from 'features/missions/testUtils/fixtures'
import { mockStore, renderMissions } from 'features/missions/testUtils/mockStore'
import { mockOnboard } from 'features/missions/testUtils/onboardMock'

import { MissionsTabs } from './MissionsTabs'

jest.mock('store', () => jest.requireActual('features/missions/testUtils/mockStore').storeMock)
jest.mock(
  '@web3-onboard/react',
  () => jest.requireActual('features/missions/testUtils/onboardMock').onboardMock
)

const mockNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}))

const reloadMissions = jest.fn()
const setSelectedMissionsTab = jest.fn()

const setup = ({
  missionsToClaimCount = 0,
  selectedMissionsTab = 0,
  userWallet = null,
  isAutoConnect = true,
} = {}) => {
  mockStore({
    state: {
      web3: { userWallet, isAutoConnect },
      missions: { missionsToClaimCount, selectedMissionsTab },
    },
    actions: { missions: { reloadMissions, setSelectedMissionsTab } },
  })
  return renderMissions(<MissionsTabs />)
}

beforeEach(() => {
  jest.clearAllMocks()
  localStorage.clear()
  mockOnboard()
})

describe('MissionsTabs', () => {
  it('shows the three missions tabs', () => {
    setup()

    expect(screen.getAllByRole('tab').map((tab) => tab.textContent)).toEqual([
      'Centre',
      'My Missions',
      'NFT Inventory',
    ])
    expect(screen.getByRole('tab', { name: 'Centre' })).toHaveAttribute('aria-selected', 'true')
  })

  it('reloads the missions when it mounts', () => {
    setup({ userWallet: buildUserWallet() })

    expect(reloadMissions).toHaveBeenCalled()
  })

  it('selects the tab and opens its page', () => {
    setup()

    fireEvent.click(screen.getByRole('tab', { name: 'NFT Inventory' }))

    expect(setSelectedMissionsTab).toHaveBeenCalledWith(2)
    expect(mockNavigate).toHaveBeenCalledWith('/missions/inventory')
  })

  it('badges My Missions with the missions to claim', () => {
    setup({ missionsToClaimCount: 3 })

    expect(screen.getByRole('tab', { name: /My Missions/ })).toHaveTextContent('My Missions3')
  })

  it('shows 10+ above ten missions to claim', () => {
    setup({ missionsToClaimCount: 12 })

    expect(screen.getByRole('tab', { name: /My Missions/ })).toHaveTextContent('My Missions10+')
  })

  it('keeps the badge count from when the tabs mounted', () => {
    const { rerender } = setup({ missionsToClaimCount: 0 })

    mockStore({
      state: { web3: { isAutoConnect: true }, missions: { missionsToClaimCount: 4 } },
      actions: { missions: { reloadMissions, setSelectedMissionsTab } },
    })
    rerender(<MissionsTabs />)

    expect(screen.getByRole('tab', { name: /My Missions/ })).toHaveTextContent(/^My Missions$/)
  })

  it('shows no badge with nothing to claim', () => {
    setup({ missionsToClaimCount: 0 })

    expect(screen.getByRole('tab', { name: /My Missions/ })).toHaveTextContent(/^My Missions$/)
  })

  it('reconnects the last BSC wallet', async () => {
    localStorage.setItem('connectedWallets', JSON.stringify(['MetaMask']))
    const { connect } = mockOnboard()
    setup()

    await waitFor(() => expect(connect).toHaveBeenCalledWith({ autoSelect: 'MetaMask' }))
  })

  it("doesn't reconnect when auto-connect is off", async () => {
    localStorage.setItem('connectedWallets', JSON.stringify(['MetaMask']))
    const { connect } = mockOnboard()
    setup({ isAutoConnect: false })

    await waitFor(() => expect(reloadMissions).toHaveBeenCalledTimes(2))
    expect(connect).not.toHaveBeenCalled()
  })
})
