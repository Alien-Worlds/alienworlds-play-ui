import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AssetSchema } from 'store/atomic/types'

import { FilterBySelectorMobile } from './FilterBySelectorMobile'

const mockNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}))

jest.mock('@alien-worlds/uikit', () => ({
  Dropdown: ({ options, onChange }: any) => {
    return (
      <div>
        {options.map((option: any) => (
          <button key={option.value} type="button" onClick={() => onChange(option)}>
            {option.label}
          </button>
        ))}
      </div>
    )
  },
}))

const mockSetAssetsFilter = jest.fn()
const baseAssetsFilter = {
  sortBy: 'name',
  view: {
    tabOptions: [
      { name: 'All', assetSchema: AssetSchema.CREW },
      { name: 'Land', assetSchema: AssetSchema.LAND },
    ],
  },
}

let mockAssetsFilter = baseAssetsFilter
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

jest.mock('store/atomic/helpers', () => ({
  mapToSelectedSortByOption: () => ({ sortBy: 'name' }),
}))

describe('FilterBySelectorMobile', () => {
  beforeEach(() => {
    mockAssetsFilter = baseAssetsFilter
    mockFilteredAndSortedAssets = []
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('renders an option for each tab', () => {
    render(<FilterBySelectorMobile />)

    expect(screen.getByText('All')).toBeInTheDocument()
    expect(screen.getByText('Land')).toBeInTheDocument()
  })

  it('updates the asset filter when a schema is selected', async () => {
    render(<FilterBySelectorMobile />)

    await userEvent.click(screen.getByText('Land'))

    expect(mockSetAssetsFilter).toHaveBeenCalledWith(
      expect.objectContaining({ assetSchema: AssetSchema.LAND })
    )
  })

  it('navigates to land management when exactly one land NFT is owned', async () => {
    mockFilteredAndSortedAssets = [
      { schema: { schema_name: AssetSchema.LAND }, asset_id: '123' },
    ] as any
    render(<FilterBySelectorMobile />)

    await userEvent.click(screen.getByText('Land'))

    expect(mockNavigate).toHaveBeenCalledWith(expect.stringContaining('123'))
    expect(mockSetAssetsFilter).not.toHaveBeenCalled()
  })
})
