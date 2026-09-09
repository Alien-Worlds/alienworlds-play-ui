import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AssetSchema } from 'store/atomic/types'

import { AssetsFilterPanel } from './AssetsFilterPanel'

const mockNavigate = jest.fn()
let mockUseMatchResult: object | null = { path: '/inventory' }
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useMatch: () => mockUseMatchResult,
}))

jest.mock('routes', () => ({
  router: { state: { location: { pathname: '/inventory' } } },
}))

jest.mock('features/glossary/components/GlossaryInfoIcon/GlossaryInfoIcon', () => ({
  GlossaryInfoIcon: () => <div data-testid="glossary-info-icon" />,
}))

jest.mock('shared/components/SortBySelector/SortBySelector', () => ({
  SortBySelector: () => <div data-testid="sort-by-selector" />,
}))

jest.mock('store/atomic/helpers', () => ({
  defaultSortByNameOption: { sortBy: 'name' },
  defaultSortByRarityOption: { sortBy: 'rarity' },
  mapToSelectedSortByOption: () => ({ sortBy: 'name' }),
}))

const mockSetAssetsFilter = jest.fn()
let mockAssetsFilter: any
let mockFilteredAndSortedAssets: any[] = []

jest.mock('store', () => ({
  useAppState: () => ({
    atomic: {
      assetsFilter: mockAssetsFilter,
      filteredAndSortedAssets: mockFilteredAndSortedAssets,
    },
  }),
  useActions: () => ({
    atomic: { setAssetsFilter: mockSetAssetsFilter },
  }),
}))

describe('AssetsFilterPanel', () => {
  beforeEach(() => {
    mockUseMatchResult = { path: '/inventory' } as any
    mockFilteredAndSortedAssets = []
    mockAssetsFilter = {
      sortBy: 'name',
      reversed: false,
      groupByTemplate: false,
      view: {
        selectedTabIndex: 0,
        tabOptions: [
          { name: 'All', assetSchema: AssetSchema.CREW },
          { name: 'Land', assetSchema: AssetSchema.LAND },
        ],
      },
    }
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('renders nothing until the filter view is loaded', () => {
    mockAssetsFilter = {}
    const { container } = render(<AssetsFilterPanel />)
    expect(container).toBeEmptyDOMElement()
  })

  it('renders a tab for each asset schema option', () => {
    render(<AssetsFilterPanel />)

    expect(screen.getByText('All')).toBeInTheDocument()
    expect(screen.getByText('Land')).toBeInTheDocument()
  })

  it('updates the asset filter when a different schema tab is selected', async () => {
    render(<AssetsFilterPanel />)

    await userEvent.click(screen.getByText('Land'))

    expect(mockSetAssetsFilter).toHaveBeenCalledWith(
      expect.objectContaining({ assetSchema: AssetSchema.LAND })
    )
  })

  it('navigates to land management when exactly one land NFT is owned', async () => {
    mockFilteredAndSortedAssets = [{ schema: { schema_name: AssetSchema.LAND }, asset_id: '123' }]
    render(<AssetsFilterPanel />)

    await userEvent.click(screen.getByText('Land'))

    expect(mockNavigate).toHaveBeenCalledWith(expect.stringContaining('123'))
    expect(mockSetAssetsFilter).not.toHaveBeenCalled()
  })

  it('toggles reversed sort order', async () => {
    render(<AssetsFilterPanel />)

    expect(screen.getByText('A-Z')).toBeInTheDocument()
    await userEvent.click(screen.getByText('A-Z'))

    expect(mockSetAssetsFilter).toHaveBeenCalledWith(expect.objectContaining({ reversed: true }))
  })

  it('shows the Group checkbox on the inventory page when schema is not Land', async () => {
    render(<AssetsFilterPanel />)

    const checkbox = screen.getByRole('checkbox')
    await userEvent.click(checkbox)

    expect(mockSetAssetsFilter).toHaveBeenCalledWith(
      expect.objectContaining({ groupByTemplate: true })
    )
  })

  it('hides the Group checkbox when the selected schema is Land', () => {
    mockAssetsFilter.view.selectedTabIndex = 1
    render(<AssetsFilterPanel />)

    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument()
  })

  it('hides the Group checkbox outside the inventory page', () => {
    mockUseMatchResult = null
    render(<AssetsFilterPanel />)

    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument()
  })
})
