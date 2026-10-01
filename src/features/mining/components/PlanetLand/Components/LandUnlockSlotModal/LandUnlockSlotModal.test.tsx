import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { mockStore } from 'features/mining/testUtils/mockStore'

import { LandUnlockSlotModal } from './LandUnlockSlotModal'

jest.mock('store', () => jest.requireActual('features/mining/testUtils/mockStore').storeMock)
jest.mock('@alien-worlds/uikit', () => ({
  Button: ({ children, onClick }: any) => (
    <button type="button" onClick={onClick}>
      {children}
    </button>
  ),
}))

const unlockSlot = jest.fn()
const loadManagingLandDetailsAndBoostsWithDelay = jest.fn()
const onClose = jest.fn()

const setup = (slotToUnlock: number) => {
  mockStore({
    state: { wax: { managingLandId: '42' } },
    actions: { wax: { unlockSlot, loadManagingLandDetailsAndBoostsWithDelay } },
  })
  return render(<LandUnlockSlotModal onClose={onClose} slotToUnlock={slotToUnlock} />)
}

beforeEach(() => jest.clearAllMocks())

describe('LandUnlockSlotModal', () => {
  it('shows the slot price', () => {
    setup(9)

    expect(screen.getByText('4,600')).toBeInTheDocument()
  })

  it('unlocks the slot, reloads the land and closes', async () => {
    unlockSlot.mockResolvedValue(true)
    setup(4)

    await userEvent.click(screen.getByRole('button', { name: 'Unlock Slot 4' }))

    expect(unlockSlot).toHaveBeenCalledWith({ landId: '42', cost: 420 })
    await waitFor(() => expect(onClose).toHaveBeenCalled())
    expect(loadManagingLandDetailsAndBoostsWithDelay).toHaveBeenCalled()
  })

  it('stays open when unlocking fails', async () => {
    unlockSlot.mockResolvedValue(false)
    setup(4)

    await userEvent.click(screen.getByRole('button', { name: 'Unlock Slot 4' }))

    await waitFor(() => expect(unlockSlot).toHaveBeenCalled())
    expect(onClose).not.toHaveBeenCalled()
    expect(loadManagingLandDetailsAndBoostsWithDelay).not.toHaveBeenCalled()
  })

  it('cancels', async () => {
    setup(4)

    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }))

    expect(onClose).toHaveBeenCalled()
    expect(unlockSlot).not.toHaveBeenCalled()
  })
})
