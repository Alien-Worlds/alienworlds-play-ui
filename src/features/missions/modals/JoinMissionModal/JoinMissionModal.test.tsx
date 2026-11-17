import { act, fireEvent, screen } from '@testing-library/react'
import { buildMission } from 'features/missions/testUtils/fixtures'
import { mockStore, renderMissions } from 'features/missions/testUtils/mockStore'
import { MissionType } from 'features/missions/types/missionsTypes'
import { useModalStore } from 'shared/store/modalStore'

import { JoinMissionModal } from './JoinMissionModal'

jest.mock('store', () => jest.requireActual('features/missions/testUtils/mockStore').storeMock)
jest.mock(
  '@alien-worlds/uikit',
  () => jest.requireActual('features/missions/testUtils/mocks').uikitMock
)

const mockNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}))

const initialModals = useModalStore.getState().primaryModals
const setJoinMissionStep = jest.fn()

const setup = (joinMissionStep: number | null, missionShipsCount: number | null = 3) => {
  mockStore({
    state: {
      missions: {
        joinMissionStep,
        missionShipsCount,
        selectedMission: buildMission({
          id: '7',
          attributes: { name: 'Courier Run', missionType: MissionType.Courier },
        }),
      },
    },
    actions: { missions: { setJoinMissionStep } },
  })
  useModalStore.setState({ primaryModals: { ...initialModals, JoinMissionModal: true } })
  return renderMissions(<JoinMissionModal />)
}

const isOpen = () => useModalStore.getState().primaryModals.JoinMissionModal

beforeEach(() => {
  jest.clearAllMocks()
  useModalStore.setState({ primaryModals: initialModals })
})

afterEach(() => {
  jest.useRealTimers()
})

describe('JoinMissionModal', () => {
  it('shows the approval step', () => {
    setup(1)

    expect(screen.getByText('Joining Mission')).toBeInTheDocument()
    expect(
      screen.getByText('Approving TLM spending for spacecrafts, please wait..')
    ).toBeInTheDocument()
    expect(screen.getByText('Courier Run')).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'My Missions' })).not.toBeInTheDocument()
  })

  it('shows the sending step', () => {
    setup(2)

    expect(screen.getByText('Joining Mission')).toBeInTheDocument()
    expect(
      screen.getByText('Allocating spacecrafts to the Mission, please wait..')
    ).toBeInTheDocument()
  })

  it('shows the joined step with the spacecrafts sent and where to go next', () => {
    setup(3)

    expect(screen.getByText('Mission Joined')).toBeInTheDocument()
    expect(screen.getByText('spacecrafts you have sent:')).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'My Missions' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Missions Centre' })).toBeInTheDocument()
  })

  it('shows the failed step without a spacecraft count', () => {
    setup(4)

    expect(screen.getByText('Mission not Joined')).toBeInTheDocument()
    expect(screen.getByText('Mission failed to join')).toBeInTheDocument()
    expect(screen.queryByText('3')).not.toBeInTheDocument()
  })

  it.each([
    ['My Missions', '/missions/my'],
    ['Missions Centre', '/missions'],
  ])('closes, resets the step and opens %s', (button, path) => {
    setup(4)

    fireEvent.click(screen.getByRole('button', { name: button }))

    expect(setJoinMissionStep).toHaveBeenCalledWith(null)
    expect(isOpen()).toBe(false)
    expect(mockNavigate).toHaveBeenCalledWith(path)
  })

  it('closes by itself 3 seconds after joining, on My Missions', () => {
    jest.useFakeTimers()
    setup(3)

    act(() => {
      jest.advanceTimersByTime(2900)
    })
    expect(isOpen()).toBe(true)

    act(() => {
      jest.advanceTimersByTime(200)
    })
    expect(isOpen()).toBe(false)
    expect(setJoinMissionStep).toHaveBeenCalledWith(null)
    expect(mockNavigate).toHaveBeenCalledWith('/missions/my')
  })

  it('stays open after a failure', () => {
    jest.useFakeTimers()
    setup(4)

    act(() => {
      jest.advanceTimersByTime(5000)
    })

    expect(isOpen()).toBe(true)
  })
})
