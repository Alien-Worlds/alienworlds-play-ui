import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { mockStore } from 'features/mining/testUtils/mockStore'
import { filterByToolTypeOptions, ToolType } from 'store/atomic/types'

import { FilterByToolTypeSelector } from './FilterByToolTypeSelector'

jest.mock('store', () => jest.requireActual('features/mining/testUtils/mockStore').storeMock)
jest.mock('@alien-worlds/uikit', () => ({
  Dropdown: ({ options, onChange }: any) => (
    <select
      aria-label="tool type"
      defaultValue=""
      onChange={(e) => onChange(options.find((o: any) => o.label === e.target.value))}
    >
      <option value="" />
      {options.map((o: any) => (
        <option key={o.label} value={o.label}>
          {o.label}
        </option>
      ))}
    </select>
  ),
}))

const setFilterByToolType = jest.fn()
const filterByToolType = {
  filterByOptions: filterByToolTypeOptions,
  selectedFilterByOption: filterByToolTypeOptions[0],
}

const setup = (value: any = filterByToolType) => {
  mockStore({
    state: { atomic: { filterByToolType: value } },
    actions: { atomic: { setFilterByToolType } },
  })
  return render(<FilterByToolTypeSelector />)
}

describe('FilterByToolTypeSelector', () => {
  it('offers every tool type', () => {
    setup()

    expect(
      Array.from(screen.getByLabelText('tool type').querySelectorAll('option'))
        .map((x) => x.textContent)
        .filter(Boolean)
    ).toEqual(filterByToolTypeOptions.map((x) => x.filterBy))
  })

  it('selects a tool type', async () => {
    setup()

    await userEvent.selectOptions(screen.getByLabelText('tool type'), ToolType.EXOTOOL)

    expect(setFilterByToolType).toHaveBeenCalledWith({
      ...filterByToolType,
      selectedFilterByOption: filterByToolTypeOptions.find((x) => x.filterBy === ToolType.EXOTOOL),
    })
  })

  it('renders nothing without a tool type filter', () => {
    const { container } = setup(null)

    expect(container).toBeEmptyDOMElement()
  })
})
