import { renderHook } from '@testing-library/react'
import { mockStore } from 'features/mining/testUtils/mockStore'
import { useSessionStore } from 'shared/store/sessionStore'

import { useMiningUtils } from './useMiningUtils'

jest.mock('store', () => jest.requireActual('features/mining/testUtils/mockStore').storeMock)

const card = (id: string): any => ({ assetId: { name: id } })

const render = (bagAssets: any[] | null) => {
  mockStore({ state: { atomic: { bagAssets } } })
  return renderHook(() => useMiningUtils()).result.current
}

describe('useMiningUtils', () => {
  it('reports which assets are in the bag', () => {
    const utils = render([{ asset_id: '1' }, { asset_id: '2' }])

    expect(utils.isAssetEquipped('2')).toBe(true)
    expect(utils.isAssetEquipped('3')).toBe(false)
    expect(utils.getEquippedAssetCount()).toBe(2)
    expect(utils.getBagSlotAsset(1)).toEqual({ asset_id: '2' })
  })

  it('treats a missing bag as empty', () => {
    const utils = render(null)

    expect(utils.isAssetEquipped('1')).toBe(false)
    expect(utils.getEquippedAssetCount()).toBe(0)
    expect(utils.getBagSlotAsset(0)).toBeUndefined()
  })

  it('only lets an equipped asset go back into its own slot', () => {
    const utils = render([{ asset_id: '1' }])

    expect(utils.canEquipAsset(card('2'))).toBe(true)
    expect(utils.canEquipAsset(card('1'))).toBe(false)
    expect(utils.canEquipAsset(card('1'), card('1'))).toBe(true)
  })

  it('exposes the wallet id from the session store', () => {
    useSessionStore.getState().setWalletId('miner.wam')

    expect(render([]).walletId).toBe('miner.wam')
  })
})
