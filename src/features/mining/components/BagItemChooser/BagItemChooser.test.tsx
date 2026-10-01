import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { mockStore } from 'features/mining/testUtils/mockStore'
import { MiningToolsActiveSlotNumber } from 'features/mining/types/MiningTypes'
import { useModalStore } from 'shared/store/modalStore'
import { useSessionStore } from 'shared/store/sessionStore'

import { BagItemChooser } from './BagItemChooser'

jest.mock('store', () => jest.requireActual('features/mining/testUtils/mockStore').storeMock)

jest.mock('@alien-worlds/uikit', () => ({
  NFTCard: ({ children, title }: any) => (
    <div data-testid="bag-card">
      <p>{title}</p>
      {children}
    </div>
  ),
  NFTCardTopRightPanel: () => null,
  NFTImage: () => null,
  NFTCardDetailsPanel: () => null,
  NFTCardBottomPanel: () => null,
  NFTPlanetComission: ({ disable }: any) => (
    <div data-testid="commission" data-disabled={disable} />
  ),
}))
jest.mock('features/inventory/utils/NFTCardHelper', () => ({
  NFTCardSingleCardPrep: (asset: any, walletId: string) => ({
    type: { name: asset.type },
    rarity: { name: 'common' },
    shine: { name: 'stone' },
    nftImage: { name: 'img' },
    walletId,
  }),
}))
jest.mock('features/inventory/utils/NFTCardOverlayRender', () => ({
  NFTCardBottomPanelRender: () => null,
  NFTCardDetailPanelRender: () => null,
  NFTCardTopRightPanelRender: () => null,
}))
jest.mock('features/mining/components/AddToBagPlaceholder', () => ({
  AddCardToBagPlaceholder: () => <div data-testid="empty-slot" />,
}))

const setup = (bagAssets: any[] | null, index = MiningToolsActiveSlotNumber.SLOT_TWO) => {
  mockStore({ state: { atomic: { bagAssets } } })
  return render(<BagItemChooser index={index} />)
}

beforeEach(() => {
  useSessionStore.getState().setWalletId('miner.wam')
  useModalStore.setState({ miningToolsDrawer: { isOpen: false, activeSlotIndex: 0 } })
})

describe('BagItemChooser', () => {
  it('shows the tool in its slot', () => {
    setup([{ type: 'Shovel' }, { type: 'Drill' }])

    expect(screen.getByText('Drill')).toBeInTheDocument()
    expect(screen.getByText('Change')).toBeInTheDocument()
    expect(screen.getByTestId('commission')).toHaveAttribute('data-disabled', 'true')
  })

  it('shows the commission for land in the slot', () => {
    setup([{ type: 'Shovel' }, { type: 'Land' }])

    expect(screen.getByTestId('commission')).toHaveAttribute('data-disabled', 'false')
  })

  it.each([
    ['the slot is empty', [{ type: 'Shovel' }]],
    ['there is no bag', null],
  ])('offers to set a tool when %s', (_, bag) => {
    setup(bag)

    expect(screen.getByTestId('empty-slot')).toBeInTheDocument()
    expect(screen.getByText('Set')).toBeInTheDocument()
  })

  it('opens the tools drawer for its slot', async () => {
    setup([])

    await userEvent.click(screen.getByText('Set'))

    expect(useModalStore.getState().miningToolsDrawer).toEqual({
      isOpen: true,
      activeSlotIndex: MiningToolsActiveSlotNumber.SLOT_TWO,
    })
  })
})
