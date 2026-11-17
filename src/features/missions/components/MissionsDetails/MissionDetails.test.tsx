import { fireEvent, screen } from '@testing-library/react'
import { buildInvestInfo, buildMission, buildPinata } from 'features/missions/testUtils/fixtures'
import { mockStore, renderMissions } from 'features/missions/testUtils/mockStore'
import { MissionRarity, MissionStatus, MissionType } from 'features/missions/types/missionsTypes'
import { useModalStore } from 'shared/store/modalStore'
import { PagePath } from 'store/main/types'

import { MissionDetails } from './MissionDetails'

jest.mock('store', () => jest.requireActual('features/missions/testUtils/mockStore').storeMock)
jest.mock(
  '@alien-worlds/uikit',
  () => jest.requireActual('features/missions/testUtils/mocks').uikitMock
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

const selectMission = jest.fn()

const setup = ({
  status = MissionStatus.Boarding,
  investInfo = undefined,
  userWallet = { accounts: [{ address: '0xabc' }] },
  selectedMission = buildMission({
    id: '7',
    status,
    investInfo,
    attributes: {
      name: 'Courier Run',
      missionType: MissionType.Courier,
      description: 'Deliver the supplies',
      reward: 1000000,
      totalShips: 10,
    },
    pinataNft: buildPinata({ rarity: MissionRarity.Legendary, image: 'https://nft/legend.png' }),
  }),
}: Record<string, any> = {}) => {
  mockStore({
    state: { web3: { userWallet }, missions: { selectedMission }, main: { runtimeInSeconds: 0 } },
    actions: { missions: { selectMission } },
  })
  window.scrollTo = jest.fn()
  return renderMissions(<MissionDetails />, { at: '/missions/7', path: PagePath.MissionDetails })
}

const actionButton = () => screen.getAllByRole('button')[1]

beforeEach(() => {
  jest.clearAllMocks()
})

describe('MissionDetails', () => {
  it('selects the mission from the route and closes the main drawer', () => {
    useModalStore.setState({ isMainDrawerOpen: true })
    setup()

    expect(selectMission).toHaveBeenCalledWith('7')
    expect(useModalStore.getState().isMainDrawerOpen).toBe(false)
  })

  it('renders nothing until the mission is selected', () => {
    setup({ selectedMission: null })

    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('shows the mission, its reward per spacecraft and NFT', () => {
    setup()

    expect(screen.getByText('Courier Run')).toBeInTheDocument()
    expect(screen.getByText('Deliver the supplies')).toBeInTheDocument()
    expect(screen.getByText('10 TLM')).toBeInTheDocument()
    expect(screen.getAllByText('Legendary').length).toBeGreaterThan(0)
    // Chakra shows the fallback until the image loads, which it never does in jsdom.
    expect(screen.getByAltText('Mission NFT reward')).toBeInTheDocument()
  })

  it('shows the countdown for the mission', () => {
    setup()

    expect(screen.getAllByText('Starting in:').length).toBeGreaterThan(0)
    expect(screen.getAllByText('ID: 7').length).toBeGreaterThan(0)
  })

  it('joins a boarding mission', () => {
    setup()

    expect(actionButton()).toHaveTextContent('Join Mission')
    fireEvent.click(actionButton())

    expect(mockNavigate).toHaveBeenCalledWith('/missions/7/join')
  })

  it('offers to send more spacecrafts on a joined boarding mission', () => {
    setup({ investInfo: buildInvestInfo({ totalStakeTLM: 20000 }) })

    expect(actionButton()).toHaveTextContent('Send more spacecrafts')
    expect(screen.getByText('Trilium locked on this Mission')).toBeInTheDocument()
  })

  it.each([
    [MissionStatus.Soon, 'Waiting to board...'],
    [MissionStatus.Departed, 'Mission departed'],
    [MissionStatus.Completed, 'Mission has completed'],
  ])('disables joining a %s mission', (status, label) => {
    setup({ status })

    expect(actionButton()).toHaveTextContent(label)
    expect(actionButton()).toBeDisabled()
  })

  it('disables joining without a BSC wallet', () => {
    setup({ userWallet: null })

    expect(actionButton()).toBeDisabled()
  })

  it('goes back to the missions centre', () => {
    setup()

    fireEvent.click(screen.getAllByRole('button', { name: 'Back to Missions' })[0])

    expect(mockNavigate).toHaveBeenCalledWith('/missions')
  })
})
