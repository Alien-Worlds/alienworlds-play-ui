import { render, screen } from '@testing-library/react'

import { UserInfo } from './UserInfo'

jest.mock('shared/components/topbar/PlayerAvatar', () => ({
  PlayerAvatar: () => <div data-testid="player-avatar" />,
}))

jest.mock('shared/components/topbar/Tag', () => ({
  Tag: () => <div data-testid="tag" />,
}))

jest.mock('shared/components/UserLevelsBadges/UserLevelsBadges', () => ({
  UserLevelsBadgeTitle: ({ levelId }: { levelId: number }) => (
    <div data-testid="user-level-badge-title" data-level-id={levelId} />
  ),
}))

describe('UserInfo', () => {
  it('renders the wallet id and avatar by default', () => {
    render(<UserInfo walletId="wallet.wam" isDemoUser={false} />)

    expect(screen.getByText('wallet.wam')).toBeInTheDocument()
    expect(screen.getByTestId('player-avatar')).toBeInTheDocument()
  })

  it('shows the demo account tag when isDemoUser is true', () => {
    render(<UserInfo walletId="wallet.wam" isDemoUser />)
    expect(screen.getByText('Demo Account')).toBeInTheDocument()
    expect(screen.queryByText('wallet.wam')).not.toBeInTheDocument()
  })

  it('hides the avatar when showAvatar is false', () => {
    render(<UserInfo walletId="wallet.wam" isDemoUser={false} showAvatar={false} />)
    expect(screen.queryByTestId('player-avatar')).not.toBeInTheDocument()
  })

  it('renders the level badge only when a level is provided and showLevel is true', () => {
    const { rerender } = render(<UserInfo walletId="wallet.wam" isDemoUser={false} level={3} />)
    expect(screen.getByTestId('user-level-badge-title')).toHaveAttribute('data-level-id', '3')
    expect(screen.getByText('Rank:')).toBeInTheDocument()

    rerender(<UserInfo walletId="wallet.wam" isDemoUser={false} />)
    expect(screen.queryByTestId('user-level-badge-title')).not.toBeInTheDocument()

    rerender(<UserInfo walletId="wallet.wam" isDemoUser={false} level={3} showLevel={false} />)
    expect(screen.queryByTestId('user-level-badge-title')).not.toBeInTheDocument()
  })
})
