import { renderHook } from '@testing-library/react'
import { mockStore } from 'features/mining/testUtils/mockStore'

import { useMiningCardInteractions } from './useMiningCardInteractions'

jest.mock('store', () => jest.requireActual('features/mining/testUtils/mockStore').storeMock)

const setBag = jest.fn()

const render = (bagAssets: any[] | null) => {
  mockStore({ state: { atomic: { bagAssets } }, actions: { wax: { setBag } } })
  return renderHook(() => useMiningCardInteractions()).result.current
}

const bag = [{ asset_id: '1' }, { asset_id: '2' }]

beforeEach(() => setBag.mockClear())

describe('useMiningCardInteractions', () => {
  it('adds a tool to the end of the bag', () => {
    render(bag).addToolToBag('3')

    expect(setBag).toHaveBeenCalledWith(['1', '2', '3'])
  })

  it('swaps the tool in the given slot', () => {
    render(bag).addToolToBag('3', { assetId: { name: '1' } })

    expect(setBag).toHaveBeenCalledWith(['3', '2'])
  })

  it('adds to the end when the slot tool is no longer in the bag', () => {
    render(bag).addToolToBag('3', { assetId: { name: '9' } })

    expect(setBag).toHaveBeenCalledWith(['1', '2', '3'])
  })

  it('adds to an empty bag', () => {
    render(null).addToolToBag('3')

    expect(setBag).toHaveBeenCalledWith(['3'])
  })

  it('removes a tool from the bag', () => {
    render(bag).removeToolFromBag('1')

    expect(setBag).toHaveBeenCalledWith(['2'])
  })

  it('clears the bag', () => {
    render(bag).clearBag()

    expect(setBag).toHaveBeenCalledWith([])
  })
})
