import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { ProfileInfo } from './ProfileInfo'

const mockSetPrimaryModalActive = jest.fn()
const mockSetOutPostModalsActive = jest.fn()
const mockShowProfileInfoPage = jest.fn()
const mockUseAppState = jest.fn()

jest.mock('store', () => ({
  useAppState: () => mockUseAppState(),
  useActions: () => ({
    modal: { setPrimaryModalActive: mockSetPrimaryModalActive },
    main: {
      setOutPostModalsActive: mockSetOutPostModalsActive,
      showProfileInfoPage: mockShowProfileInfoPage,
    },
  }),
}))

const mockUseWalletDetails = jest.fn()
jest.mock('graphql/hooks/useWalletDetails', () => ({
  useWalletDetails: (...args: unknown[]) => mockUseWalletDetails(...args),
}))

const mockUseLevelNftRewards = jest.fn()
jest.mock('features/outpost/hooks/queries/useLevelNftRewards', () => ({
  useLevelNftRewards: () => mockUseLevelNftRewards(),
}))

const mockRedeemLevelOfferAction = jest.fn()
const mockUseRedeemLevelNftOffer = jest.fn()
jest.mock('features/outpost/hooks/mutations/useRedeemLevelNftOffer', () => ({
  useRedeemLevelNftOffer: () => mockUseRedeemLevelNftOffer(),
}))

jest.mock('features/inventory/utils/NFTCardHelper', () => ({
  NFTCardSingleCardPrep: () => ({ type: { name: 'Land' }, rarity: { name: 'common' } }),
}))
jest.mock('features/inventory/utils/NFTCardOverlayRender', () => ({
  NFTCardOverlayRender: () => <div data-testid="nft-overlay-render" />,
  NFTCardBottomPanelRender: () => <div data-testid="nft-bottom-panel-render" />,
  NFTCardDetailPanelRender: () => <div data-testid="nft-detail-panel-render" />,
  NFTCardTopRightPanelRender: () => <div data-testid="nft-top-right-panel-render" />,
}))

jest.mock('features/outpost/modals/NftZoomModal/NftZoomModal', () => ({
  NftZoomModal: () => <div data-testid="nft-zoom-modal" />,
}))

jest.mock('features/profile/components/UserPointProgressBar', () => ({
  UserPointProgressBar: () => <div data-testid="user-point-progress-bar" />,
}))

jest.mock('features/syndicates/components/LoadingSpinner/LoadingSpinner', () => ({
  LoadingSpinner: () => <div data-testid="loading-spinner" />,
}))

const baseAppState = { wax: { walletId: 'wallet.wam', isDemoUser: false } }

describe('ProfileInfo', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  it('renders a loading spinner while wallet details are loading', () => {
    mockUseAppState.mockReturnValue(baseAppState)
    mockUseWalletDetails.mockReturnValue({ walletDetails: null, loading: true })
    mockUseLevelNftRewards.mockReturnValue({ currentLevelReward: null, nextLevelReward: null })
    mockUseRedeemLevelNftOffer.mockReturnValue({
      mutate: mockRedeemLevelOfferAction,
      isLoading: false,
    })

    render(<ProfileInfo />)
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument()
  })

  it('calls showProfileInfoPage on mount', () => {
    mockUseAppState.mockReturnValue(baseAppState)
    mockUseWalletDetails.mockReturnValue({
      walletDetails: { userpoints_details: { total_points: 10, top_level: 3 } },
      loading: false,
    })
    mockUseLevelNftRewards.mockReturnValue({
      currentLevelReward: { level: 3, required: 100 },
      nextLevelReward: { level: 4, required: 200, asset: { data: {} } },
    })
    mockUseRedeemLevelNftOffer.mockReturnValue({
      mutate: mockRedeemLevelOfferAction,
      isLoading: false,
    })

    render(<ProfileInfo />)
    expect(mockShowProfileInfoPage).toHaveBeenCalledTimes(1)
  })

  it('shows the "EXP to go" button when the user has not reached the next level requirement', () => {
    mockUseAppState.mockReturnValue(baseAppState)
    mockUseWalletDetails.mockReturnValue({
      walletDetails: { userpoints_details: { total_points: 10, top_level: 3 } },
      loading: false,
    })
    mockUseLevelNftRewards.mockReturnValue({
      currentLevelReward: { level: 3, required: 100 },
      nextLevelReward: { level: 4, required: 200, asset: { data: {} } },
    })
    mockUseRedeemLevelNftOffer.mockReturnValue({
      mutate: mockRedeemLevelOfferAction,
      isLoading: false,
    })

    render(<ProfileInfo />)
    expect(screen.getByText(/EXP to go/)).toBeInTheDocument()
  })

  it('shows the claim button and redeems the offer when the user meets the requirement', async () => {
    mockUseAppState.mockReturnValue(baseAppState)
    mockUseWalletDetails.mockReturnValue({
      walletDetails: { userpoints_details: { total_points: 250, top_level: 3 } },
      loading: false,
    })
    mockUseLevelNftRewards.mockReturnValue({
      currentLevelReward: { level: 3, required: 100 },
      nextLevelReward: { level: 4, required: 200, id: 'offer-1', asset: { data: {} } },
    })
    mockUseRedeemLevelNftOffer.mockReturnValue({
      mutate: mockRedeemLevelOfferAction,
      isLoading: false,
    })

    render(<ProfileInfo />)

    const claimButton = screen.getByText('Claim Rank & Reward')
    await userEvent.click(claimButton)

    expect(mockRedeemLevelOfferAction).toHaveBeenCalledWith({ levelOfferId: 'offer-1' })
  })

  it('opens the login modal instead of redeeming for demo users', async () => {
    mockUseAppState.mockReturnValue({ wax: { walletId: 'wallet.wam', isDemoUser: true } })
    mockUseWalletDetails.mockReturnValue({
      walletDetails: { userpoints_details: { total_points: 250, top_level: 3 } },
      loading: false,
    })
    mockUseLevelNftRewards.mockReturnValue({
      currentLevelReward: { level: 3, required: 100 },
      nextLevelReward: { level: 4, required: 200, id: 'offer-1', asset: { data: {} } },
    })
    mockUseRedeemLevelNftOffer.mockReturnValue({
      mutate: mockRedeemLevelOfferAction,
      isLoading: false,
    })

    render(<ProfileInfo />)

    await userEvent.click(screen.getByText('Claim Rank & Reward'))

    expect(mockSetPrimaryModalActive).toHaveBeenCalledWith({
      modalName: 'LoginModal',
      value: true,
    })
    expect(mockRedeemLevelOfferAction).not.toHaveBeenCalled()
  })

  it('shows a claiming button while the redeem mutation is in flight', () => {
    mockUseAppState.mockReturnValue(baseAppState)
    mockUseWalletDetails.mockReturnValue({
      walletDetails: { userpoints_details: { total_points: 250, top_level: 3 } },
      loading: false,
    })
    mockUseLevelNftRewards.mockReturnValue({
      currentLevelReward: { level: 3, required: 100 },
      nextLevelReward: { level: 4, required: 200, id: 'offer-1', asset: { data: {} } },
    })
    mockUseRedeemLevelNftOffer.mockReturnValue({
      mutate: mockRedeemLevelOfferAction,
      isLoading: true,
    })

    render(<ProfileInfo />)
    expect(screen.queryByText('Claim Rank & Reward')).not.toBeInTheDocument()
    expect(screen.queryByText(/EXP to go/)).not.toBeInTheDocument()
    expect(screen.getByRole('button')).toBeDisabled()
  })
})
