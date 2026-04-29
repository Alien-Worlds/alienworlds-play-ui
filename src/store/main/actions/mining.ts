import { MiningToolsActiveSlotNumber } from 'features/mining/types/MiningTypes'
import { pipe } from 'overmind'
import { Context } from 'store/index'

export const openMiningToolsDrawer = pipe(
  ({ state }: Context, activeSlotIndex: MiningToolsActiveSlotNumber) => {
    state.main.miningToolsDrawer.isOpen = true
    state.main.miningToolsDrawer.activeSlotIndex = activeSlotIndex
  }
)

export const closeMiningToolsDrawer = pipe(({ state }: Context) => {
  state.main.miningToolsDrawer.isOpen = false
})

export const openPlanetDetailsDrawer = pipe(({ state }: Context) => {
  state.main.planetDetailsDrawer.isOpen = true
})

export const closePlanetDetailsDrawer = pipe(({ state }: Context) => {
  state.main.planetDetailsDrawer.isOpen = false
})

export const openSyndicatesProposalDrawer = pipe(({ state }: Context) => {
  state.main.syndicatesProposalDrawer.isOpen = true
})

export const closeSyndicatesProposalDrawer = pipe(({ state }: Context) => {
  state.main.syndicatesProposalDrawer.isOpen = false
})
