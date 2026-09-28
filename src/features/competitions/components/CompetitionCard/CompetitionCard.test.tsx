import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TournamentStatus } from 'features/competitions/types/competitionTypes'

import { CompetitionCard } from './CompetitionCard'
import { makeTournament } from '../../testUtils/makeTournament'

describe('CompetitionCard', () => {
  let openSpy: jest.SpyInstance

  beforeEach(() => {
    openSpy = jest.spyOn(window, 'open').mockImplementation(() => null)
  })

  afterEach(() => {
    openSpy.mockRestore()
  })

  it('renders the tournament details', () => {
    render(
      <CompetitionCard
        tournament={makeTournament()}
        onCompetitionVisit={jest.fn()}
        status={TournamentStatus.UPCOMING}
      />
    )

    expect(screen.getByText('Trilium Rush')).toBeInTheDocument()
    expect(screen.getByText('Competition ID: 42')).toBeInTheDocument()
    expect(screen.getByText('2026.03.05 - 2026.03.12')).toBeInTheDocument()
    expect(screen.getByText('1000 TLM')).toBeInTheDocument()
    expect(screen.getByText('500')).toBeInTheDocument()
    expect(screen.getByText('17 / 100')).toBeInTheDocument()
  })

  it('falls back to the default image when the tournament has none', () => {
    render(
      <CompetitionCard
        tournament={makeTournament({ image: null })}
        onCompetitionVisit={jest.fn()}
        status={TournamentStatus.UPCOMING}
      />
    )

    expect(screen.getByRole('img', { name: 'Trilium Rush' })).toHaveAttribute(
      'src',
      'images/tournament/card-artifact-1.png'
    )
  })

  it('truncates long descriptions', () => {
    render(
      <CompetitionCard
        tournament={makeTournament({ description: 'x'.repeat(150) })}
        onCompetitionVisit={jest.fn()}
        status={TournamentStatus.UPCOMING}
      />
    )

    expect(screen.getByText(`${'x'.repeat(97)}...`)).toBeInTheDocument()
  })

  it.each([TournamentStatus.UPCOMING, TournamentStatus.PLAYING])(
    'shows View details and Visit for %s tournaments',
    async (status) => {
      const onCompetitionVisit = jest.fn()
      const tournament = makeTournament()
      render(
        <CompetitionCard
          tournament={tournament}
          onCompetitionVisit={onCompetitionVisit}
          status={status}
        />
      )

      await userEvent.click(screen.getByRole('button', { name: 'View details' }))
      expect(onCompetitionVisit).toHaveBeenCalledWith(tournament)

      await userEvent.click(screen.getByRole('button', { name: 'Visit' }))
      expect(openSpy).toHaveBeenCalledWith('https://example.com/competition/42', '_blank')
    }
  )

  it('does not open a window when the tournament has no url', async () => {
    render(
      <CompetitionCard
        tournament={makeTournament({ url: null })}
        onCompetitionVisit={jest.fn()}
        status={TournamentStatus.PLAYING}
      />
    )

    await userEvent.click(screen.getByRole('button', { name: 'Visit' }))
    expect(openSpy).not.toHaveBeenCalled()
  })

  it.each([TournamentStatus.PROCESSING, TournamentStatus.CLAIMABLE, TournamentStatus.COMPLETED])(
    'shows only View details for %s tournaments',
    (status) => {
      render(
        <CompetitionCard
          tournament={makeTournament()}
          onCompetitionVisit={jest.fn()}
          status={status}
        />
      )

      expect(screen.getByRole('button', { name: 'View details' })).toBeInTheDocument()
      expect(screen.queryByRole('button', { name: 'Visit' })).not.toBeInTheDocument()
    }
  )

  it.each([
    [TournamentStatus.UPCOMING, '1'],
    [TournamentStatus.PROCESSING, '0.7'],
    [TournamentStatus.COMPLETED, '0.5'],
  ])('renders %s cards with opacity %s', (status, opacity) => {
    render(
      <CompetitionCard
        tournament={makeTournament()}
        onCompetitionVisit={jest.fn()}
        status={status}
      />
    )

    expect(screen.getByTestId('competition-card')).toHaveStyle({ opacity })
  })
})
