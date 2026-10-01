import { IAsset } from 'atomicassets/build/API/Explorer/Objects'
import { last, lowerCase, split } from 'lodash'
import { useSessionStore } from 'shared/store/sessionStore'
import { WaxMiner } from 'store/wax/types'
import { create } from 'zustand'

// The player's mining status: their miner record and the planet they mine on or are browsing.
// Shared because the layouts, the top bar and onboarding read it as well as mining.
// Formerly Overmind's wax.miner / planetSelectedForMining / whereToMineIntent and the derived
// wax.whereToMine / wax.isOnboarded, which are kept here as fields and recomputed on change.

export interface MinerState {
  /** The player's row in the mining contract; null until they have mined (not onboarded). */
  miner: WaxMiner | null
  /** The planet of the player's mining land. */
  planetSelectedForMining: string | null
  /** A planet the player picked to browse, overriding planetSelectedForMining. */
  whereToMineIntent: string | null
  /** whereToMineIntent if set, otherwise planetSelectedForMining. */
  whereToMine: string | null
  /** Logged in with a miner record. */
  isOnboarded: boolean
}

export interface MinerStore extends MinerState {
  setMiner: (miner: WaxMiner | null) => void
  /** Browse a planet's lands. Callers navigate to the Land page themselves. */
  setPlanetSelectedForMiningIntent: (planet: string | null) => void
  /** Sets planetSelectedForMining from the planet of the player's mining land. */
  setPlanetSelectedForMining: (landAsset: IAsset | null) => void
}

const DEFAULT_PLANET = 'naron'

export const getInitialMinerState = (): MinerState => ({
  miner: null,
  planetSelectedForMining: DEFAULT_PLANET,
  whereToMineIntent: null,
  whereToMine: DEFAULT_PLANET,
  isOnboarded: false,
})

const derive = (
  state: Pick<MinerState, 'miner' | 'planetSelectedForMining' | 'whereToMineIntent'>
) => ({
  whereToMine:
    state.whereToMineIntent !== null ? state.whereToMineIntent : state.planetSelectedForMining,
  isOnboarded: useSessionStore.getState().isLoggedIn && state.miner !== null,
})

export const useMinerStore = create<MinerStore>((set, get) => {
  const update = (patch: Partial<MinerState>) => {
    const next = { ...get(), ...patch }
    set({ ...patch, ...derive(next) })
  }

  return {
    ...getInitialMinerState(),

    setMiner: (miner) => update({ miner }),

    setPlanetSelectedForMiningIntent: (whereToMineIntent) => update({ whereToMineIntent }),

    setPlanetSelectedForMining: (landAsset) => {
      const { isLoggedIn } = useSessionStore.getState()

      if (!isLoggedIn || !get().isOnboarded || !landAsset) {
        update({ planetSelectedForMining: null })
        return
      }

      // Land names end with the planet, e.g. "Plains on Kavian".
      const planet = last(split(landAsset.data.name, ' '))
      const id = planet ? lowerCase(planet) : DEFAULT_PLANET
      update({ planetSelectedForMining: id === 'neri' ? 'nerix' : id })
    },
  }
})

// isOnboarded also depends on the login state.
useSessionStore.subscribe((session, previous) => {
  if (session.isLoggedIn !== previous.isLoggedIn) {
    const { miner } = useMinerStore.getState()
    useMinerStore.setState({ isOnboarded: session.isLoggedIn && miner !== null })
  }
})
