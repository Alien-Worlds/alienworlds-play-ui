import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { mockStore } from 'features/mining/testUtils/mockStore'

import { FilterLandTerrain } from './FilterLandTerrain'

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

describe('FilterLandTerrain', () => {
  it('shows the current terrain', () => {
    render(<FilterLandTerrain />)

    expect(screen.getByLabelText('filter')).toHaveValue(filter.terrain)
  })

  it('updates the terrain in the land filter', async () => {
    render(<FilterLandTerrain />)

    await userEvent.selectOptions(screen.getByLabelText('filter'), 'Mountains')

    expect(setLandAssetsFilter).toHaveBeenCalledWith({ ...filter, terrain: 'Mountains' })
  })
})
