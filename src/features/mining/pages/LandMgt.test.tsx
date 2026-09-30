import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { mockStore } from 'features/mining/testUtils/mockStore'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { useSessionStore } from 'shared/store/sessionStore'
import { AssetSchema } from 'store/atomic/types'

import { LandMgt } from './LandMgt'

jest.mock('store', () => jest.requireActual('features/mining/testUtils/mockStore').storeMock)

const mockNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}))

jest.mock('@alien-worlds/icons', () => ({
  ...jest.requireActual('@alien-worlds/icons'),
  ForwardIcon: ({ onClick }: any) => <button type="button" aria-label="Close" onClick={onClick} />,
}))

jest.mock('features/inventory/utils/NFTCardHelper', () => ({
  NFTCardSingleCardPrep: (land: any, walletId: string) => ({ prepared: land.asset_id, walletId }),
}))
jest.mock('features/inventory/utils/NFTCardOverlayRender', () => ({
  NFTCardOverlayRender: () => <div data-testid="land-card-overlay" />,
}))
jest.mock('features/mining/components/LandOwners/Components/BoostTable/BoostTable', () => ({
  BoostTable: ({ onShowUnlockModal, setSlotToUnlock }: any) => (
    <button
      type="button"
      onClick={() => {
        setSlotToUnlock(4)
        onShowUnlockModal()
      }}
    >
      Unlock slot
    </button>
  ),
}))
jest.mock('features/mining/components/LandOwners/Components/LandImage', () => ({
  LandImage: () => null,
}))
jest.mock('features/mining/components/LandOwners/Components/LandOwnerCommission', () => ({
  NFTLandOwnerCommission: () => <div data-testid="land-commission" />,
}))
jest.mock('features/mining/components/LandOwners/Components/MinimumBoostSetting', () => ({
  MinimumBoostSetting: () => null,
}))
jest.mock('features/mining/components/LandOwners/Components/NextBoostCountdown', () => ({
  NextBoostCountdown: () => null,
}))
jest.mock('features/mining/components/PlanetLand/Components/LandAddSlotModal', () => ({
  LandAddSlotModal: ({ selectedBoost }: any) => (
    <div data-testid="apply-boost-modal">{selectedBoost?.name}</div>
  ),
}))
jest.mock('features/mining/components/PlanetLand/Components/LandUnlockSlotModal', () => ({
  LandUnlockSlotModal: ({ slotToUnlock }: any) => (
    <div data-testid="unlock-slot-modal">{slotToUnlock}</div>
  ),
}))
jest.mock('features/syndicates/components/PlanetaryActions/PlanetaryActions', () => ({
  SetLandBtn: () => <div data-testid="set-land" />,
  ClaimDTALRewardsBtn: () => null,
  ClaimCommissionRewardsBtn: () => null,
}))
jest.mock('shared/layouts', () => ({
  AppModal: ({ isOpen, children }: any) => (isOpen ? <div>{children}</div> : null),
}))

const showLandMgtPage = jest.fn()
const setAssetsFilter = jest.fn()
const setNftLandCardProperties = jest.fn()

const managedLand = {
  asset_id: '42',
  owner: 'owner.wam',
  name: 'Mountains on Kavian',
  data: { x: 3, y: 8, landrating: 2500000, rarity: 'Epic' },
}

const setup = ({
  atomic = {},
  wax = {},
}: { atomic?: Record<string, any>; wax?: Record<string, any> } = {}) => {
  mockStore({
    state: {
      atomic: {
        landAsset: { asset_id: '7' },
        ownedLandBoostsAssets: [],
        assetsFilter: { sortBy: 0, assetSchema: null },
        ...atomic,
      },
      wax: {
        managingLandId: '42',
        nftLandCardProperties: { asset: 'card' },
        managingLandDetails: managedLand,
        ...wax,
      },
    },
    actions: {
      atomic: { setAssetsFilter },
      wax: { setNftLandCardProperties },
      main: { showLandMgtPage },
    },
  })
  return render(
    <MemoryRouter initialEntries={['/landMgt/42']}>
      <Routes>
        <Route path="/landMgt/:id" element={<LandMgt />} />
      </Routes>
    </MemoryRouter>
  )
}

beforeEach(() => {
  jest.clearAllMocks()
  useSessionStore.getState().setWalletId('owner.wam')
})

afterEach(() => {
  jest.useRealTimers()
})

describe('LandMgt page', () => {
  it('loads the land from the url', () => {
    setup()

    expect(showLandMgtPage).toHaveBeenCalledWith('42')
  })

  it('shows the land details', () => {
    setup()

    expect(screen.getByText('Mountains')).toBeInTheDocument()
    expect(screen.getByText('Kavian')).toBeInTheDocument()
    expect(screen.getByText(/\(3:8/)).toBeInTheDocument()
    expect(screen.getByText('250')).toBeInTheDocument()
    expect(screen.getByText('epic')).toBeInTheDocument()
    expect(screen.getByText('0.002%')).toBeInTheDocument()
  })

  it('uses the default land rating when the land has none', () => {
    setup({ wax: { managingLandDetails: { ...managedLand, data: { rarity: 'Common' } } } })

    expect(screen.getByText('100')).toBeInTheDocument()
  })

  it('prepares the land card once the land is loaded', () => {
    setup({ wax: { nftLandCardProperties: null } })

    expect(setNftLandCardProperties).toHaveBeenCalledWith({ prepared: '42', walletId: 'owner.wam' })
  })

  it('shows the land card and commission once prepared', () => {
    setup()

    expect(screen.getByTestId('land-card-overlay')).toBeInTheDocument()
    expect(screen.getByTestId('land-commission')).toBeInTheDocument()
  })

  it('hides the boosts without boost NFTs', () => {
    setup()

    expect(screen.queryByText('MEGA Boost')).not.toBeInTheDocument()
  })

  it('shows how many boost NFTs the player owns', () => {
    setup({
      atomic: {
        ownedLandBoostsAssets: [
          { name: 'MEGA Boost' },
          { name: 'MEGA Boost' },
          { name: 'SUPER Boost' },
        ],
      },
    })

    expect(screen.getByText('MEGA Boost')).toBeInTheDocument()
    expect(screen.getByText('SUPER Boost')).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument()
    expect(screen.getByText('1')).toBeInTheDocument()
  })

  it('opens the apply-boost modal for the chosen boost', async () => {
    setup({ atomic: { ownedLandBoostsAssets: [{ name: 'SUPER Boost' }] } })

    await userEvent.click(screen.getAllByRole('button', { name: 'Apply Boost' })[1])

    expect(screen.getByTestId('apply-boost-modal')).toHaveTextContent('SUPER Boost')
  })

  it('opens the unlock-slot modal from the boost table', async () => {
    setup()

    await userEvent.click(screen.getByRole('button', { name: 'Unlock slot' }))

    expect(screen.getByTestId('unlock-slot-modal')).toHaveTextContent('4')
  })

  it('offers to mine on the land unless it is already the mining land', () => {
    setup()
    expect(screen.getByTestId('set-land')).toBeInTheDocument()
  })

  it('hides the set-land button on the current mining land', () => {
    setup({ atomic: { landAsset: { asset_id: '42' } } })

    expect(screen.queryByTestId('set-land')).not.toBeInTheDocument()
  })

  it('returns an owner to their land inventory on close', async () => {
    jest.useFakeTimers()
    setup()

    await userEvent
      .setup({ advanceTimers: jest.advanceTimersByTime })
      .click(screen.getByRole('button', { name: 'Close' }))
    act(() => jest.advanceTimersByTime(200))

    expect(mockNavigate).toHaveBeenCalledWith('/inventory')
    expect(setAssetsFilter).toHaveBeenCalledWith({ sortBy: 0, assetSchema: AssetSchema.LAND })
  })

  it('returns other players to the land list on close', async () => {
    useSessionStore.getState().setWalletId('visitor.wam')
    setup()

    await userEvent.click(screen.getByRole('button', { name: 'Close' }))

    expect(mockNavigate).toHaveBeenCalledWith('/mining/land')
    expect(setAssetsFilter).not.toHaveBeenCalled()
  })
})
