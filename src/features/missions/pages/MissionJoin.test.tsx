import { fireEvent, screen } from '@testing-library/react'
import { BigNumber } from 'ethers'
import { buildInvestInfo, buildMission } from 'features/missions/testUtils/fixtures'
import { mockStore, renderMissions } from 'features/missions/testUtils/mockStore'
import { useModalStore } from 'shared/store/modalStore'
import { PagePath } from 'store/main/types'
import { MissionType } from 'store/missions/types'

import { MissionJoin } from './MissionJoin'

jest.mock('store', () => jest.requireActual('features/missions/testUtils/mockStore').storeMock)
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

const mockNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}))

const initialModals = useModalStore.getState().primaryModals

const showMissionJoinPage = jest.fn()
const joinMission = jest.fn(async () => true)
const storeNewsletterWasShown = jest.fn()
const setMissionShipsCount = jest.fn()

const mission = (overrides = {}) =>
  buildMission({
    id: '7',
    attributes: {
      name: 'Courier Run',
      missionType: MissionType.Courier,
      spaceshipCost: 10000,
      duration: 2 * 86400,
    },
    ...overrides,
  })

const setup = ({
  selectedMission = mission(),
  bscTlmBalance = BigNumber.from(35000),
  newsletterWasShown = true,
  subscribedEmail = null,
}: Record<string, any> = {}) => {
  mockStore({
    state: {
      web3: { bscTlmBalance },
      missions: { selectedMission, newsletterWasShown, subscribedEmail },
    },
    actions: {
      main: { showMissionJoinPage },
      missions: { joinMission, storeNewsletterWasShown, setMissionShipsCount },
    },
  })
  return renderMissions(<MissionJoin />, { at: '/missions/7/join', path: PagePath.MissionJoin })
}

const ships = () => screen.getByRole('spinbutton') as HTMLInputElement
const startButton = () => screen.getByRole('button', { name: /start mission/i })

beforeEach(() => {
  jest.clearAllMocks()
  useModalStore.setState({ primaryModals: initialModals })
  // index.html defines the Moosend tracker the newsletter form loads through.
  ;(window as any).mootrack = jest.fn()
  window.scrollTo = jest.fn()
})

describe('MissionJoin', () => {
  it('selects the mission from the route', () => {
    setup()

    expect(showMissionJoinPage).toHaveBeenCalledWith('7')
  })

  it('renders nothing until the mission is selected', () => {
    setup({ selectedMission: null })

    expect(screen.queryByRole('spinbutton')).not.toBeInTheDocument()
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('shows the mission, the spacecraft price and starts at zero spacecrafts', () => {
    setup()

    expect(screen.getAllByText('Courier Run').length).toBeGreaterThan(0)
    expect(screen.getByText('Courier')).toBeInTheDocument()
    expect(screen.getByText('1 TLM')).toBeInTheDocument()
    expect(ships().value).toBe('0')
    expect(startButton()).toBeDisabled()
  })

  it('adds and removes spacecrafts within what the BSC balance pays for', () => {
    setup()
    const plus = screen.getByRole('button', { name: '+' })
    const minus = screen.getByRole('button', { name: '-' })

    fireEvent.click(minus)
    expect(ships().value).toBe('0')

    fireEvent.click(plus)
    fireEvent.click(plus)
    expect(ships().value).toBe('2')
    expect(screen.getByText(/TLM to be locked/)).toHaveTextContent('[2] TLM to be locked')

    fireEvent.click(plus)
    fireEvent.click(plus)
    expect(ships().value).toBe('3')

    fireEvent.click(minus)
    expect(ships().value).toBe('2')
  })

  it('fills the maximum, and caps a typed count at it', () => {
    setup()

    fireEvent.click(screen.getByRole('button', { name: 'MAX' }))
    expect(ships().value).toBe('3')

    fireEvent.change(ships(), { target: { value: '1' } })
    expect(ships().value).toBe('1')

    fireEvent.change(ships(), { target: { value: '50' } })
    expect(ships().value).toBe('3')
  })

  it('allows no spacecrafts without a BSC balance', () => {
    setup({ bscTlmBalance: null })

    fireEvent.click(screen.getByRole('button', { name: '+' }))

    expect(ships().value).toBe('0')
  })

  it('opens the join modal and joins with the chosen spacecrafts', () => {
    setup()
    fireEvent.click(screen.getByRole('button', { name: '+' }))
    fireEvent.click(screen.getByRole('button', { name: '+' }))

    fireEvent.click(startButton())

    expect(setMissionShipsCount).toHaveBeenCalledWith(2)
    expect(useModalStore.getState().primaryModals.JoinMissionModal).toBe(true)
    expect(joinMission).toHaveBeenCalledWith(2)
    expect(storeNewsletterWasShown).not.toHaveBeenCalled()
  })

  it('asks to sign up for the newsletter the first time, then joins when it closes', async () => {
    setup({ newsletterWasShown: false, subscribedEmail: null })
    fireEvent.click(screen.getByRole('button', { name: '+' }))

    fireEvent.click(startButton())

    expect(storeNewsletterWasShown).toHaveBeenCalled()
    expect(joinMission).not.toHaveBeenCalled()
    expect(await screen.findByText(/After signing up for our newsletter/)).toBeInTheDocument()
    expect((window as any).mootrack).toHaveBeenCalledWith(
      'loadForm',
      '9f818ce4-04d1-4f2e-bace-692f1608af91'
    )

    fireEvent.click(screen.getByRole('button', { name: 'CLOSE' }))

    expect(joinMission).toHaveBeenCalledWith(1)
  })

  it('skips the newsletter when already subscribed', () => {
    setup({ newsletterWasShown: false, subscribedEmail: 'me@example.com' })
    fireEvent.click(screen.getByRole('button', { name: '+' }))

    fireEvent.click(startButton())

    expect(storeNewsletterWasShown).not.toHaveBeenCalled()
    expect(joinMission).toHaveBeenCalledWith(1)
  })

  it('offers to send more spacecrafts on a mission already joined', () => {
    setup({ selectedMission: mission({ investInfo: buildInvestInfo({ totalStakeTLM: 20000 }) }) })

    expect(screen.getByRole('button', { name: 'Send additional spacecrafts' })).toBeInTheDocument()
    expect(screen.getByText('2.0')).toBeInTheDocument()
  })

  it('goes back to the mission on cancel', () => {
    setup()

    fireEvent.click(screen.getByRole('button', { name: 'CANCEL' }))

    expect(mockNavigate).toHaveBeenCalledWith('/missions/7')
  })
})
