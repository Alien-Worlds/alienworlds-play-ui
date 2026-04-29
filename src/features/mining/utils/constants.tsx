import { Colors } from 'shared/util/colors'

// There are another Rarity values but it is represented by using number
// 1. store/main/types.ts -> Rarity
// 2. src/util/land.ts -> rarityValues
// TODO: need to standardize the rarity values
export const NftRarity = {
  abundant: 'Abundant',
  common: 'Common',
  rare: 'Rare',
  epic: 'Epic',
  legendary: 'Legendary',
  mythic: 'Mythical',
}

export const RarityPoolColors = {
  [NftRarity.abundant]: Colors.SNOW_WHITE,
  [NftRarity.common]: Colors.SILVER_CHALICE,
  [NftRarity.rare]: Colors.ROYAL_BLUE,
  [NftRarity.epic]: Colors.ELECTRIC_VIOLET,
  [NftRarity.legendary]: Colors.GOLDER_GRASS,
  [NftRarity.mythic]: Colors.RAZZMATAZZ,
}

// Shared mining card dimensions
export const MINING_CARD_WIDTH_PX = 270
export const MINING_CARD_HEIGHT_PX = 400

// Shared asset type constants
export const ASSET_TYPE_LAND = 'Land'

export const BoostLevels = [
  {
    name: 'Small Boost',
    percentage: 0.03,
    price: 4,
  },
  {
    name: 'Lv 2 Boost',
    percentage: 0.05,
    price: 8,
  },
  {
    name: 'Medium Boost',
    percentage: 0.08,
    price: 16,
  },
  {
    name: 'Lv 4 Boost',
    percentage: 0.13,
    price: 32,
  },
  {
    name: 'High Boost',
    percentage: 0.21,
    price: 64,
  },
]

export const MainBoostLevels = [
  {
    name: 'MEGA Boost',
  },
  {
    name: 'SUPER Boost',
  },
]
