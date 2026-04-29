export interface MiningToolsDrawerState {
  isOpen: boolean
  activeSlotIndex: MiningToolsActiveSlotNumber
}

export enum MiningToolsActiveSlotNumber {
  SLOT_ONE,
  SLOT_TWO,
  SLOT_THREE,
}

export interface PlanetDetailsDrawerState {
  isOpen: boolean
}
export interface SyndicatesProposalDrawerState {
  isOpen: boolean
}
