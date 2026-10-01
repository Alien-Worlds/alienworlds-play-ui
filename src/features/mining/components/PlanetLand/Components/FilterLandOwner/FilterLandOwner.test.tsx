import { fireEvent, render, screen } from '@testing-library/react'
import { mockStore } from 'features/mining/testUtils/mockStore'

import { FilterLandOwner } from './FilterLandOwner'

jest.mock('store', () => jest.requireActual('features/mining/testUtils/mockStore').storeMock)

const setLandAssetsFilter = jest.fn()

const setup = (owner: string | null) => {
  mockStore({
    state: { atomic: { landAssetsFilter: { owner, sortBy: 'Owner' } } },
    actions: { atomic: { setLandAssetsFilter } },
  })
  return render(<FilterLandOwner />)
}

describe('FilterLandOwner', () => {
  it('shows the current owner filter', () => {
    setup('bob.wam')

    expect(screen.getByPlaceholderText('name.wam')).toHaveValue('bob.wam')
  })

  it('starts empty without an owner filter', () => {
    setup(null)

    expect(screen.getByPlaceholderText('name.wam')).toHaveValue('')
  })

  it('updates the owner in the land filter as the player types', () => {
    setup(null)

    fireEvent.change(screen.getByPlaceholderText('name.wam'), { target: { value: 'ali' } })

    expect(setLandAssetsFilter).toHaveBeenCalledWith({ owner: 'ali', sortBy: 'Owner' })
  })
})
