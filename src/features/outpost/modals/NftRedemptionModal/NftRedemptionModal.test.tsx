import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useModalStore } from 'shared/store/modalStore'
import { useSessionStore } from 'shared/store/sessionStore'

import { NftRedemptionModal } from './NftRedemptionModal'

jest.mock('shared/util/config', () => ({ config: { DemoUserWaxAccount: 'demo.wam' } }))

jest.mock('@alien-worlds/uikit', () => ({
  Button: ({ children, onClick, disabled }) => (
    <button onClick={onClick} disabled={disabled}>
      {children}
    </button>
  ),
}))

jest.mock('@alien-worlds/icons', () => ({ ShardsIcon: () => null }))

jest.mock('features/syndicates/components/LoadingSpinner/LoadingSpinner', () => ({
  LoadingSpinner: () => <span>loading</span>,
}))

const mockUseWalletDetails = jest.fn()
jest.mock('graphql/hooks/useWalletDetails', () => ({
  useWalletDetails: (walletId: string) => mockUseWalletDetails(walletId),
}))

const withShards = (redeemable_points: number) => ({
  walletDetails: { userpoints_details: { redeemable_points } },
  loading: false,
})

const props = {
  isOpen: true,
  pointsRequired: 2500,
  nftCardModal: <span>nft card</span>,
  onClose: jest.fn(),
  redeemAction: jest.fn(),
}

describe('NftRedemptionModal', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    useSessionStore.setState({ walletId: 'player.wam', isDemoUser: false })
    mockUseWalletDetails.mockReturnValue(withShards(10000))
  })

  afterEach(() => {
    // Components are still mounted here (Testing Library unmounts after this hook).
    act(() => {
      useSessionStore.setState({ walletId: null, isDemoUser: false })
      useModalStore.getState().resetAllPrimaryModals()
    })
  })

  it("shows the NFT, the player's shards, the cost, and what's left after fusing", () => {
    render(<NftRedemptionModal {...props} />)

    expect(mockUseWalletDetails).toHaveBeenCalledWith('player.wam')
    expect(screen.getByText('nft card')).toBeInTheDocument()
    expect(screen.getByText('1,000.0')).toBeInTheDocument()
    expect(screen.getByText('250.0')).toBeInTheDocument()
    expect(screen.getByText('750.0')).toBeInTheDocument()
  })

  it('fuses when the player has enough shards', async () => {
    render(<NftRedemptionModal {...props} />)

    await userEvent.click(screen.getByRole('button', { name: 'Fuse Shards' }))
    expect(props.redeemAction).toHaveBeenCalled()
  })

  it('fuses when the player has exactly enough shards', () => {
    mockUseWalletDetails.mockReturnValue(withShards(2500))
    render(<NftRedemptionModal {...props} />)

    expect(screen.getByRole('button', { name: 'Fuse Shards' })).toBeEnabled()
  })

  it("can't fuse without enough shards", () => {
    mockUseWalletDetails.mockReturnValue(withShards(2499))
    render(<NftRedemptionModal {...props} />)

    expect(screen.getByRole('button', { name: 'Need more Shards' })).toBeDisabled()
  })

  it('asks a demo user to log in instead of fusing', async () => {
    useSessionStore.setState({ isDemoUser: true })
    render(<NftRedemptionModal {...props} />)

    await userEvent.click(screen.getByRole('button', { name: 'Fuse Shards' }))
    expect(useModalStore.getState().primaryModals.LoginModal).toBe(true)
    expect(props.redeemAction).not.toHaveBeenCalled()
  })

  it("waits for the player's shards to load", () => {
    mockUseWalletDetails.mockReturnValue({ walletDetails: null, loading: true })
    render(<NftRedemptionModal {...props} />)

    expect(screen.getByText('loading')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Fuse Shards' })).not.toBeInTheDocument()
  })

  it('closes', async () => {
    render(<NftRedemptionModal {...props} />)

    await userEvent.click(screen.getByRole('button', { name: 'Close' }))
    expect(props.onClose).toHaveBeenCalled()
  })
})
