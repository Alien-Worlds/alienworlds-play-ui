import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

import { CurrentBadge, Header } from './Header'

const mockUseAppState = jest.fn()
jest.mock('store', () => ({
  useAppState: () => mockUseAppState(),
  useActions: () => ({}),
}))

jest.mock('features/outpost/hooks/queries/useLevelNftRewards', () => ({
  useLevelNftRewards: () => ({ currentLevelReward: { level: 3 } }),
}))

jest.mock('store/main/actions', () => ({
  toastMessage: jest.fn(),
}))

jest.mock('react-use', () => ({
  useCopyToClipboard: () => [{}, jest.fn()],
}))

jest.mock('shared/components/topbar/PlayerAvatar', () => ({
  PlayerAvatar: () => <div data-testid="player-avatar" />,
}))
jest.mock('shared/components/topbar/Tag', () => ({
  Tag: () => <div data-testid="tag" />,
}))
jest.mock('shared/components/UserLevelsBadges/UserLevelsBadges', () => ({
  UserLevelsBadge: () => <div data-testid="user-level-badge" />,
  UserLevelsBadgeTitle: () => <div data-testid="user-level-badge-title" />,
  BadgesMap: () => <div data-testid="badges-map" />,
}))

describe('Header', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  it('shows the wallet id for a regular user', () => {
    mockUseAppState.mockReturnValue({
      wax: { isDemoUser: false, walletId: 'wallet.wam' },
    })

    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>
    )

    expect(screen.getAllByText('wallet.wam').length).toBeGreaterThan(0)
  })

  it('shows the demo account label for demo users', () => {
    mockUseAppState.mockReturnValue({
      wax: { isDemoUser: true, walletId: 'wallet.wam' },
    })

    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>
    )

    expect(screen.getAllByText('demo.wam').length).toBeGreaterThan(0)
  })
})

describe('CurrentBadge', () => {
  it('renders the level badge and title', () => {
    render(<CurrentBadge />)
    expect(screen.getByTestId('user-level-badge')).toBeInTheDocument()
    expect(screen.getByTestId('user-level-badge-title')).toBeInTheDocument()
  })
})
