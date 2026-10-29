import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useModalStore } from 'shared/store/modalStore'
import { useSessionStore } from 'shared/store/sessionStore'

import { Outpost } from './Outpost'

jest.mock('shared/util/config', () => ({ config: { DemoUserWaxAccount: 'demo.wam' } }))

jest.mock('@alien-worlds/icons', () => ({ ShardsIcon: () => null, OutpostIcon: () => null }))

jest.mock('features/syndicates/components/LoadingSpinner/LoadingSpinner', () => ({
  LoadingSpinner: () => <span>loading</span>,
}))

const mockUseWalletDetails = jest.fn()
jest.mock('graphql/hooks/useWalletDetails', () => ({
  useWalletDetails: (walletId: string) => mockUseWalletDetails(walletId),
}))

const mockRedeemAWNftOffer = jest.fn()
jest.mock('features/outpost/hooks/mutations/useRedeemAWNftOffer', () => ({
  useRedeemAWNftOffer: () => ({ mutate: mockRedeemAWNftOffer }),
}))

const mockRedeemCommunityNftOffer = jest.fn()
jest.mock('features/outpost/hooks/mutations/useRedeemCommunityNftOffer', () => ({
  useRedeemCommunityNftOffer: () => ({ mutate: mockRedeemCommunityNftOffer }),
}))

jest.mock('features/outpost/components/AWNftOffers/AWNftOffers', () => ({
  AWNftOffers: ({ showRedeemModal }) => (
    <button onClick={() => showRedeemModal(<span>aw card</span>, 5, 1000)}>fuse aw offer</button>
  ),
}))

const mockCommunityListMounted = jest.fn()
jest.mock('features/outpost/components/CommunityNftOffers/CommunityNftOffers', () => ({
  CommunityNftOffers: ({ showRedeemModal }) => {
    // Counts mounts: the page remounts the list (new key) after a community fuse.
    jest.requireActual('react').useEffect(() => mockCommunityListMounted(), [])
    return (
      <button onClick={() => showRedeemModal(<span>community card</span>, 8, 500)}>
        fuse community offer
      </button>
    )
  },
}))

jest.mock('features/outpost/modals/NftRedemptionModal/NftRedemptionModal', () => ({
  NftRedemptionModal: ({ nftCardModal, pointsRequired, redeemAction, onClose }) => (
    <div role="dialog">
      {nftCardModal}
      <span>{`needs ${pointsRequired}`}</span>
      <button onClick={redeemAction}>confirm fuse</button>
      <button onClick={onClose}>close modal</button>
    </div>
  ),
}))

const click = (name: string) => userEvent.click(screen.getByRole('button', { name }))

describe('Outpost', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    useSessionStore.setState({ walletId: 'player.wam' })
    mockUseWalletDetails.mockReturnValue({
      walletDetails: { userpoints_details: { redeemable_points: 12345 } },
      loading: false,
    })
  })

  afterEach(() => {
    // Components are still mounted here (Testing Library unmounts after this hook).
    act(() => {
      useSessionStore.setState({ walletId: null })
      useModalStore.getState().setOutPostModalsActive(false)
    })
  })

  it("shows the player's shards", () => {
    render(<Outpost />)

    expect(mockUseWalletDetails).toHaveBeenCalledWith('player.wam')
    expect(screen.getByText('1,234.5')).toBeInTheDocument()
  })

  it("waits for the player's details to load", () => {
    mockUseWalletDetails.mockReturnValue({ walletDetails: null, loading: true })
    render(<Outpost />)

    expect(screen.getByText('loading')).toBeInTheDocument()
  })

  it('fuses an AW offer through the redeem modal, then closes it', async () => {
    render(<Outpost />)

    await click('fuse aw offer')
    expect(screen.getByRole('dialog')).toHaveTextContent('aw card')
    expect(screen.getByText('needs 1000')).toBeInTheDocument()
    expect(useModalStore.getState().isOutPostModalsActive).toBe(true)

    await click('confirm fuse')
    expect(mockRedeemAWNftOffer).toHaveBeenCalledWith({ offerId: 5, pointsRequired: 1000 })
    expect(mockRedeemCommunityNftOffer).not.toHaveBeenCalled()
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(useModalStore.getState().isOutPostModalsActive).toBe(false)
  })

  it('fuses a community offer from its tab, then reloads the community list', async () => {
    render(<Outpost />)
    await userEvent.click(screen.getByRole('tab', { name: 'Community' }))
    expect(mockCommunityListMounted).toHaveBeenCalledTimes(1)

    await click('fuse community offer')
    await click('confirm fuse')

    expect(mockRedeemCommunityNftOffer).toHaveBeenCalledWith({ offerId: 8, pointsRequired: 500 })
    expect(mockRedeemAWNftOffer).not.toHaveBeenCalled()
    expect(mockCommunityListMounted).toHaveBeenCalledTimes(2)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('closing the redeem modal fuses nothing', async () => {
    render(<Outpost />)

    await click('fuse aw offer')
    await click('close modal')

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(mockRedeemAWNftOffer).not.toHaveBeenCalled()
    expect(useModalStore.getState().isOutPostModalsActive).toBe(false)
  })
})
