import { SlotVariant } from 'features/mining/types/LandownerTypes'
import {
  buildApplyMainBoostActions,
  buildBoostSlotActions,
  buildSetCommissionActions,
  buildSetMinBoostActions,
  buildShineActions,
  buildUnlockSlotActions,
} from 'features/mining/utils/miningActions'
import { getInitialAssetsState, useAssetsStore } from 'shared/store/assetsStore'
import { useSessionStore } from 'shared/store/sessionStore'

import { getInitialMiningState, useMiningStore } from './miningStore'

const mockTransact = jest.fn()
jest.mock('shared/wax/transact', () => ({
  transact: (actions: unknown) => mockTransact(actions),
}))

const mockGetAssetById = jest.fn()
jest.mock('shared/util/atomicassets', () => ({
  getAssetById: (id: string) => mockGetAssetById(id),
}))

const mockFetchLandBoostsByDay = jest.fn()
jest.mock('features/mining/utils/landBoosts', () => ({
  ...jest.requireActual('features/mining/utils/landBoosts'),
  fetchLandBoostsByDay: (...args: unknown[]) => mockFetchLandBoostsByDay(...args),
}))

const mockToastMessage = jest.fn()
const mockToastErrorMessage = jest.fn()
jest.mock('shared/util/toast', () => ({
  toastMessage: (message: string) => mockToastMessage(message),
  toastErrorMessage: (message: string) => mockToastErrorMessage(message),
}))

const mockScheduleSync = jest.fn()
jest.mock('shared/store/syncScheduler', () => ({
  scheduleSync: (...args: unknown[]) => mockScheduleSync(...args),
}))

const realStore = useMiningStore.getState()

beforeEach(() => {
  jest.clearAllMocks()
  mockTransact.mockResolvedValue({})
  useSessionStore.getState().setWalletId('owner.wam')
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

describe('miningStore land management', () => {
  const land = { asset_id: '42', data: { openslots: 2 }, mutable_data: { landrating: '99' } }
  const boosts = [{ name: 'Small Boost', booster: 'bob.wam', percentage: 0.03, price: 4 }]

  it('loads the managed land, its boosts and slots, and syncs its rating', async () => {
    const realAssets = useAssetsStore.getState()
    useAssetsStore.setState(
      { ...realAssets, ...getInitialAssetsState(), assets: [{ asset_id: '42' }] as any },
      true
    )
    mockGetAssetById.mockResolvedValue(land)
    mockFetchLandBoostsByDay.mockResolvedValue(boosts)
    useMiningStore.getState().setLandId('42')

    await useMiningStore.getState().loadManagingLandDetailsAndBoosts()

    const mining = useMiningStore.getState()
    expect(mockFetchLandBoostsByDay).toHaveBeenCalledWith('42', expect.any(Number))
    expect(mining.managingLandDetails).toBe(land)
    expect(mining.managingLandBoosts).toBe(boosts)
    expect(mining.managingLandBoostFullSlots.slice(0, 3).map((x) => x.mod)).toEqual([
      SlotVariant.USED,
      SlotVariant.ADD,
      SlotVariant.LOCKED,
    ])
    expect(mining.isLoadingManagingLandBoosts).toBe(false)
    expect(useAssetsStore.getState().assets[0].mutable_data.landrating).toBe('99')
  })

  it('keeps the previous boosts when the boost read fails', async () => {
    useMiningStore.setState({ managingLandId: '42', managingLandBoosts: boosts as any })
    mockGetAssetById.mockResolvedValue(land)
    mockFetchLandBoostsByDay.mockResolvedValue(null)

    await useMiningStore.getState().loadManagingLandDetailsAndBoosts()

    expect(useMiningStore.getState().managingLandBoosts).toBe(boosts)
  })

  it('does nothing without a managed land', async () => {
    await useMiningStore.getState().loadManagingLandDetailsAndBoosts()

    expect(mockGetAssetById).not.toHaveBeenCalled()
    expect(useMiningStore.getState().isLoadingManagingLandBoosts).toBe(false)
  })

  it('waits 6s before reloading after a transaction', async () => {
    jest.useFakeTimers()
    useMiningStore.setState({ managingLandId: '42' })
    mockGetAssetById.mockResolvedValue(land)
    mockFetchLandBoostsByDay.mockResolvedValue([])

    const reload = useMiningStore.getState().loadManagingLandDetailsAndBoostsWithDelay()
    expect(mockGetAssetById).not.toHaveBeenCalled()
    jest.advanceTimersByTime(6000)
    await reload

    expect(mockGetAssetById).toHaveBeenCalledWith('42')
    jest.useRealTimers()
  })
})

describe('miningStore transactions', () => {
  const ON_CHAIN =
    'Executing transaction on the chain. This process may take a few seconds to complete..'

  describe('tryShine', () => {
    const shineData: any = { info: { cost: '40.0000 TLM' } }

    it('shines and asks for the assets, avatar and bag to reload', async () => {
      const isSuccess = await useMiningStore
        .getState()
        .tryShine({ itemIds: ['1', '2', '3', '4'], shineData })

      expect(isSuccess).toBe(true)
      expect(mockTransact).toHaveBeenCalledWith(
        buildShineActions('owner.wam', ['1', '2', '3', '4'], shineData)
      )
      expect(mockToastMessage).toHaveBeenCalledWith('Shining in progress..')
      expect(mockScheduleSync).toHaveBeenCalledWith(['assets', 'avatar', 'bag'], 15)
      expect(useMiningStore.getState().isShining).toBe(false)
    })

    it('shows the error and unlocks the page when the transaction fails', async () => {
      mockTransact.mockRejectedValue(new Error('rejected'))

      const isSuccess = await useMiningStore.getState().tryShine({ itemIds: ['1'], shineData })

      expect(isSuccess).toBe(false)
      expect(mockToastErrorMessage).toHaveBeenCalledWith('Error: rejected')
      expect(useMiningStore.getState().isShining).toBe(false)
      expect(mockScheduleSync).not.toHaveBeenCalled()
    })
  })

  it('sets the commission and asks for planets, land and assets to reload', async () => {
    await useMiningStore.getState().trySetCommission({ landId: '42', commission: '1250' })

    expect(mockTransact).toHaveBeenCalledWith(buildSetCommissionActions('owner.wam', '42', '1250'))
    expect(mockToastMessage).toHaveBeenCalledWith('Land Commission updated successfully.')
    expect(mockScheduleSync).toHaveBeenCalledWith(['planets', 'land', 'assets'], 15)
  })

  it.each<[string, () => Promise<boolean>, unknown]>([
    [
      'boostSlot',
      () => useMiningStore.getState().boostSlot({ landId: '42', price: 4 }),
      buildBoostSlotActions('owner.wam', '42', '4.0000 TLM'),
    ],
    [
      'unlockSlot',
      () => useMiningStore.getState().unlockSlot({ landId: '42', cost: 420 }),
      buildUnlockSlotActions('owner.wam', '42', '420.0000 TLM'),
    ],
    [
      'applyMainBoost',
      () =>
        useMiningStore
          .getState()
          .applyMainBoost({ landId: '42', boost: { asset_id: '7', name: 'MEGA Boost' } as any }),
      buildApplyMainBoostActions('owner.wam', '42', { asset_id: '7', name: 'MEGA Boost' } as any),
    ],
    [
      'setMinBoost',
      () => useMiningStore.getState().setMinBoost({ landId: '42', levelPrice: 16 }),
      buildSetMinBoostActions('owner.wam', '42', '16.0000 TLM'),
    ],
  ])('%s signs the transaction and reports it is on its way', async (_, run, actions) => {
    expect(await run()).toBe(true)
    expect(mockTransact).toHaveBeenCalledWith(actions)
    expect(mockToastMessage).toHaveBeenCalledWith(ON_CHAIN)
  })

  it.each<[string, () => Promise<boolean>]>([
    ['boostSlot', () => useMiningStore.getState().boostSlot({ landId: '42', price: 4 })],
    ['unlockSlot', () => useMiningStore.getState().unlockSlot({ landId: '42', cost: 420 })],
    ['setMinBoost', () => useMiningStore.getState().setMinBoost({ landId: '42', levelPrice: 16 })],
  ])('%s shows the error and resolves false when it fails', async (_, run) => {
    mockTransact.mockRejectedValue(new Error('overdrawn balance'))

    expect(await run()).toBe(false)
    expect(mockToastErrorMessage).toHaveBeenCalledWith('Error: overdrawn balance')
    expect(mockToastMessage).not.toHaveBeenCalled()
  })
})
