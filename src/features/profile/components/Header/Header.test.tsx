import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

import { CurrentBadge, Header } from './Header'

const mockUseAppState = jest.fn()
const mockInitializeOrReloadNftsToClaim = jest.fn()
const mockSetSecondaryModalActive = jest.fn()
jest.mock('store', () => ({
  useAppState: () => mockUseAppState(),
  useActions: () => ({
    wax: { initializeOrReloadNftsToClaim: mockInitializeOrReloadNftsToClaim },
    modal: { setSecondaryModalActive: mockSetSecondaryModalActive },
  }),
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

  it('initializes nfts-to-claim on mount', () => {
    mockUseAppState.mockReturnValue({
      wax: { nftsToClaimTemplates: [], isDemoUser: false, walletId: 'wallet.wam' },
    })

    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>
    )

    expect(mockInitializeOrReloadNftsToClaim).toHaveBeenCalledTimes(1)
  })

  it('does not render the claim shards button when there are no nfts to claim', () => {
    mockUseAppState.mockReturnValue({
      wax: { nftsToClaimTemplates: [], isDemoUser: false, walletId: 'wallet.wam' },
    })

    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>
    )

    expect(screen.queryByText('Claim Shards')).not.toBeInTheDocument()
  })

  it('renders the claim shards button and opens the modal on click when nfts are claimable', async () => {
    mockUseAppState.mockReturnValue({
      wax: { nftsToClaimTemplates: [{ id: 1 }], isDemoUser: false, walletId: 'wallet.wam' },
    })

    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>
    )

    const claimButton = screen.getByText('Claim Shards')
    expect(claimButton).toBeInTheDocument()
    claimButton.click()

    expect(mockSetSecondaryModalActive).toHaveBeenCalledWith({
      modalName: 'OldNFTClaimModal',
      value: true,
    })
  })

  it('shows the demo account label for demo users', () => {
    mockUseAppState.mockReturnValue({
      wax: { nftsToClaimTemplates: [], isDemoUser: true, walletId: 'wallet.wam' },
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
