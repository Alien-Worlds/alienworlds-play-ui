import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { mockStore } from 'features/mining/testUtils/mockStore'
import { SlotVariant } from 'features/mining/types/LandownerTypes'
import { useModalStore } from 'shared/store/modalStore'

import { BoostSlotsInline } from './BoostSlotsInline'

jest.mock('store', () => jest.requireActual('features/mining/testUtils/mockStore').storeMock)
jest.mock('features/mining/components/LandOwners/Components/SlotNumber/SlotNumber', () => ({
  SlotNumber: ({ number, variant }: any) => (
    <span data-testid="slot" data-variant={variant}>
      {number}
    </span>
  ),
}))

const setup = () => {
  mockStore({
    state: {
      wax: {
        managingLandBoostFullSlots: [
          { mod: SlotVariant.USED, number: 1 },
          { mod: SlotVariant.ADD, number: 2 },
          { mod: SlotVariant.ADD, number: 3 },
          { mod: SlotVariant.LOCKED, number: 4 },
        ],
      },
    },
  })
  return render(<BoostSlotsInline />)
}

beforeEach(() => useModalStore.setState({ landOwnerDrawerPayload: null }))

describe('BoostSlotsInline', () => {
  it('recolours slots for the drawer: used as locked, open as used, the rest empty', () => {
    setup()

    expect(screen.getAllByTestId('slot').map((x) => x.getAttribute('data-variant'))).toEqual([
      SlotVariant.LOCKED,
      SlotVariant.USED,
      SlotVariant.USED,
      SlotVariant.EMPTY,
    ])
  })

  it('selects the first open slot', async () => {
    setup()

    await userEvent.click(screen.getByText('2'))

    expect(useModalStore.getState().landOwnerDrawerPayload).toEqual({ slotNumber: 2 })
  })

  it('ignores the other slots', async () => {
    setup()

    await userEvent.click(screen.getByText('3'))
    await userEvent.click(screen.getByText('1'))

    expect(useModalStore.getState().landOwnerDrawerPayload).toBeNull()
  })
})
