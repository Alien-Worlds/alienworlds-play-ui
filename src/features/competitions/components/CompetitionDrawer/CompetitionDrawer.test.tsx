import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

const mockCopyToClipboard = jest.fn()
jest.mock('react-use', () => ({
  useCopyToClipboard: () => [{}, mockCopyToClipboard],
}))

const mockToastMessage = jest.fn()
jest.mock('shared/util/toast', () => ({
  toastMessage: (...args: any[]) => mockToastMessage(...args),
}))

let mockBreakpoint = 'base'
jest.mock('@alien-worlds/uikit', () => ({
  ...jest.requireActual('@alien-worlds/uikit'),
  useBreakpointValue: (values: Record<string, unknown>) => values[mockBreakpoint],
}))

let mockIsDemoUser = false
jest.mock('shared/store/sessionStore', () => ({
  useSessionStore: (selector: (state: unknown) => unknown) =>
    selector({ isDemoUser: mockIsDemoUser, walletId: 'alice.wam' }),
}))

import { CompetitionDrawer } from './CompetitionDrawer'
import { makeTournament } from '../../testUtils/makeTournament'

const rewardingTournament = () =>
  makeTournament({
    state: 'rewarding',
    players: [
      {
        player: 'alice.wam',
        claimed: false,
        reward_perc_x_100: 0,
        shards_perc_x_100: 0,
        live_score: 0,
      },
    ],
  })

describe('CompetitionDrawer', () => {
  let openSpy: jest.SpyInstance

  beforeEach(() => {
    jest.clearAllMocks()
    mockIsDemoUser = false
    mockBreakpoint = 'base'
    openSpy = jest.spyOn(window, 'open').mockImplementation(() => null)
  })

  afterEach(() => {
    openSpy.mockRestore()
  })

  it('renders nothing when closed', () => {
    render(<CompetitionDrawer isOpen={false} onClose={jest.fn()} tournament={makeTournament()} />)
    expect(screen.queryByText('Trilium Rush')).not.toBeInTheDocument()
  })

  it('renders nothing when open without a tournament', () => {
    render(<CompetitionDrawer isOpen onClose={jest.fn()} tournament={null} />)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('renders the tournament details with times in UTC', () => {
    render(<CompetitionDrawer isOpen onClose={jest.fn()} tournament={makeTournament()} />)

    expect(screen.getByRole('dialog', { name: 'Trilium Rush' })).toBeInTheDocument()
    expect(screen.getByText('Competition ID: 42')).toBeInTheDocument()
    expect(screen.getByText('05.03.2026')).toBeInTheDocument()
    expect(screen.getByText('10:00:00 UTC')).toBeInTheDocument()
    expect(screen.getByText('12.03.2026')).toBeInTheDocument()
    expect(screen.getByText('18:30:00 UTC')).toBeInTheDocument()
    expect(screen.getByText('1000 TLM')).toBeInTheDocument()
    expect(
      screen.getByText('Mine as much Trilium as you can before the clock runs out.')
    ).toBeInTheDocument()
  })

  it('calls onClose when the close button is clicked', async () => {
    const onClose = jest.fn()
    render(<CompetitionDrawer isOpen onClose={onClose} tournament={makeTournament()} />)

    await userEvent.click(screen.getByRole('button', { name: 'Close' }))

    expect(onClose).toHaveBeenCalled()
  })

  it('copies the tournament url and shows a toast', async () => {
    render(<CompetitionDrawer isOpen onClose={jest.fn()} tournament={makeTournament()} />)

    await userEvent.click(screen.getByRole('button', { name: 'Copy competition link' }))

    expect(mockCopyToClipboard).toHaveBeenCalledWith('https://example.com/competition/42')
    expect(mockToastMessage).toHaveBeenCalledWith('Url copied to Clipboard!')
  })

  it('falls back to the competitions repo url when the tournament has none', async () => {
    render(
      <CompetitionDrawer isOpen onClose={jest.fn()} tournament={makeTournament({ url: null })} />
    )

    await userEvent.click(screen.getByRole('button', { name: 'Copy competition link' }))

    expect(mockCopyToClipboard).toHaveBeenCalledWith(
      'https://github.com/Alien-Worlds/the-alien-worlds-competitions'
    )
  })

  it('opens the tournament url when Visit is clicked', async () => {
    render(<CompetitionDrawer isOpen onClose={jest.fn()} tournament={makeTournament()} />)

    await userEvent.click(screen.getByRole('button', { name: 'Visit' }))

    expect(openSpy).toHaveBeenCalledWith('https://example.com/competition/42', '_blank')
  })

  it('offers Claim rewards to a player with an unclaimed reward', async () => {
    const onClaimReward = jest.fn()
    const tournament = rewardingTournament()
    render(
      <CompetitionDrawer
        isOpen
        onClose={jest.fn()}
        tournament={tournament}
        onClaimReward={onClaimReward}
        walletId="alice.wam"
      />
    )

    await userEvent.click(screen.getByRole('button', { name: 'Claim rewards' }))

    expect(onClaimReward).toHaveBeenCalledWith(tournament)
  })

  it('hides Claim rewards for a wallet without an unclaimed reward', () => {
    render(
      <CompetitionDrawer
        isOpen
        onClose={jest.fn()}
        tournament={rewardingTournament()}
        onClaimReward={jest.fn()}
        walletId="bob.wam"
      />
    )

    expect(screen.queryByRole('button', { name: 'Claim rewards' })).not.toBeInTheDocument()
  })

  it('hides Claim rewards when no claim handler is provided', () => {
    render(
      <CompetitionDrawer
        isOpen
        onClose={jest.fn()}
        tournament={rewardingTournament()}
        walletId="alice.wam"
      />
    )

    expect(screen.queryByRole('button', { name: 'Claim rewards' })).not.toBeInTheDocument()
  })

  it.each([
    ['base', '162px'],
    ['sm', '126px'],
  ])('offsets the panel below the demo banner for demo users at %s', (breakpoint, top) => {
    mockIsDemoUser = true
    mockBreakpoint = breakpoint
    render(<CompetitionDrawer isOpen onClose={jest.fn()} tournament={makeTournament()} />)

    expect(screen.getByTestId('competition-drawer-panel')).toHaveStyle({ top })
  })

  it('sits directly below the top bar for regular users', () => {
    render(<CompetitionDrawer isOpen onClose={jest.fn()} tournament={makeTournament()} />)

    expect(screen.getByTestId('competition-drawer-panel')).toHaveStyle({ top: '90px' })
  })
})
