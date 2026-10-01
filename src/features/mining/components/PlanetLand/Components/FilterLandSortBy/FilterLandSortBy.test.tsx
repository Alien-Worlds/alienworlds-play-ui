import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { mockStore } from 'features/mining/testUtils/mockStore'

import { FilterLandSortBy } from './FilterLandSortBy'

jest.mock('store', () => jest.requireActual('features/mining/testUtils/mockStore').storeMock)
jest.mock('@alien-worlds/uikit', () => ({
  Dropdown: ({ options, onChange, value }: any) => (
    <select
      aria-label="filter"
      value={value?.value ?? ''}
      onChange={(e) => onChange(options.find((o: any) => o.value === e.target.value))}
    >
      <option value="" />
      {options.map((o: any) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  ),
}))

const setLandAssetsFilter = jest.fn()
const filter = { owner: 'bob', sortBy: 'Commission', rarity: 'Rare', terrain: 'Plains' }

beforeEach(() => {
  setLandAssetsFilter.mockClear()
  mockStore({
    state: { atomic: { landAssetsFilter: filter } },
    actions: { atomic: { setLandAssetsFilter } },
  })
})

describe('FilterLandSortBy', () => {
  it('shows the current sortBy', () => {
    render(<FilterLandSortBy />)

    expect(screen.getByLabelText('filter')).toHaveValue(filter.sortBy)
  })

  it('updates the sortBy in the land filter', async () => {
    render(<FilterLandSortBy />)

    await userEvent.selectOptions(screen.getByLabelText('filter'), 'Owner')

    expect(setLandAssetsFilter).toHaveBeenCalledWith({ ...filter, sortBy: 'Owner' })
  })
})
