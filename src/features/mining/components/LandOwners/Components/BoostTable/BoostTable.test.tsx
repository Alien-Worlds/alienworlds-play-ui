import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { mockStore, renderWithChakra } from 'features/mining/testUtils/mockStore'
import { SlotVariant } from 'features/mining/types/LandownerTypes'
import { useModalStore } from 'shared/store/modalStore'

import { BoostTable } from './BoostTable'

jest.mock('store', () => jest.requireActual('features/mining/testUtils/mockStore').storeMock)
jest.mock('react-indiana-drag-scroll', () => ({
  __esModule: true,
  default: ({ children }: any) => <div>{children}</div>,
}))
jest.mock('features/mining/components/LandOwners/Components/SlotNumber/SlotNumber', () => ({
  SlotNumber: ({ number, variant }: any) => <span data-testid={`slot-${variant}`}>{number}</span>,
}))

const slots = [
  { mod: SlotVariant.USED, number: 1, name: 'Small Boost', origin: 'bob.wam', percentage: 3 },
  { mod: SlotVariant.ADD, number: 2 },
  { mod: SlotVariant.ADD, number: 3 },
  { mod: SlotVariant.LOCKED, number: 4 },
  { mod: SlotVariant.EMPTY, number: 5 },
]

const onShowUnlockModal = jest.fn()
const setSlotToUnlock = jest.fn()

const setup = (wax: Record<string, any> = {}) => {
  mockStore({
    state: {
      wax: { managingLandBoostFullSlots: slots, isLoadingManagingLandBoosts: false, ...wax },
    },
  })
  return renderWithChakra(
    <BoostTable onShowUnlockModal={onShowUnlockModal} setSlotToUnlock={setSlotToUnlock} />
  )
}

beforeEach(() => {
  jest.clearAllMocks()
  useModalStore.setState({ isLandOwnerAddSlotDrawerOpen: false, landOwnerDrawerPayload: null })
})

describe('BoostTable', () => {
  it('shows each slot by its state', () => {
    setup()

    expect(screen.getByTestId('slot-used')).toHaveTextContent('1')
    expect(screen.getAllByTestId('slot-add').map((x) => x.textContent)).toEqual(['2', '3'])
    expect(screen.getByTestId('slot-locked')).toHaveTextContent('4')
    expect(screen.getByTestId('slot-empty')).toHaveTextContent('5')
  })

  it('shows the active boost in a used slot', () => {
    setup()

    expect(screen.getByText('Small Boost')).toBeInTheDocument()
    expect(screen.getByText('bob.wam')).toBeInTheDocument()
    expect(screen.getByText('3%')).toBeInTheDocument()
  })

  // Current behaviour, pinned: only the first open slot is meant to be boostable, but the row
  // passes `disabled` to Chakra's Button, which overwrites it with `isDisabled`. So every open
  // slot's button is enabled; only the slot number is dimmed.
  it('leaves every Add Boost button enabled', () => {
    setup()

    const [first, second] = screen.getAllByRole('button', { name: 'Add Boost' })
    expect(first).toBeEnabled()
    expect(second).toBeEnabled()
  })

  it('opens the add-boost drawer for the slot', async () => {
    setup()

    await userEvent.click(screen.getAllByRole('button', { name: 'Add Boost' })[0])

    expect(useModalStore.getState().landOwnerDrawerPayload).toEqual({ slotNumber: 2 })
    expect(useModalStore.getState().isLandOwnerAddSlotDrawerOpen).toBe(true)
  })

  it('asks to unlock a locked slot', async () => {
    setup()

    await userEvent.click(screen.getByRole('button', { name: 'Unlock this Slot' }))

    expect(setSlotToUnlock).toHaveBeenCalledWith(4)
    expect(onShowUnlockModal).toHaveBeenCalled()
  })

  it('shows placeholders while the slots load', () => {
    setup({ isLoadingManagingLandBoosts: true })

    expect(screen.queryByTestId('slot-used')).not.toBeInTheDocument()
    expect(screen.getAllByRole('row')).toHaveLength(4)
  })
})
