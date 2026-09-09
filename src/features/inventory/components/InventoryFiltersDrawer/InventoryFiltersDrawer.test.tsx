import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { InventoryFiltersDrawer } from './InventoryFiltersDrawer'

let mockIsDemoUser = false
jest.mock('store', () => ({
  useAppState: () => ({
    wax: { isDemoUser: mockIsDemoUser },
  }),
}))

jest.mock('features/inventory/components/AssestsFilterPanelMobil', () => ({
  AssetsFilterPanelMobile: () => <div data-testid="asset-filter-panel-mobile" />,
}))

describe('InventoryFiltersDrawer', () => {
  afterEach(() => {
    jest.clearAllMocks()
    mockIsDemoUser = false
  })

  it('renders nothing when closed', () => {
    render(<InventoryFiltersDrawer isOpen={false} onClose={jest.fn()} />)

    expect(screen.queryByText('Select Filters')).not.toBeInTheDocument()
  })

  it('renders the filter panel when open', () => {
    render(<InventoryFiltersDrawer isOpen onClose={jest.fn()} />)

    expect(screen.getByText('Select Filters')).toBeInTheDocument()
    expect(screen.getByTestId('asset-filter-panel-mobile')).toBeInTheDocument()
  })

  it('calls onClose when the close button is clicked', async () => {
    const onClose = jest.fn()
    render(<InventoryFiltersDrawer isOpen onClose={onClose} />)

    await userEvent.click(screen.getByRole('button', { name: /close drawer/i }))

    expect(onClose).toHaveBeenCalled()
  })
})
