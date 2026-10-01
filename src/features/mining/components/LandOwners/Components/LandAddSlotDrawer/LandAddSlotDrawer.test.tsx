import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { mockStore, renderWithChakra } from 'features/mining/testUtils/mockStore'
import { MemoryRouter } from 'react-router-dom'
import { useModalStore } from 'shared/store/modalStore'

import { LandAddSlotDrawer } from './LandAddSlotDrawer'

jest.mock('store', () => jest.requireActual('features/mining/testUtils/mockStore').storeMock)
jest.mock('@alien-worlds/uikit', () => ({
  Button: ({ children, onClick }: any) => (
    <button type="button" onClick={onClick}>
      {children}
    </button>
  ),
}))
jest.mock(
  'features/mining/components/LandOwners/Components/BoostSlotsInline/BoostSlotsInline',
  () => ({
    BoostSlotsInline: () => <div data-testid="slot-picker" />,
  })
)
jest.mock('features/mining/components/LandOwners/Components/LandInfo/LandInfo', () => ({
  LandInfo: () => null,
}))
jest.mock('features/mining/components/PlanetLand/Components/LandAddSlotModal', () => ({
  LandAddSlotModal: ({ selectedBoost }: any) => (
    <div data-testid="add-boost-modal">{selectedBoost.name}</div>
  ),
}))
jest.mock('shared/layouts', () => ({
  AppModal: ({ isOpen, children }: any) => (isOpen ? <div>{children}</div> : null),
}))

const setup = ({
  slotNumber = null,
  minBoostAmount,
  path = '/mining',
}: { slotNumber?: number | null; minBoostAmount?: string; path?: string } = {}) => {
  mockStore({
    state: { wax: { managingLandDetails: { data: { MinBoostAmount: minBoostAmount } } } },
  })
  useModalStore.setState({
    isLandOwnerAddSlotDrawerOpen: true,
    landOwnerDrawerPayload: { slotNumber },
  })
  return renderWithChakra(
    <MemoryRouter initialEntries={[path]}>
      <LandAddSlotDrawer />
    </MemoryRouter>
  )
}

const boostButtons = () => screen.queryAllByRole('button', { name: 'Boost' })

describe('LandAddSlotDrawer', () => {
  it('asks for a slot first', () => {
    setup()

    expect(screen.getByTestId('slot-picker')).toBeInTheDocument()
    expect(boostButtons()).toHaveLength(0)
  })

  it('offers every boost level for the chosen slot', () => {
    setup({ slotNumber: 2 })

    expect(screen.queryByTestId('slot-picker')).not.toBeInTheDocument()
    expect(boostButtons()).toHaveLength(5)
    expect(screen.getByText('Public Boost Limit:').nextSibling).toHaveTextContent('Small Boost')
  })

  it('only offers boosts at or above the land minimum', () => {
    setup({ slotNumber: 2, minBoostAmount: '160000' })

    expect(boostButtons()).toHaveLength(3)
    expect(screen.getByText('Public Boost Limit:').nextSibling).toHaveTextContent('Medium Boost')
  })

  it('opens the confirmation for the chosen boost', async () => {
    setup({ slotNumber: 2 })

    await userEvent.click(boostButtons()[1])

    expect(screen.getByTestId('add-boost-modal')).toHaveTextContent('Lv 2 Boost')
  })

  it('goes back to the slot picker outside the land page', async () => {
    setup({ slotNumber: 2 })

    await userEvent.click(screen.getByText('Return to Slots'))

    expect(useModalStore.getState().landOwnerDrawerPayload).toEqual({ slotNumber: null })
    expect(useModalStore.getState().isLandOwnerAddSlotDrawerOpen).toBe(true)
  })

  it('closes the drawer from the land page', async () => {
    setup({ slotNumber: 2, path: '/landMgt/42' })

    await userEvent.click(screen.getByText('Return to Slots'))

    expect(useModalStore.getState().isLandOwnerAddSlotDrawerOpen).toBe(false)
  })

  it('clears the slot when closed', async () => {
    setup({ slotNumber: 2 })

    await userEvent.click(screen.getByRole('button', { name: 'Close' }))

    expect(useModalStore.getState().isLandOwnerAddSlotDrawerOpen).toBe(false)
    expect(useModalStore.getState().landOwnerDrawerPayload).toEqual({ slotNumber: null })
  })
})
