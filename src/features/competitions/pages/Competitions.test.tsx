import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { Competitions } from './Competitions'
import { makeTournament } from '../testUtils/makeTournament'

const emptyTournaments = () => ({
  upcoming: [],
  live: [],
  processing: [],
  getRewards: [],
  completed: [],
})

let mockCompetitions: any
const mockRefetch = jest.fn()
const mockUseCompetitions = jest.fn()
jest.mock('graphql/hooks/useCompetitions', () => ({
  useCompetitions: (args: unknown) => {
    mockUseCompetitions(args)
    return { ...mockCompetitions, refetch: mockRefetch }
  },
}))

const mockClaimTournamentReward = jest.fn()
jest.mock('features/competitions/store/competitionsStore', () => ({
  useCompetitionsStore: (selector: (state: unknown) => unknown) =>
    selector({ claimTournamentReward: mockClaimTournamentReward }),
}))

jest.mock('shared/store/sessionStore', () => ({
  useSessionStore: (selector: (state: unknown) => unknown) =>
    selector({ isDemoUser: false, walletId: 'alice.wam' }),
}))

jest.mock('features/syndicates/components/LoadingSpinner', () => ({
  LoadingSpinner: () => <div data-testid="loading-spinner" />,
}))

jest.mock('features/competitions/components/CompetitionDrawer', () => ({
  CompetitionDrawer: ({ isOpen, tournament, onClose, onClaimReward }: any) =>
    isOpen ? (
      <div data-testid="competition-drawer">
        {tournament?.title}
        <button onClick={onClose}>Close drawer</button>
        <button onClick={() => onClaimReward(tournament)}>Claim</button>
      </div>
    ) : null,
}))

describe('Competitions page', () => {
  let logSpy: jest.SpyInstance

  beforeEach(() => {
    jest.clearAllMocks()
    logSpy = jest.spyOn(console, 'log').mockImplementation(() => undefined)
    mockCompetitions = { tournaments: emptyTournaments(), loading: false, error: undefined }
  })

  afterEach(() => {
    logSpy.mockRestore()
  })

  it('queries competitions for the current wallet', () => {
    render(<Competitions />)
    expect(mockUseCompetitions).toHaveBeenCalledWith({ waxId: 'alice.wam' })
  })

  it('shows a loading spinner while loading', () => {
    mockCompetitions = { ...mockCompetitions, loading: true }
    render(<Competitions />)

    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument()
    expect(screen.queryByText('Competitions')).not.toBeInTheDocument()
  })

  it('shows the query error', () => {
    mockCompetitions = { ...mockCompetitions, error: { message: 'boom' } }
    render(<Competitions />)

    expect(screen.getByRole('alert')).toHaveTextContent('Competitions query error: boom')
  })

  it('renders all five tabs with Upcoming selected by default', () => {
    render(<Competitions />)

    const tabs = screen.getAllByRole('tab')
    expect(tabs.map((tab) => tab.textContent)).toEqual([
      'Upcoming',
      'Live',
      'Processing',
      'Get Rewards',
      'Completed',
    ])
    expect(screen.getByRole('tab', { name: 'Upcoming' })).toHaveAttribute('aria-selected', 'true')
  })

  it('shows each tab its own tournaments', async () => {
    mockCompetitions.tournaments = {
      ...emptyTournaments(),
      upcoming: [makeTournament({ id: 1, title: 'Upcoming Cup' })],
      live: [makeTournament({ id: 2, title: 'Live Cup' })],
      completed: [makeTournament({ id: 3, title: 'Completed Cup' })],
    }
    render(<Competitions />)

    expect(screen.getByText('Upcoming Cup')).toBeInTheDocument()
    expect(screen.queryByText('Live Cup')).not.toBeInTheDocument()

    await userEvent.click(screen.getByRole('tab', { name: 'Live' }))
    expect(screen.getByText('Live Cup')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Visit' })).toBeInTheDocument()

    await userEvent.click(screen.getByRole('tab', { name: 'Completed' }))
    expect(screen.getByText('Completed Cup')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Visit' })).not.toBeInTheDocument()
  })

  it('opens the drawer for a card and clears it on close', async () => {
    mockCompetitions.tournaments = {
      ...emptyTournaments(),
      upcoming: [makeTournament({ title: 'Upcoming Cup' })],
    }
    render(<Competitions />)

    await userEvent.click(screen.getByRole('button', { name: 'View details' }))
    expect(within(screen.getByTestId('competition-drawer')).getByText('Upcoming Cup')).toBeTruthy()

    await userEvent.click(screen.getByRole('button', { name: 'Close drawer' }))
    expect(screen.queryByTestId('competition-drawer')).not.toBeInTheDocument()
  })

  it('refetches after a successful reward claim', async () => {
    mockClaimTournamentReward.mockResolvedValue(true)
    mockCompetitions.tournaments = {
      ...emptyTournaments(),
      upcoming: [makeTournament({ id: 7 })],
    }
    render(<Competitions />)

    await userEvent.click(screen.getByRole('button', { name: 'View details' }))
    await userEvent.click(screen.getByRole('button', { name: 'Claim' }))

    expect(mockClaimTournamentReward).toHaveBeenCalledWith(7)
    await waitFor(() => expect(mockRefetch).toHaveBeenCalled())
  })

  it('does not refetch when the claim fails', async () => {
    mockClaimTournamentReward.mockResolvedValue(false)
    mockCompetitions.tournaments = {
      ...emptyTournaments(),
      upcoming: [makeTournament({ id: 7 })],
    }
    render(<Competitions />)

    await userEvent.click(screen.getByRole('button', { name: 'View details' }))
    await userEvent.click(screen.getByRole('button', { name: 'Claim' }))

    await waitFor(() => expect(mockClaimTournamentReward).toHaveBeenCalled())
    expect(mockRefetch).not.toHaveBeenCalled()
  })
})
