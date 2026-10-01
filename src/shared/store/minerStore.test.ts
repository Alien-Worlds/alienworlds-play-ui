import { useSessionStore } from 'shared/store/sessionStore'

import { getInitialMinerState, useMinerStore } from './minerStore'

const realStore = useMinerStore.getState()
const miner: any = { current_land: '42', last_mine: '2026-09-30T12:00:00' }
const land = (name: string): any => ({ data: { name } })

beforeEach(() => {
  useSessionStore.getState().setWalletId('miner.wam')
  useMinerStore.setState({ ...realStore, ...getInitialMinerState() }, true)
})

describe('useMinerStore', () => {
  it('starts on Naron, not onboarded', () => {
    expect(useMinerStore.getState()).toMatchObject({
      miner: null,
      planetSelectedForMining: 'naron',
      whereToMine: 'naron',
      isOnboarded: false,
    })
  })

  it('is onboarded once logged in with a miner', () => {
    useMinerStore.getState().setMiner(miner)

    expect(useMinerStore.getState().isOnboarded).toBe(true)
  })

  it('follows logging out and back in', () => {
    useMinerStore.getState().setMiner(miner)

    useSessionStore.getState().setWalletId(null)
    expect(useMinerStore.getState().isOnboarded).toBe(false)

    useSessionStore.getState().setWalletId('miner.wam')
    expect(useMinerStore.getState().isOnboarded).toBe(true)
  })

  it('browses the intended planet, falling back to the mining planet', () => {
    useMinerStore.getState().setPlanetSelectedForMiningIntent('kavian')
    expect(useMinerStore.getState().whereToMine).toBe('kavian')

    useMinerStore.getState().setPlanetSelectedForMiningIntent(null)
    expect(useMinerStore.getState().whereToMine).toBe('naron')
  })

  describe('setPlanetSelectedForMining', () => {
    beforeEach(() => useMinerStore.getState().setMiner(miner))

    it('uses the planet of the mining land', () => {
      useMinerStore.getState().setPlanetSelectedForMining(land('Plains on Kavian'))

      expect(useMinerStore.getState()).toMatchObject({
        planetSelectedForMining: 'kavian',
        whereToMine: 'kavian',
      })
    })

    it('maps Neri to its nerix id', () => {
      useMinerStore.getState().setPlanetSelectedForMining(land('Plains on Neri'))

      expect(useMinerStore.getState().planetSelectedForMining).toBe('nerix')
    })

    it('clears the planet without a mining land', () => {
      useMinerStore.getState().setPlanetSelectedForMining(null)

      expect(useMinerStore.getState().planetSelectedForMining).toBeNull()
    })

    it('clears the planet when not onboarded', () => {
      useMinerStore.getState().setMiner(null)

      useMinerStore.getState().setPlanetSelectedForMining(land('Plains on Kavian'))

      expect(useMinerStore.getState().planetSelectedForMining).toBeNull()
    })
  })
})
