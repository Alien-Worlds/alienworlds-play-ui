import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'

import { Inventory } from './Inventory'
import { PAGINATION } from '../constants'
import { useInventoryStore } from '../store/inventoryStore'

const mockNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}))

jest.mock('@alien-worlds/uikit', () => ({
  Button: ({ children, onClick }: any) => (
    <button type="button" onClick={onClick}>
      {children}
    </button>
  ),
  NFTCard: ({ children, title }: any) => (
    <div data-testid="nft-card">
      <p>{title}</p>
      {children}
    </div>
  ),
  NFTCardBottomPanel: ({ children }: any) => <div>{children}</div>,
  NFTCardDetailsPanel: ({ children }: any) => <div>{children}</div>,
  NFTCardTopRightPanel: ({ children }: any) => <div>{children}</div>,
  NFTImage: () => <div data-testid="nft-image" />,
  NFTInUseButton: () => <div />,
  NFTOverlayPanel: ({ children }: any) => <div>{children}</div>,
  NFTPlanetComission: () => <div />,
  NFTPlanetIndicator: () => <div />,
  NFTShowAllButton: ({ children }: any) => <div>{children}</div>,
}))

jest.mock('features/inventory/components/AssetsFilterPanel/AssetsFilterPanel', () => ({
  AssetsFilterPanel: () => <div data-testid="assets-filter-panel" />,
}))

let mockDrawerOpen = false
jest.mock('features/inventory/components/InventoryFiltersDrawer/InventoryFiltersDrawer', () => ({
  InventoryFiltersDrawer: ({ isOpen }: any) => {
    mockDrawerOpen = isOpen
    return <div data-testid="inventory-filters-drawer">{isOpen ? 'open' : 'closed'}</div>
  },
}))

jest.mock('features/inventory/utils/NFTCardOverlayRender', () => ({
  NFTCardTopRightPanelRender: () => <div />,
  NFTCardDetailPanelRender: ({ asset }: any) => <div>{asset?.title?.name}</div>,
  NFTCardBottomPanelRender: () => <div />,
  NFTCardOverlayRender: () => <div />,
  NFTCardSetAvatar: () => <div />,
  NFTShowAllRender: () => <div />,
}))

jest.mock('features/outpost/modals/NftZoomModal/NftZoomModal', () => ({
  NftZoomModal: ({ isOpen }: any) => (isOpen ? <div data-testid="zoom-modal" /> : null),
}))

jest.mock('features/syndicates/components/LoadingSpinner/LoadingSpinner', () => ({
  LoadingSpinner: () => <div data-testid="loading-spinner" />,
}))

let mockPlanetDetailResult: { planetDetails: any; loading: boolean } = {
  planetDetails: { planet_details: { title: 'Naron' } },
  loading: false,
}
jest.mock('graphql/hooks/usePlanetDetail', () => ({
  usePlanetDetail: () => mockPlanetDetailResult,
}))

const makeAsset = (id: number) => ({
  asset_id: `${id}`,
  schema: { schema_name: 'tool.worlds' },
  data: { name: `Tool ${id}` },
})

let mockFilteredAndSortedAssets: any[] = [makeAsset(1), makeAsset(2)]
const mockShowInventoryPage = jest.fn()
const mockSetOutPostModalsActive = jest.fn()
const mockGetAssetById = jest.fn()

jest.mock('store', () => ({
  useActions: () => ({
    main: {
      showInventoryPage: mockShowInventoryPage,
      setOutPostModalsActive: mockSetOutPostModalsActive,
    },
  }),
  useAppState: () => ({
    wax: { planetSelectedForMining: null, walletId: 'wallet.wam', isDemoUser: false },
    atomic: {
      filteredAndSortedAssets: mockFilteredAndSortedAssets,
      bagAssets: [],
      landAsset: null,
    },
  }),
  useEffects: () => ({
    atomic: { api: { getAssetById: mockGetAssetById } },
  }),
}))

jest.mock('features/inventory/hooks/useAssetProcessing', () => ({
  useAssetProcessing: () => ({
    processAssets: (assets: any[]) =>
      assets.map((asset) => ({
        assetId: { name: asset.asset_id },
        type: { name: 'Tool' },
        title: { name: asset.data.name },
        rarity: { name: 'common' },
        shine: { name: 'stone' },
        nftImage: { name: 'image.png' },
        disableInnerRing: false,
        multipleMintTypes: false,
      })),
  }),
}))

const renderInventory = () =>
  render(
    <MemoryRouter>
      <Inventory />
    </MemoryRouter>
  )

describe('Inventory page', () => {
  beforeEach(() => {
    act(() => {
      useInventoryStore.setState({ visibleCount: PAGINATION.DEFAULT_ITEMS_PER_PAGE })
    })
    mockFilteredAndSortedAssets = [makeAsset(1), makeAsset(2)]
    mockPlanetDetailResult = {
      planetDetails: { planet_details: { title: 'Naron' } },
      loading: false,
    }
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('tracks the page visit on mount', () => {
    renderInventory()
    expect(mockShowInventoryPage).toHaveBeenCalled()
  })

  it('shows a loading spinner while planet details are loading', () => {
    mockPlanetDetailResult = { planetDetails: null, loading: true }
    renderInventory()

    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument()
  })

  it('renders a card for each asset once loaded', () => {
    renderInventory()

    expect(screen.getAllByTestId('nft-card')).toHaveLength(2)
    expect(screen.getByText('Tool 1')).toBeInTheDocument()
    expect(screen.getByText('Tool 2')).toBeInTheDocument()
  })

  it('only renders up to the visible page size when there are more assets than one page', () => {
    mockFilteredAndSortedAssets = Array.from(
      { length: PAGINATION.DEFAULT_ITEMS_PER_PAGE + 10 },
      (_, i) => makeAsset(i)
    )
    renderInventory()

    expect(screen.getAllByTestId('nft-card')).toHaveLength(PAGINATION.DEFAULT_ITEMS_PER_PAGE)
  })

  it('navigates to the Shining page when Shine is clicked', async () => {
    renderInventory()

    const shineButtons = screen.getAllByText('Shine')
    await userEvent.click(shineButtons[0])

    expect(mockNavigate).toHaveBeenCalledWith('/shining')
  })

  it('opens the mobile filter drawer when the filter icon is clicked', async () => {
    renderInventory()

    expect(mockDrawerOpen).toBe(false)
    await userEvent.click(screen.getByRole('button', { name: 'filter' }))

    expect(mockDrawerOpen).toBe(true)
  })
})
