export interface LandBoostLevel {
  name: string
  percentage?: number
  price?: number
}

export interface LandBoostsDay {
  landId: string
  boosts: LandBoost[]
}

export interface LandBoost extends LandBoostLevel {
  booster: string
}

export enum SlotVariant {
  // Unlocked slot with boost
  USED = 'used',
  // Unlocked slot without boost
  ADD = 'add',
  // The first Locked slot to be unlocked
  LOCKED = 'locked',
  // The rest of Locked slot
  EMPTY = 'empty',
}

export enum SlotSize {
  SM = 'sm',
  MD = 'md',
}

export interface LandSlot {
  mod: SlotVariant
  number: number
  name?: string
  origin?: string
  percentage?: number
}
