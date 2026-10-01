import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { mockStore, renderWithChakra } from 'features/mining/testUtils/mockStore'
import { MiningToolsActiveSlotNumber } from 'features/mining/types/MiningTypes'
import { useModalStore } from 'shared/store/modalStore'

import { MiningToolsDrawer } from './MiningToolsDrawer'

jest.mock('store', () => jest.requireActual('features/mining/testUtils/mockStore').storeMock)
jest.mock('routes', () => ({ router: { state: { location: { pathname: '/mining' } } } }))

jest.mock('@alien-worlds/uikit', () => ({
  Button: ({ children, onClick }: any) => (
    <button type="button" onClick={onClick}>
      {children}
    </button>
  ),
}))
jest.mock('react-indiana-drag-scroll', () => ({
  __esModule: true,
  default: ({ children }: any) => <div>{children}</div>,
}))
jest.mock('features/inventory/utils/NFTCardHelper', () => ({
  NFTCardSingleCardPrep: (asset: any) => ({ assetId: { name: asset.asset_id } }),
}))
jest.mock('features/mining/components/MiningNFTCard/MiningNFTCard', () => ({
  MiningNFTCard: ({ asset, inUseDisabled }: any) => (
    <div data-testid="tool-card" data-in-use={!inUseDisabled}>
      {asset.assetId.name}
    </div>
  ),
}))
jest.mock('features/mining/components/FilterByToolTypeSelector', () => ({
  FilterByToolTypeSelector: () => null,
}))
jest.mock('shared/components/SortBySelector/SortBySelector', () => ({
  SortBySelector: ({ defaultValue }: any) => <div data-testid="sort-by">{defaultValue.name}</div>,
}))

let mockAvailable: string[]
jest.mock('features/mining/hooks/useFilteredMiningAssets', () => ({
  useFilteredMiningAssets: () => ({
    assets: mockAvailable.map((id) => ({ assetId: { name: id }, type: { name: 'Tool' } })),
  }),
}))

const setBag = jest.fn()
const setAssetsFilter = jest.fn()

const setup = (
  bag: string[],
  slot = MiningToolsActiveSlotNumber.SLOT_ONE,
  assetsFilter: any = { reversed: false }
) => {
  mockStore({
    state: { atomic: { bagAssets: bag.map((id) => ({ asset_id: id })), assetsFilter } },
    actions: { wax: { setBag }, atomic: { setAssetsFilter } },
  })
  useModalStore.setState({ miningToolsDrawer: { isOpen: true, activeSlotIndex: slot } })
  return renderWithChakra(<MiningToolsDrawer />)
}

const toolIds = () => screen.getAllByTestId('tool-card').map((x) => x.textContent)

beforeEach(() => {
  jest.clearAllMocks()
  mockAvailable = ['a', 'b', 'c', 'd']
})

describe('MiningToolsDrawer', () => {
  it('shows the slot number', () => {
    setup([], MiningToolsActiveSlotNumber.SLOT_THREE)

    expect(screen.getByText('Tool Slot #3')).toBeInTheDocument()
  })

  it('lists available tools, hiding ones equipped in other slots', () => {
    setup(['a', 'b'], MiningToolsActiveSlotNumber.SLOT_ONE)

    expect(toolIds()).toEqual(['a', 'c', 'd'])
    expect(screen.getAllByTestId('tool-card').map((x) => x.getAttribute('data-in-use'))).toEqual([
      'true',
      'false',
      'false',
    ])
  })

  it('adds a tool to an empty slot', async () => {
    setup(['a'], MiningToolsActiveSlotNumber.SLOT_TWO)

    await userEvent.click(screen.getByText('c'))

    expect(setBag).toHaveBeenCalledWith(['a', 'c'])
  })

  it('swaps the tool in the slot', async () => {
    setup(['a', 'b'], MiningToolsActiveSlotNumber.SLOT_TWO)

    await userEvent.click(screen.getByText('c'))

    expect(setBag).toHaveBeenCalledWith(['a', 'c'])
  })

  it('does nothing when the equipped tool is clicked', async () => {
    setup(['a'], MiningToolsActiveSlotNumber.SLOT_ONE)

    await userEvent.click(screen.getByText('a'))

    expect(setBag).not.toHaveBeenCalled()
  })

  it('removes the tool from the slot', async () => {
    setup(['a', 'b'], MiningToolsActiveSlotNumber.SLOT_ONE)

    await userEvent.click(screen.getByRole('button', { name: 'Remove Tool' }))

    expect(setBag).toHaveBeenCalledWith(['b'])
  })

  it('hides Remove Tool for an empty slot', () => {
    setup([], MiningToolsActiveSlotNumber.SLOT_ONE)

    expect(screen.queryByRole('button', { name: 'Remove Tool' })).not.toBeInTheDocument()
  })

  it('toggles the sort direction', async () => {
    setup([], MiningToolsActiveSlotNumber.SLOT_ONE, { sortBy: 1, reversed: false })

    await userEvent.click(screen.getByRole('button', { name: 'A-Z' }))

    expect(setAssetsFilter).toHaveBeenCalledWith({ sortBy: 1, reversed: true })
  })

  it('defaults the sort to name outside the tools page', () => {
    setup([])

    expect(within(screen.getByTestId('sort-by')).getByText('Name')).toBeInTheDocument()
  })

  it('closes through the modal store', async () => {
    setup([])

    await userEvent.click(screen.getByRole('button', { name: 'Close' }))

    expect(useModalStore.getState().miningToolsDrawer.isOpen).toBe(false)
  })
})
