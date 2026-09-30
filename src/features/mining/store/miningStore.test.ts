import { getInitialMiningState, useMiningStore } from './miningStore'

const realStore = useMiningStore.getState()

beforeEach(() => {
  useMiningStore.setState({ ...realStore, ...getInitialMiningState() }, true)
})

describe('miningStore land filter', () => {
  beforeEach(() => jest.useFakeTimers())
  afterEach(() => jest.useRealTimers())

  it('stores the land filter and reports loading briefly', () => {
    const filter = { ...getInitialMiningState().landAssetsFilter, owner: 'bob' }

    useMiningStore.getState().setLandAssetsFilter(filter)

    expect(useMiningStore.getState().landAssetsFilter).toEqual({ ...filter, isLoading: true })
    jest.advanceTimersByTime(200)
    expect(useMiningStore.getState().landAssetsFilter).toEqual({ ...filter, isLoading: false })
  })

  it('resets the land filter to the defaults', () => {
    useMiningStore.setState({
      landAssetsFilter: {
        ...getInitialMiningState().landAssetsFilter,
        owner: 'bob',
        sortBy: 'Owner',
      },
    })

    useMiningStore.getState().resetLandAssetsFilter()
    jest.advanceTimersByTime(200)

    expect(useMiningStore.getState().landAssetsFilter).toEqual(
      getInitialMiningState().landAssetsFilter
    )
  })
})

describe('miningStore setters', () => {
  it('stores the owned land boost NFTs and the tool type', () => {
    const filterByToolType = { ...getInitialMiningState().filterByToolType, filterByOptions: [] }

    useMiningStore.getState().setOwnedLandBoostsAssets([{ asset_id: '1' }] as any)
    useMiningStore.getState().setFilterByToolType(filterByToolType)

    expect(useMiningStore.getState().ownedLandBoostsAssets).toEqual([{ asset_id: '1' }])
    expect(useMiningStore.getState().filterByToolType).toBe(filterByToolType)
  })

  it('sets the land filter loading flag', () => {
    useMiningStore.getState().setLandAssetsFilterLoading(true)

    expect(useMiningStore.getState().landAssetsFilter.isLoading).toBe(true)
  })
})
