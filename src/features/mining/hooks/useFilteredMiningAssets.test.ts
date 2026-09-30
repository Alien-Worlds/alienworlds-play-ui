import { renderHook } from '@testing-library/react'
import { mockStore } from 'features/mining/testUtils/mockStore'
import { ToolType } from 'store/atomic/types'

import { useFilteredMiningAssets } from './useFilteredMiningAssets'

jest.mock('store', () => jest.requireActual('features/mining/testUtils/mockStore').storeMock)

jest.mock('features/inventory/utils/NFTCardHelper', () => ({
  NFTCardDataPreparation: (list: any[]) => (list ?? []).map((x) => x.asset_id),
}))

const tool = (id: string, type: string) => ({
  asset_id: id,
  template: { immutable_data: { type } },
})

const assets = [tool('1', 'Manipulator'), tool('2', 'Exotool'), tool('3', 'Manipulator')]

const render = (atomic: Record<string, any>, currentBagAsset?: any) => {
  mockStore({ state: { atomic } })
  return renderHook(() => useFilteredMiningAssets({ currentBagAsset })).result.current.assets
}

const toolType = (filterBy: ToolType | null, name?: string) => ({
  filterByOptions: [],
  selectedFilterByOption: { filterBy, name },
})

describe('useFilteredMiningAssets', () => {
  it('returns every asset for the All tool type', () => {
    expect(
      render({ filteredAndSortedAssets: assets, filterByToolType: toolType(ToolType.ALL) })
    ).toEqual(['1', '2', '3'])
  })

  it('returns only the selected tool type', () => {
    expect(
      render({
        filteredAndSortedAssets: assets,
        filterByToolType: toolType(ToolType.MANIPULATOR, 'Manipulator'),
      })
    ).toEqual(['1', '3'])
  })

  it('returns an empty list when there are no assets', () => {
    expect(
      render({ filteredAndSortedAssets: null, filterByToolType: toolType(ToolType.ALL) })
    ).toEqual([])
  })

  // Current behaviour, pinned for the store migration. The "remove already equipped assets" step
  // passes raw assets to canEquipAsset, which reads the card field `assetId.name`, so it never
  // matches and tools already in the bag stay in the list.
  it('keeps tools that are already in the bag', () => {
    expect(
      render({
        filteredAndSortedAssets: assets,
        filterByToolType: toolType(ToolType.ALL),
        bagAssets: [{ asset_id: '2' }],
      })
    ).toEqual(['1', '2', '3'])
  })
})
