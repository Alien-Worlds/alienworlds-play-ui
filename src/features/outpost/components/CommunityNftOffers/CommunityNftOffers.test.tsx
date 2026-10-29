import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useModalStore } from 'shared/store/modalStore'
import { useSessionStore } from 'shared/store/sessionStore'
import { PremintOfferWithTemplate } from 'store/wax/types'

import { CommunityNftOffers } from './CommunityNftOffers'

jest.mock('shared/util/config', () => ({ config: { DemoUserWaxAccount: 'demo.wam' } }))

const mockLoadPremintOffers = jest.fn()
jest.mock('features/outpost/utils/premintOffers', () => ({
  loadPremintOffers: (params: unknown) => mockLoadPremintOffers(params),
}))

jest.mock('@alien-worlds/uikit', () => ({
  Button: ({ children, onClick, disabled }) => (
    <button onClick={onClick} disabled={disabled}>
      {children}
    </button>
  ),
  NFTCard: ({ children }) => <div>{children}</div>,
  NFTCardMaxedIndicator: ({ children }) => <div>{children}</div>,
  NFTFullSizeImage: ({ src }) => <img alt="" src={src} />,
  NFTOverlayPanel: () => null,
}))

jest.mock('features/inventory/utils/NFTCardHelper', () => ({
  CommunityNftCardDataPreparation: (asset: { data: { img: string } }) => ({
    nftImage: { name: asset.data.img },
  }),
}))

jest.mock('features/inventory/utils/NFTCardOverlayRender', () => ({
  CommunityNFTCardOverlayRender: () => null,
}))

jest.mock('features/outpost/modals/NftZoomModal/NftZoomModal', () => ({
  NftZoomModal: () => null,
}))

jest.mock('features/syndicates/components/LoadingSpinner', () => ({
  LoadingSpinner: () => <span>loading</span>,
}))

const offer = (offer_id: number, required: number, available_count = 3) =>
  ({
    offer_id,
    required,
    available_count,
    template_id: offer_id * 10,
    next_asset_id: `asset-${offer_id}`,
    asset: { data: { img: `Qm${offer_id}` } },
  } as unknown as PremintOfferWithTemplate)

const fuseButtons = () => screen.getAllByRole('button', { name: 'Fuse Shards' })

describe('CommunityNftOffers', () => {
  const showRedeemModal = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    useSessionStore.setState({ isDemoUser: false })
    mockLoadPremintOffers.mockResolvedValue({
      rows: [offer(2, 2500), offer(1, 1000)],
      more: false,
      next_key: '',
    })
  })

  afterEach(() => {
    useModalStore.getState().resetAllPrimaryModals()
  })

  it('loads the first page of community offers and shows the shards each one needs', async () => {
    render(<CommunityNftOffers showRedeemModal={showRedeemModal} />)

    await waitFor(() => expect(fuseButtons()).toHaveLength(2))
    expect(mockLoadPremintOffers).toHaveBeenCalledWith({ lowerBound: null, fetchLimit: 10 })
    expect(screen.getByText('250.0')).toBeInTheDocument()
    expect(screen.getByText('100.0')).toBeInTheDocument()
  })

  it('opens the redeem modal with the offer and its shards', async () => {
    render(<CommunityNftOffers showRedeemModal={showRedeemModal} />)
    await waitFor(() => expect(fuseButtons()).toHaveLength(2))

    await userEvent.click(fuseButtons()[1])

    expect(showRedeemModal).toHaveBeenCalledWith(expect.anything(), 1, 1000)
  })

  it('asks a demo user to log in instead of redeeming', async () => {
    useSessionStore.setState({ isDemoUser: true })
    render(<CommunityNftOffers showRedeemModal={showRedeemModal} />)
    await waitFor(() => expect(fuseButtons()).toHaveLength(2))

    await userEvent.click(fuseButtons()[0])

    expect(useModalStore.getState().primaryModals.LoginModal).toBe(true)
    expect(showRedeemModal).not.toHaveBeenCalled()
  })

  it('disables fusing a sold-out offer', async () => {
    mockLoadPremintOffers.mockResolvedValue({
      rows: [offer(3, 500, 0)],
      more: false,
      next_key: '',
    })

    render(<CommunityNftOffers showRedeemModal={showRedeemModal} />)

    await waitFor(() => expect(fuseButtons()[0]).toBeDisabled())
  })

  it('shows nothing and stops loading when logged out (an empty last page)', async () => {
    mockLoadPremintOffers.mockResolvedValue({ rows: [], more: false, next_key: '' })

    render(<CommunityNftOffers showRedeemModal={showRedeemModal} />)

    await waitFor(() => expect(screen.queryByText('loading')).not.toBeInTheDocument())
    expect(screen.queryByRole('button', { name: 'Fuse Shards' })).not.toBeInTheDocument()
  })
})
