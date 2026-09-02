import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AssetType } from 'store/atomic/types'

import { AssetsFilterPanelMobile } from './AssetsFilterPanelMobile'

let mockUseMatchResult: object | null = { path: '/inventory' }
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useMatch: () => mockUseMatchResult,
}))

jest.mock('features/inventory/components/FilterBySelectorMobil/FilterBySelectorMobile', () => ({
  FilterBySelectorMobile: () => <div data-testid="filter-by-selector" />,
}))

jest.mock('shared/components/SortBySelectorMobile/SortBySelectorMobile', () => ({
  SortBySelectorMobile: () => <div data-testid="sort-by-selector" />,
}))

const mockSetAssetsFilter = jest.fn()
let mockAssetsFilter: any = {
  reversed: false,
  groupByTemplate: false,
  view: {
    tabOptions: [{ name: 'All' }],
    selectedTabIndex: 0,
  },
}

jest.mock('store', () => ({
  useAppState: () => ({
    atomic: { assetsFilter: mockAssetsFilter },
  }),
  useActions: () => ({
    atomic: { setAssetsFilter: mockSetAssetsFilter },
  }),
}))

describe('AssetsFilterPanelMobile', () => {
  beforeEach(() => {
    mockUseMatchResult = { path: '/inventory' } as any
    mockAssetsFilter = {
      reversed: false,
      groupByTemplate: false,
      view: {
        tabOptions: [{ name: 'All' }],
        selectedTabIndex: 0,
      },
    }
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('renders nothing until the filter view is loaded', () => {
    mockAssetsFilter = {}
    const { container } = render(<AssetsFilterPanelMobile />)
    expect(container).toBeEmptyDOMElement()
  })

  it('renders the filter and sort selectors', () => {
    render(<AssetsFilterPanelMobile />)

    expect(screen.getByTestId('filter-by-selector')).toBeInTheDocument()
    expect(screen.getByTestId('sort-by-selector')).toBeInTheDocument()
  })

  it('shows A-Z when not reversed and toggles to reversed on click', async () => {
    render(<AssetsFilterPanelMobile />)

    expect(screen.getByText('A-Z')).toBeInTheDocument()

    await userEvent.click(screen.getByRole('switch', { name: /reverse sort order/i }))

    expect(mockSetAssetsFilter).toHaveBeenCalledWith(expect.objectContaining({ reversed: true }))
  })

  it('shows the group-by toggle on the inventory page when the schema is not Land', async () => {
    render(<AssetsFilterPanelMobile />)

    const groupSwitch = screen.getByRole('switch', { name: /group by template/i })
    expect(groupSwitch).toBeInTheDocument()

    await userEvent.click(groupSwitch)

    expect(mockSetAssetsFilter).toHaveBeenCalledWith(
      expect.objectContaining({ groupByTemplate: true })
    )
  })

  it('hides the group-by toggle when the selected schema is Land', () => {
    mockAssetsFilter = {
      reversed: false,
      groupByTemplate: false,
      view: {
        tabOptions: [{ name: AssetType.LAND }],
        selectedTabIndex: 0,
      },
    }
    render(<AssetsFilterPanelMobile />)

    expect(screen.queryByRole('switch', { name: /group by template/i })).not.toBeInTheDocument()
  })

  it('hides the group-by toggle outside the inventory page', () => {
    mockUseMatchResult = null
    render(<AssetsFilterPanelMobile />)

    expect(screen.queryByRole('switch', { name: /group by template/i })).not.toBeInTheDocument()
  })
})
