import { act, fireEvent, screen, within } from '@testing-library/react'
import { useMissionsStore } from 'features/missions/store/missionsStore'
import { buildInvestInfo, buildMission } from 'features/missions/testUtils/fixtures'
import { mockStore, renderMissions } from 'features/missions/testUtils/mockStore'
import { mockOnboard } from 'features/missions/testUtils/onboardMock'
import { MissionStatus, SortBy } from 'features/missions/types/missionsTypes'

import { MissionsTable } from './MissionsTable'

jest.mock('store', () => jest.requireActual('features/missions/testUtils/mockStore').storeMock)
jest.mock(
  '@web3-onboard/react',
  () => jest.requireActual('features/missions/testUtils/onboardMock').onboardMock
)
jest.mock(
  'shared/layouts',
  () => jest.requireActual('features/missions/testUtils/mocks').layoutsMock
)

const mockNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}))

const setMissionsFilter = jest.fn()
const loadMissionRewards = jest.fn()
const claimMissionRewards = jest.fn()
const defaultFilter = { sortBy: SortBy.Id, reversed: true }

const setup = (missions: any[], missionsFilter = defaultFilter, at = '/missions') => {
  mockStore({
    state: {
      missions: {
        filteredAndSortedMissions: missions,
        missionsFilter,
        missionRewards: null,
        missionRewardsLoading: false,
      },
    },
    actions: { missions: { setMissionsFilter, loadMissionRewards, claimMissionRewards } },
  })
  return renderMissions(<MissionsTable />, { at })
}

const rows = () => screen.getAllByRole('row').slice(1)

const manyMissions = () => Array.from({ length: 45 }, (_, i) => buildMission({ id: `${i + 1}` }))

beforeEach(() => {
  jest.clearAllMocks()
  mockOnboard()
})

describe('MissionsTable', () => {
  it('shows a sortable column per field', () => {
    setup([])

    const headers = screen.getAllByRole('columnheader').map((th) => th.textContent)
    expect(headers).toEqual([
      'Type',
      'Id',
      'Name',
      'Series',
      'Duration',
      'Rewards',
      'Rarity',
      'Spacecrafts',
      'Time',
      'Status',
    ])
  })

  it('shows a row per mission with its details', () => {
    setup([
      buildMission({
        id: '12',
        attributes: { name: 'Courier Run', reward: 1234500000, totalShips: 2500, duration: 7200 },
      }),
    ])

    const [row] = rows()
    expect(within(row).getByText('12')).toBeInTheDocument()
    expect(within(row).getByText('Courier Run')).toBeInTheDocument()
    expect(within(row).getByText('2 hours')).toBeInTheDocument()
    expect(within(row).getByText('123,450')).toBeInTheDocument()
    expect(within(row).getByText('2,500')).toBeInTheDocument()
    expect(within(row).getByText(/Starting in:/)).toBeInTheDocument()
    expect(within(row).getByRole('button', { name: 'Info' })).toBeInTheDocument()
  })

  it('shows the spacecrafts sent on a joined mission, and -- once completed', () => {
    setup([
      buildMission({
        id: '1',
        status: MissionStatus.Completed,
        attributes: { totalShips: 10 },
        investInfo: buildInvestInfo({ numberOfShips: 4, withdrawn: true }),
      }),
    ])

    const [row] = rows()
    expect(within(row).getByText('4')).toBeInTheDocument()
    expect(within(row).getByText('--')).toBeInTheDocument()
    expect(within(row).getByText('Completed')).toBeInTheDocument()
  })

  it('shows the first 30 missions, and the rest on scrolling', () => {
    setup(manyMissions())

    expect(rows()).toHaveLength(30)

    fireEvent.scroll(window)
    expect(rows()).toHaveLength(45)
  })

  // The store refreshes the missions' views every second, giving a new list each time.
  it('keeps the missions shown when their timers refresh', () => {
    setup(manyMissions())
    fireEvent.scroll(window)

    act(() => {
      useMissionsStore.setState({ filteredAndSortedMissions: manyMissions() })
    })

    expect(rows()).toHaveLength(45)
  })

  it('goes back to the first 30 for a different list', () => {
    setup(manyMissions())
    fireEvent.scroll(window)

    act(() => {
      useMissionsStore.setState({ filteredAndSortedMissions: manyMissions().reverse() })
    })

    expect(rows()).toHaveLength(30)
  })

  it('flips the order when the current sort column is clicked', () => {
    setup([])

    fireEvent.click(screen.getByRole('columnheader', { name: 'Id' }))

    expect(setMissionsFilter).toHaveBeenCalledWith({ sortBy: SortBy.Id, reversed: false })
  })

  it('sorts by another column, keeping the order', () => {
    setup([])

    fireEvent.click(screen.getByRole('columnheader', { name: 'Rewards' }))

    expect(setMissionsFilter).toHaveBeenCalledWith({ sortBy: SortBy.Rewards, reversed: true })
  })

  it('opens the mission when a row is clicked', () => {
    setup([buildMission({ id: '12' })])

    fireEvent.click(rows()[0])

    expect(mockNavigate).toHaveBeenCalledWith('/missions/12')
  })

  it('opens the claim dialog for a completed, unclaimed mission', async () => {
    setup([
      buildMission({
        id: '12',
        status: MissionStatus.Completed,
        attributes: { name: 'Courier Run' },
        investInfo: buildInvestInfo(),
      }),
    ])

    fireEvent.click(rows()[0])

    expect(mockNavigate).not.toHaveBeenCalled()
    expect(await screen.findByRole('button', { name: 'Return' })).toBeInTheDocument()
    expect(loadMissionRewards).toHaveBeenCalledWith('12')
  })

  it('shows Claim, Claimed and progress on My Missions', () => {
    setup(
      [
        buildMission({ id: '1', status: MissionStatus.Completed, investInfo: buildInvestInfo() }),
        buildMission({
          id: '2',
          status: MissionStatus.Completed,
          investInfo: buildInvestInfo({ withdrawn: true }),
        }),
        buildMission({ id: '3', status: MissionStatus.Boarding, investInfo: buildInvestInfo() }),
      ],
      defaultFilter,
      '/missions/my'
    )

    const [claim, claimed, stationed] = rows()
    expect(within(claim).getByRole('button', { name: 'Claim' })).toBeInTheDocument()
    expect(within(claimed).getByText('Claimed')).toBeInTheDocument()
    expect(within(stationed).getByText('Stationed')).toBeInTheDocument()
  })
})
