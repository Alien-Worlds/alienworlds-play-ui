import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { mockStore } from 'features/mining/testUtils/mockStore'
import { useModalStore } from 'shared/store/modalStore'
import { useSessionStore } from 'shared/store/sessionStore'
import { config } from 'shared/util/config'

import { Shining } from './Shining'

jest.mock('store', () => jest.requireActual('features/mining/testUtils/mockStore').storeMock)

const mockNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}))

jest.mock('@alien-worlds/uikit', () => ({
  Button: ({ children, onClick, disabled }: any) => (
    <button type="button" onClick={onClick} disabled={disabled}>
      {children}
    </button>
  ),
  NFTCard: ({ children, title, shine }: any) => (
    <div data-testid="nft-card">
      <p>{`${title} (${shine})`}</p>
      {children}
    </div>
  ),
  NFTCardTopRightPanel: () => null,
  NFTImage: () => null,
  NFTCardDetailsPanel: () => null,
  NFTCardBottomPanel: () => null,
  NFTPlanetComission: () => null,
  NFTOverlayPanel: () => null,
}))

jest.mock('react-infinite-scroll-component', () => ({
  __esModule: true,
  default: ({ children, next, hasMore }: any) => (
    <div>
      {children}
      {hasMore && (
        <button type="button" onClick={next}>
          Load more
        </button>
      )}
    </div>
  ),
}))

jest.mock('features/inventory/utils/NFTCardHelper', () => ({
  setCardPowers: () => ({}),
  NFTCardDataPreparation: (assets: any[]) =>
    assets.map((a) => ({
      assetId: { name: a.asset_id },
      templateId: a.template.template_id,
      title: { name: a.data.name },
      type: { name: a.data.name },
      rarity: { name: 'common' },
      shine: { name: a.data.shine.toLowerCase() },
      nftImage: { name: 'img' },
    })),
}))
jest.mock('features/inventory/utils/NFTCardOverlayRender', () => ({
  NFTCardBottomPanelRender: () => null,
  NFTCardDetailPanelRender: () => null,
  NFTCardOverlayRender: () => null,
  NFTCardTopRightPanelRender: () => null,
}))
jest.mock('features/inventory/components/AssetsFilterPanel/AssetsFilterPanel', () => ({
  AssetsFilterPanel: () => <div data-testid="assets-filter-panel" />,
}))
jest.mock('features/inventory/components/InventoryFiltersDrawer/InventoryFiltersDrawer', () => ({
  InventoryFiltersDrawer: () => null,
}))
jest.mock('features/outpost/modals/NftZoomModal/NftZoomModal', () => ({
  NftZoomModal: () => null,
}))
jest.mock('features/syndicates/components/LoadingSpinner/LoadingSpinner', () => ({
  LoadingSpinner: () => <div data-testid="loading-spinner" />,
}))

let mockWalletDetails: { walletDetails: any; loading: boolean }
jest.mock('graphql/hooks/useWalletDetails', () => ({
  useWalletDetails: () => mockWalletDetails,
}))

const makeAsset = (id: string, name: string, template: string, copies = 4) => ({
  asset_id: id,
  total_of_type: copies,
  template: { template_id: template },
  data: { name, shine: 'Stone', rarity: 'Common' },
})

// Grouped list the page offers for shining, and the individual copies behind the Drill group.
const grouped = [makeAsset('1', 'Drill', 'drill'), makeAsset('9', 'Axe', 'axe', 2)]
const drills = ['1', '2', '3', '4', '5'].map((id) => makeAsset(id, 'Drill', 'drill', 1))

const collectEvent = jest.fn()
// The real preset clears the sorted list until the sync loop rebuilds it.
const presetAssetsFilter = jest.fn()
const setShiningUrl = jest.fn()
const setOutPostModalsActive = jest.fn()
const tryShine = jest.fn()

const mockGetShineInfo = jest.fn()
jest.mock('features/mining/utils/chainReads', () => ({
  getShineInfo: (templateId: string) => mockGetShineInfo(templateId),
}))

const mockGetTemplateById = jest.fn()
jest.mock('shared/util/atomicassets', () => ({
  getAssetById: jest.fn(),
  getTemplateById: (id: string) => mockGetTemplateById(id),
}))

const setup = ({ atomic = {}, wax = {} }: { atomic?: any; wax?: any } = {}) => {
  mockStore({
    state: {
      wax: { isShining: false, ...wax },
      atomic: {
        filteredAndSortedAssets: grouped,
        assets: [...drills, grouped[1]],
        triggerFilterAndSortAssets: false,
        ...atomic,
      },
    },
    actions: {
      wax: { tryShine, collectEvent },
      main: { setShiningUrl, setOutPostModalsActive, presetAssetsFilter },
    },
  })
  return render(<Shining />)
}

const cardTitles = () =>
  screen.getAllByTestId('nft-card').map((x) => x.querySelector('p').textContent)

const pickDrill = async () => {
  await userEvent.click(screen.getByText('Drill (stone)'))
  await screen.findByText('Select 4 cards')
}

// Clicks copies `from`..`to` (1-based) in the list shown once an NFT is picked. The first
// "Drill (stone)" card is the shine input; the preview is "Drill (gold)".
const selectDrills = async (from: number, to = from) => {
  const copies = screen.getAllByText('Drill (stone)').slice(1)
  for (const card of copies.slice(from - 1, to)) {
    // eslint-disable-next-line no-await-in-loop
    await userEvent.click(card)
  }
}

beforeEach(() => {
  jest.clearAllMocks()
  useSessionStore.getState().setWalletId('miner.wam')
  mockWalletDetails = { walletDetails: { tlm_balance: '100.0000 TLM' }, loading: false }
  mockGetShineInfo.mockResolvedValue({ to: 777, cost: '40.0000 TLM', qty: 4 })
  mockGetTemplateById.mockResolvedValue({
    immutable_data: { name: 'Drill', rarity: 'Common', img: 'gold-drill' },
  })
  tryShine.mockResolvedValue(true)
})

describe('Shining page', () => {
  it('records the page visit on mount', () => {
    setup()

    expect(collectEvent).toHaveBeenCalledWith({
      name: 'page_visit',
      fields: { location: '/shining' },
    })
    expect(presetAssetsFilter).toHaveBeenCalledTimes(1)
  })

  it('shows a spinner while the wallet loads', () => {
    mockWalletDetails = { walletDetails: null, loading: true }

    setup()

    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument()
  })

  it('only offers NFTs with at least 4 copies', () => {
    setup()

    expect(cardTitles()).toEqual(['Drill (stone)'])
    expect(screen.getByTestId('assets-filter-panel')).toBeInTheDocument()
  })

  it('explains the 4-copy rule when nothing can be shined', () => {
    setup({ atomic: { filteredAndSortedAssets: [grouped[1]] } })

    expect(screen.getByText('To shine NFTs, you need at least 4 duplicates.')).toBeInTheDocument()
  })

  it('shows 30 NFTs at a time', async () => {
    const many = Array.from({ length: 45 }, (_, i) => makeAsset(`${i}`, `Tool ${i}`, `t${i}`))
    setup({ atomic: { filteredAndSortedAssets: many } })
    expect(screen.getAllByTestId('nft-card')).toHaveLength(30)

    await userEvent.click(screen.getByRole('button', { name: 'Load more' }))

    expect(screen.getAllByTestId('nft-card')).toHaveLength(45)
    expect(screen.queryByRole('button', { name: 'Load more' })).not.toBeInTheDocument()
  })

  it('previews the next shine level and lists the copies to choose from', async () => {
    setup()

    await pickDrill()

    expect(mockGetShineInfo).toHaveBeenCalledWith('drill')
    expect(mockGetTemplateById).toHaveBeenCalledWith('777')
    expect(screen.getByText('40.0000 TLM')).toBeInTheDocument()
    expect(cardTitles()).toEqual([
      'Drill (stone)',
      'Drill (gold)',
      ...drills.map(() => 'Drill (stone)'),
    ])
    expect(screen.queryByTestId('assets-filter-panel')).not.toBeInTheDocument()
  })

  it('counts down the cards still to select', async () => {
    setup()
    await pickDrill()

    await selectDrills(1)
    expect(screen.getByText('Select 3 more cards')).toBeInTheDocument()

    await selectDrills(2, 3)
    expect(screen.getByText('Select 1 more card')).toBeInTheDocument()
  })

  it('deselects a card when clicked again', async () => {
    setup()
    await pickDrill()
    await selectDrills(1)

    await selectDrills(1)

    expect(screen.getByText('Select 4 cards')).toBeInTheDocument()
  })

  it('allows shining once 4 copies are selected and the player can afford it', async () => {
    setup()
    await pickDrill()
    expect(screen.getByRole('button', { name: 'Shine' })).toBeDisabled()

    await selectDrills(1, 4)

    expect(screen.getByText('You can shine now!')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Shine' })).toBeEnabled()
  })

  it('says how much Trilium is missing', async () => {
    mockWalletDetails = { walletDetails: { tlm_balance: '15.0000 TLM' }, loading: false }
    setup()
    await pickDrill()

    await selectDrills(1, 4)

    expect(screen.getByText('You need 25 more Trilium to shine.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Shine' })).toBeDisabled()
  })

  it('shines the selected copies and shows the result', async () => {
    setup()
    await pickDrill()
    await selectDrills(1, 4)

    await userEvent.click(screen.getByRole('button', { name: 'Shine' }))

    expect(setShiningUrl).toHaveBeenCalledWith('/shining/gold_shine.mp4')
    expect(tryShine).toHaveBeenCalledWith({
      itemIds: ['1', '2', '3', '4'],
      shineData: expect.objectContaining({ info: { to: 777, cost: '40.0000 TLM', qty: 4 } }),
    })
    await waitFor(() => expect(useModalStore.getState().primaryModals.ShiningModal).toBe(true))
    expect(screen.queryByText('You can shine now!')).not.toBeInTheDocument()
  })

  it('keeps the selection when shining fails', async () => {
    tryShine.mockResolvedValue(false)
    setup()
    await pickDrill()
    await selectDrills(1, 4)

    await userEvent.click(screen.getByRole('button', { name: 'Shine' }))

    expect(screen.getByText('You can shine now!')).toBeInTheDocument()
  })

  it('asks demo users to log in instead of shining', async () => {
    useSessionStore.getState().setWalletId(config.DemoUserWaxAccount)
    setup()
    await pickDrill()
    await selectDrills(1, 4)

    await userEvent.click(screen.getByRole('button', { name: 'Shine' }))

    expect(tryShine).not.toHaveBeenCalled()
    expect(useModalStore.getState().primaryModals.LoginModal).toBe(true)
  })

  it('goes back to picking an NFT when the selection is cleared', async () => {
    setup()
    await pickDrill()

    await userEvent.click(screen.getByRole('button', { name: 'Clear Selected' }))

    expect(cardTitles()).toEqual(['Drill (stone)'])
  })

  it('ignores clicks while a shine is in progress', async () => {
    setup({ wax: { isShining: true } })

    await userEvent.click(screen.getByText('Drill (stone)'))

    expect(mockGetShineInfo).not.toHaveBeenCalled()
  })

  it('goes back to the inventory', async () => {
    setup()

    await userEvent.click(screen.getByText('Back to Inventory'))

    expect(mockNavigate).toHaveBeenCalledWith('/inventory')
  })
})
