import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { mockStore } from 'features/mining/testUtils/mockStore'

import { FilterLandToggleSort } from './FilterLandToggleSort'

jest.mock('store', () => jest.requireActual('features/mining/testUtils/mockStore').storeMock)

const setLandAssetsFilter = jest.fn()

const setup = (reversed: boolean) => {
  mockStore({
    state: { atomic: { landAssetsFilter: { reversed, sortBy: 'Owner' } } },
    actions: { atomic: { setLandAssetsFilter } },
  })
  return render(<FilterLandToggleSort />)
}

beforeEach(() => setLandAssetsFilter.mockClear())

describe('FilterLandToggleSort', () => {
  it('flips A-Z to Z-A', async () => {
    setup(false)

    await userEvent.click(screen.getByRole('button', { name: 'A-Z' }))

    expect(setLandAssetsFilter).toHaveBeenCalledWith({ reversed: true, sortBy: 'Owner' })
  })

  it('flips Z-A back to A-Z', async () => {
    setup(true)

    await userEvent.click(screen.getByRole('button', { name: 'Z-A' }))

    expect(setLandAssetsFilter).toHaveBeenCalledWith({ reversed: false, sortBy: 'Owner' })
  })
})
