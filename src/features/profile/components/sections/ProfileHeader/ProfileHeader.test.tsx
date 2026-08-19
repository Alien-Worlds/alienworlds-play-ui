import { render, screen } from '@testing-library/react'

import { ProfileHeader } from './ProfileHeader'

const mockUseProfileContext = jest.fn()
jest.mock('../../../context/ProfileContext', () => ({
  useProfileContext: () => mockUseProfileContext(),
}))

jest.mock('shared/components/topbar/PlayerAvatar', () => ({
  PlayerAvatar: () => <div data-testid="player-avatar" />,
}))
jest.mock('shared/components/topbar/Tag', () => ({
  Tag: () => <div data-testid="tag" />,
}))
jest.mock('shared/components/UserLevelsBadges/UserLevelsBadges', () => ({
  UserLevelsBadgeTitle: () => <div data-testid="user-level-badge-title" />,
  BadgesMap: () => <div data-testid="badges-map" />,
}))

describe('ProfileHeader', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  it('renders nothing when profileData is not yet available', () => {
    mockUseProfileContext.mockReturnValue({ state: { profileData: null } })
    const { container } = render(<ProfileHeader />)
    expect(container).toBeEmptyDOMElement()
  })

  it('renders user info and the badge by default', () => {
    mockUseProfileContext.mockReturnValue({
      state: { profileData: { walletId: 'wallet.wam', isDemoUser: false, currentLevel: 2 } },
    })

    render(<ProfileHeader />)

    expect(screen.getByText('wallet.wam')).toBeInTheDocument()
    expect(screen.getByTestId('badges-map')).toBeInTheDocument()
  })

  it('hides the badge when showBadge is false', () => {
    mockUseProfileContext.mockReturnValue({
      state: { profileData: { walletId: 'wallet.wam', isDemoUser: false, currentLevel: 2 } },
    })

    render(<ProfileHeader showBadge={false} />)

    expect(screen.queryByTestId('badges-map')).not.toBeInTheDocument()
  })
})
