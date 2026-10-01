import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { mockStore, renderWithChakra } from 'features/mining/testUtils/mockStore'
import { useModalStore } from 'shared/store/modalStore'
import { useSessionStore } from 'shared/store/sessionStore'
import { config } from 'shared/util/config'

import { LandAddSlotModal } from './LandAddSlotModal'

jest.mock('store', () => jest.requireActual('features/mining/testUtils/mockStore').storeMock)
jest.mock('@alien-worlds/uikit', () => ({
  Button: ({ children, onClick }: any) => (
    <button type="button" onClick={onClick}>
      {children}
    </button>
  ),
}))

const boostSlot = jest.fn()
const applyMainBoost = jest.fn()
const loadManagingLandDetailsAndBoostsWithDelay = jest.fn()
const onClose = jest.fn()

const boostNfts = [
  { asset_id: 'm1', name: 'MEGA Boost' },
  { asset_id: 's1', name: 'SUPER Boost' },
  { asset_id: 's2', name: 'SUPER Boost' },
]

const setup = (selectedBoost: any) => {
  mockStore({
    state: { atomic: { ownedLandBoostsAssets: boostNfts }, wax: { managingLandId: '42' } },
    actions: { wax: { boostSlot, applyMainBoost, loadManagingLandDetailsAndBoostsWithDelay } },
  })
  return renderWithChakra(
    <LandAddSlotModal selectedBoost={selectedBoost} onClose={onClose} selectedImg="" />
  )
}

const smallBoost = { name: 'Small Boost', percentage: 0.03, price: 4 }

beforeEach(() => {
  jest.clearAllMocks()
  boostSlot.mockResolvedValue(true)
  applyMainBoost.mockResolvedValue(true)
  useSessionStore.getState().setWalletId('owner.wam')
  useModalStore.setState({ landOwnerDrawerPayload: { slotNumber: 3 } })
})

describe('LandAddSlotModal', () => {
  describe('slot boost', () => {
    it('shows the boost for the chosen slot', () => {
      setup(smallBoost)

      expect(screen.getByText('Small Boost')).toBeInTheDocument()
      expect(screen.getByText('0.03%')).toBeInTheDocument()
      expect(screen.getByText('4')).toBeInTheDocument()
      expect(screen.getByText('Next Boost Application:')).toBeInTheDocument()
    })

    it('boosts the slot, reloads the land and closes', async () => {
      setup(smallBoost)

      await userEvent.click(screen.getByRole('button', { name: 'Yes, Boost Slot 3' }))

      expect(boostSlot).toHaveBeenCalledWith({ landId: '42', price: 4 })
      await waitFor(() => expect(onClose).toHaveBeenCalled())
      expect(loadManagingLandDetailsAndBoostsWithDelay).toHaveBeenCalled()
    })

    it('stays open when boosting fails', async () => {
      boostSlot.mockResolvedValue(false)
      setup(smallBoost)

      await userEvent.click(screen.getByRole('button', { name: 'Yes, Boost Slot 3' }))

      await waitFor(() => expect(boostSlot).toHaveBeenCalled())
      expect(onClose).not.toHaveBeenCalled()
    })
  })

  describe('MEGA / SUPER boost', () => {
    it('applies the first owned boost NFT of that kind', async () => {
      setup({ name: 'SUPER Boost' })

      await userEvent.click(screen.getByRole('button', { name: 'Yes, apply SUPER Boost' }))

      expect(applyMainBoost).toHaveBeenCalledWith({ landId: '42', boost: boostNfts[1] })
      await waitFor(() => expect(onClose).toHaveBeenCalled())
      expect(loadManagingLandDetailsAndBoostsWithDelay).toHaveBeenCalled()
    })

    it('has no slot or price', () => {
      setup({ name: 'MEGA Boost' })

      expect(screen.queryByText('Boost Multiplier')).not.toBeInTheDocument()
      expect(screen.queryByText('Next Boost Application:')).not.toBeInTheDocument()
    })
  })

  it.each([
    ['slot boost', smallBoost, 'Yes, Boost Slot 3'],
    ['MEGA boost', { name: 'MEGA Boost' }, 'Yes, apply MEGA Boost'],
  ])('asks demo users to log in instead of a %s', async (_, boost, button) => {
    useSessionStore.getState().setWalletId(config.DemoUserWaxAccount)
    setup(boost)

    await userEvent.click(screen.getByRole('button', { name: button }))

    expect(boostSlot).not.toHaveBeenCalled()
    expect(applyMainBoost).not.toHaveBeenCalled()
    expect(useModalStore.getState().primaryModals.LoginModal).toBe(true)
  })

  it('cancels', async () => {
    setup(smallBoost)

    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }))

    expect(onClose).toHaveBeenCalled()
  })
})
