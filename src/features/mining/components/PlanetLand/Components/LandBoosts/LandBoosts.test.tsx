import { render, screen } from '@testing-library/react'
import { mockStore } from 'features/mining/testUtils/mockStore'
import { SlotVariant } from 'features/mining/types/LandownerTypes'

import { LandBoosts } from './LandBoosts'

jest.mock('store', () => jest.requireActual('features/mining/testUtils/mockStore').storeMock)

beforeEach(() => {
  mockStore({
    state: {
      wax: {
        managingLandBoostFullSlots: [
          { mod: SlotVariant.USED },
          { mod: SlotVariant.USED },
          { mod: SlotVariant.ADD },
          { mod: SlotVariant.LOCKED },
        ],
      },
    },
  })
})

describe('LandBoosts', () => {
  it('shows active boosts out of the unlocked slots', () => {
    render(<LandBoosts land={{}} />)

    expect(screen.getByText('2/3')).toBeInTheDocument()
  })

  it('renders nothing without a land', () => {
    const { container } = render(<LandBoosts land={null} />)

    expect(container).toBeEmptyDOMElement()
  })
})
