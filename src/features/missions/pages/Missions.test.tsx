import { screen } from '@testing-library/react'
import { useMissionsStore } from 'features/missions/store/missionsStore'
import { mockStore, renderMissions } from 'features/missions/testUtils/mockStore'
import { mockOnboard, onboardWallet } from 'features/missions/testUtils/onboardMock'
import { useModalStore } from 'shared/store/modalStore'
import { collectEvent } from 'shared/util/analytics'

import { Missions } from './Missions'

jest.mock('store', () => jest.requireActual('features/missions/testUtils/mockStore').storeMock)
jest.mock(
  '@web3-onboard/react',
  () => jest.requireActual('features/missions/testUtils/onboardMock').onboardMock
)
jest.mock('features/missions/components/MissionsTable', () => ({
  MissionsTable: () => <div data-testid="missions-table" />,
}))
jest.mock('shared/util/analytics', () => ({ collectEvent: jest.fn() }))

const setup = (at: string) => {
  mockStore({ state: { missions: { filteredAndSortedMissions: [] } } })
  return renderMissions(<Missions />, { at })
}

const pageVisits = () =>
  (collectEvent as jest.Mock).mock.calls
    .map(([event]) => event)
    .filter((event) => event.name === 'page_visit')
    .map((event) => event.fields.location)

beforeEach(() => {
  jest.clearAllMocks()
  mockOnboard()
  useModalStore.setState({ isMainDrawerOpen: true })
})

describe('Missions', () => {
  it('opens the missions centre on its tab, closing the drawer and sorting the list again', () => {
    setup('/missions')

    expect(pageVisits()).toEqual(['/missions'])
    expect(useModalStore.getState().isMainDrawerOpen).toBe(false)
    expect(useMissionsStore.getState()).toMatchObject({
      selectedMissionsTab: 0,
      filteredAndSortedMissions: null,
      triggerFilterAndSortMissions: true,
    })
  })

  // It used to report a Missions Centre visit first, then the My Missions one.
  it('opens My Missions on its tab, reporting just that visit', () => {
    setup('/missions/my')

    expect(pageVisits()).toEqual(['/missions/my'])
    expect(useMissionsStore.getState().selectedMissionsTab).toBe(1)
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
