import { screen } from '@testing-library/react'
import { mockStore, renderMissions } from 'features/missions/testUtils/mockStore'
import { mockOnboard, onboardWallet } from 'features/missions/testUtils/onboardMock'

import { Missions } from './Missions'

jest.mock('store', () => jest.requireActual('features/missions/testUtils/mockStore').storeMock)
jest.mock(
  '@web3-onboard/react',
  () => jest.requireActual('features/missions/testUtils/onboardMock').onboardMock
)
jest.mock('features/missions/components/MissionsTable', () => ({
  MissionsTable: () => <div data-testid="missions-table" />,
}))

const showMissionsPage = jest.fn()
const showMissionsExplorerPage = jest.fn()

const setup = (at: string) => {
  mockStore({ actions: { main: { showMissionsPage, showMissionsExplorerPage } } })
  return renderMissions(<Missions />, { at })
}

beforeEach(() => {
  jest.clearAllMocks()
  mockOnboard()
})

describe('Missions', () => {
  it('opens the missions centre', () => {
    setup('/missions')

    expect(showMissionsPage).toHaveBeenCalled()
    expect(showMissionsExplorerPage).not.toHaveBeenCalled()
  })

  it('opens My Missions (after the centre, on mount)', () => {
    setup('/missions/my')

    expect(showMissionsPage).toHaveBeenCalledTimes(1)
    expect(showMissionsExplorerPage).toHaveBeenCalledTimes(1)
  })

  it('shows the table with a BSC wallet connected', () => {
    mockOnboard({ wallets: [onboardWallet()] })
    setup('/missions')

    expect(screen.getByTestId('missions-table')).toBeInTheDocument()
    expect(screen.queryByText('No Missions Available yet')).not.toBeInTheDocument()
  })

  it('says there are no missions without a BSC wallet', () => {
    setup('/missions')

    expect(screen.getByText('No Missions Available yet')).toBeInTheDocument()
    expect(screen.queryByTestId('missions-table')).not.toBeInTheDocument()
  })
})
