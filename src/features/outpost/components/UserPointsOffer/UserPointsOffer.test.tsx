import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DateTime } from 'luxon'
import { useModalStore } from 'shared/store/modalStore'
import { useSessionStore } from 'shared/store/sessionStore'
import { WaxPointsOfferWithTemplate } from 'store/wax/types'

import { UserPointsOffer, UserPointsOfferType } from './UserPointsOffer'

jest.mock('shared/util/config', () => ({ config: { DemoUserWaxAccount: 'demo.wam' } }))

const passThrough = ({ children }) => <div>{children}</div>
jest.mock('@alien-worlds/uikit', () => ({
  Button: ({ children, onClick, disabled }) => (
    <button onClick={onClick} disabled={disabled}>
      {children}
    </button>
  ),
  NFTCard: passThrough,
  NFTCardBottomPanel: passThrough,
  NFTCardDetailsPanel: passThrough,
  NFTCardMaxedIndicator: passThrough,
  NFTCardTopRightPanel: passThrough,
  NFTOverlayPanel: passThrough,
  NFTImage: () => null,
}))

jest.mock('@alien-worlds/icons', () => ({ InfinityIcon: () => null }))

let mockIssuedSupply = '10'
jest.mock('features/inventory/utils/NFTCardHelper', () => ({
  NFTCardSingleCardPrep: () => ({
    type: { name: 'Tool' },
    rarity: { name: 'Rare' },
    shine: { name: 'Stone' },
    issuedSupply: { name: mockIssuedSupply },
    maxSupply: { name: '100' },
    nftImage: { name: 'QmNft' },
    disableInnerRing: false,
  }),
}))

jest.mock('features/inventory/utils/NFTCardOverlayRender', () => ({
  NFTCardBottomPanelRender: () => null,
  NFTCardDetailPanelRender: () => null,
  NFTCardTopRightPanelRender: () => null,
  NFTCardOverlayRender: ({ zoom }) => (zoom ? <button onClick={zoom}>zoom</button> : null),
}))

jest.mock('features/outpost/modals/NftZoomModal/NftZoomModal', () => ({
  NftZoomModal: ({ redeemAction, onClose }) => (
    <div>
      <button onClick={redeemAction}>fuse from zoom</button>
      <button onClick={onClose}>close zoom</button>
    </div>
  ),
}))

const iso = (hoursFromNow: number) =>
  DateTime.utc().plus({ hours: hoursFromNow }).toISO({ includeOffset: false })
const pointsOffer = {
  id: 7,
  level: 1,
  template_id: 70,
  required: 1000,
  start: iso(-24),
  end: iso(72),
  asset: { data: { img: 'QmNft' } },
} as unknown as WaxPointsOfferWithTemplate

const fuseButton = () => screen.getByRole('button', { name: 'Fuse Shards' })

describe('UserPointsOffer', () => {
  const redeem = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    mockIssuedSupply = '10'
    useSessionStore.setState({ walletId: 'player.wam', isDemoUser: false })
  })

  afterEach(() => {
    // Components are still mounted here (Testing Library unmounts after this hook).
    act(() => {
      useSessionStore.setState({ walletId: null, isDemoUser: false })
      useModalStore.getState().resetAllPrimaryModals()
      useModalStore.getState().setOutPostModalsActive(false)
    })
  })

  it('shows the shards a current offer costs and when it expires', () => {
    render(
      <UserPointsOffer
        pointsOffer={pointsOffer}
        redeem={redeem}
        type={UserPointsOfferType.CURRENT}
      />
    )

    expect(screen.getByText('100.0')).toBeInTheDocument()
    expect(screen.getByText(/^Expires:/)).toBeInTheDocument()
    expect(screen.getByText('90')).toBeInTheDocument()
  })

  it('opens the redeem modal for a current offer', async () => {
    render(
      <UserPointsOffer
        pointsOffer={pointsOffer}
        redeem={redeem}
        type={UserPointsOfferType.CURRENT}
      />
    )

    await userEvent.click(fuseButton())
    expect(redeem).toHaveBeenCalledWith(expect.anything(), 7, 1000)
  })

  it("shows when an upcoming offer launches, and can't fuse it yet", () => {
    render(
      <UserPointsOffer
        pointsOffer={{ ...pointsOffer, start: iso(3) }}
        redeem={redeem}
        type={UserPointsOfferType.UPCOMING}
      />
    )

    expect(screen.getByText(/^Launch:/)).toBeInTheDocument()
    expect(fuseButton()).toBeDisabled()
  })

  it("can't fuse a sold-out offer", () => {
    mockIssuedSupply = '100'
    render(
      <UserPointsOffer
        pointsOffer={pointsOffer}
        redeem={redeem}
        type={UserPointsOfferType.CURRENT}
      />
    )

    expect(fuseButton()).toBeDisabled()
  })

  it('asks a demo user to log in instead of redeeming', async () => {
    useSessionStore.setState({ isDemoUser: true })
    render(
      <UserPointsOffer
        pointsOffer={pointsOffer}
        redeem={redeem}
        type={UserPointsOfferType.CURRENT}
      />
    )

    await userEvent.click(fuseButton())
    expect(useModalStore.getState().primaryModals.LoginModal).toBe(true)
    expect(redeem).not.toHaveBeenCalled()
  })

  it('fuses from the zoomed view', async () => {
    render(
      <UserPointsOffer
        pointsOffer={pointsOffer}
        redeem={redeem}
        type={UserPointsOfferType.CURRENT}
      />
    )

    await userEvent.click(screen.getByRole('button', { name: 'zoom' }))
    expect(useModalStore.getState().isOutPostModalsActive).toBe(true)

    await userEvent.click(screen.getByRole('button', { name: 'fuse from zoom' }))
    expect(redeem).toHaveBeenCalledWith(expect.anything(), 7, 1000)
    expect(screen.queryByRole('button', { name: 'fuse from zoom' })).not.toBeInTheDocument()
  })

  it('closing the zoomed view hides the outpost modal state', async () => {
    render(
      <UserPointsOffer
        pointsOffer={pointsOffer}
        redeem={redeem}
        type={UserPointsOfferType.CURRENT}
      />
    )

    await userEvent.click(screen.getByRole('button', { name: 'zoom' }))
    await userEvent.click(screen.getByRole('button', { name: 'close zoom' }))

    expect(useModalStore.getState().isOutPostModalsActive).toBe(false)
    expect(redeem).not.toHaveBeenCalled()
  })
})
