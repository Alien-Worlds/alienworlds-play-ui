import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { mockStore } from 'features/mining/testUtils/mockStore'
import { getDefaultLandAssetsFilter } from 'store/atomic/helpers'

import { LandsFilterbarSwitches } from './LandsFilterbarSwitches'

jest.mock('store', () => jest.requireActual('features/mining/testUtils/mockStore').storeMock)
jest.mock('features/mining/components/PlanetLand/Components/PlanetFilterSlider', () => ({
  PlanetFilterSlider: ({ title, min, max, initialValue, onChange }: any) => (
    <button type="button" onClick={() => onChange([min, min])}>
      {`${title} ${min}-${max} [${initialValue}]`}
    </button>
  ),
}))

const setLandAssetsFilter = jest.fn()
const filter = getDefaultLandAssetsFilter()

beforeEach(() => {
  setLandAssetsFilter.mockClear()
  mockStore({
    state: { atomic: { landAssetsFilter: filter } },
    actions: { atomic: { setLandAssetsFilter } },
  })
})

describe('LandsFilterbarSwitches', () => {
  it('shows a slider per land stat with the current range', () => {
    render(<LandsFilterbarSwitches />)

    expect(screen.getAllByRole('button').map((x) => x.textContent)).toEqual([
      'Recharge multiplier 0.7-5 [0.7,5]',
      'Mining Power 0.6-2.5 [0.6,2.5]',
      'PoW 0-2 [0,2]',
      'NFT Power 0.5-2.5 [0.5,2.5]',
      'Commission 0-25 [0,25]',
    ])
  })

  it.each([
    ['Recharge multiplier', 'recharge', 0.7],
    ['Mining Power', 'miningPower', 0.6],
    ['PoW', 'pow', 0],
    ['NFT Power', 'luck', 0.5],
    ['Commission', 'commission', 0],
  ])('updates the land filter from the %s slider', async (title, field, min) => {
    render(<LandsFilterbarSwitches />)

    await userEvent.click(screen.getByText(new RegExp(`^${title} `)))

    expect(setLandAssetsFilter).toHaveBeenCalledWith({ ...filter, [field]: [min, min] })
  })
})
