import { render, screen } from '@testing-library/react'

import { UserPointProgressBar } from './UserPointProgressBar'

jest.mock('shared/components/UserLevelsBadges/UserLevelsBadges', () => ({
  UserLevelsBadge: ({ levelId }: { levelId: number }) => (
    <div data-testid="user-level-badge" data-level-id={levelId} />
  ),
  UserLevelsBadgeTitle: ({ levelId }: { levelId: number }) => (
    <div data-testid="user-level-badge-title" data-level-id={levelId} />
  ),
}))

describe('UserPointProgressBar', () => {
  it('renders the current and total points', () => {
    render(<UserPointProgressBar value={50} total={100} currentRank={3} nextRank={4} />)

    expect(screen.getByText('/')).toBeInTheDocument()
    expect(screen.getAllByTestId('user-level-badge-title').length).toBeGreaterThan(0)
  })

  it('shows the next rank label when a next rank exists below 11', () => {
    render(<UserPointProgressBar value={50} total={100} currentRank={3} nextRank={4} />)
    expect(screen.getByText('Next:')).toBeInTheDocument()
    expect(screen.queryByText('Well done!')).not.toBeInTheDocument()
  })

  it('shows "Well done!" when there is no next rank', () => {
    render(<UserPointProgressBar value={100} total={100} currentRank={10} nextRank={undefined} />)
    expect(screen.getByText('Well done!')).toBeInTheDocument()
    expect(screen.queryByText('Next:')).not.toBeInTheDocument()
  })

  it('renders the current-rank badge with the correct levelId', () => {
    render(<UserPointProgressBar value={50} total={100} currentRank={5} nextRank={6} />)
    const badges = screen.getAllByTestId('user-level-badge')
    expect(badges.some((b) => b.getAttribute('data-level-id') === '5')).toBe(true)
  })
})
