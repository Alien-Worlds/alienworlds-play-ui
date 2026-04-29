export enum MissionType {
  Unknown = 0,
  Explore = 1,
  Battle = 2,
  Scouting = 3,
  Artifact = 4,
  Courier = 5,
  Liberation = 7,
  Recovery = 8,
  Supply = 6,
}

export type TotalInvestInfo = {
  totalStakeBNB: number
  totalStakeTLM: number
}

export type InvestInfo = {
  numberOfShips: number
  totalStakeBNB: number
  totalStakeTLM: number
  withdrawn: boolean
}

export type MissionAttributes = {
  boardingTime: number
  description: string
  duration: number
  endTime: number
  launchTime: number
  missionPower: number
  missionType: MissionType
  name: string
  nftContract: string
  nftTokenURI: string
  reward: number
  spaceshipCost: number
  totalShips: number
  investInfo?: InvestInfo
}

export type MissionView = {
  status: MissionStatus
  progressInPercentage: number
  time: number
  timeLabel: string
  duration: string
  series: string
  rewardPerShip: string
  rarity: MissionRarity
  cardNumber: string
  craftingKey: string
  basePower: string
  boostPower: string
  rarityColor: string
  hoverColor: string
  textColor: string
  statusColor: string
  stakedTlm: string
  stakedShips: number
}

export type Mission = {
  id: string
  type: string
  attributes: MissionAttributes
  pinataNft?: PinataNft
  view?: MissionView
}

export type ExplorerAttributes = {
  address: string
  missions: Mission[]
  totalInvestInfo: TotalInvestInfo
}

export type Explorer = {
  id: string
  type: string
  attributes: ExplorerAttributes
}

export enum TraitType {
  Rarity = 'Rarity',
  Series = 'Series',
  CardNumber = 'CardNumber',
  BasePower = 'BasePower',
  BoostPower = 'BoostPower',
  EquivPartType = 'EquivPartType',
  Shine = 'Shine',
}

export enum MissionRarity {
  Common = 'Common',
  Rare = 'Rare',
  Epic = 'Epic',
  Legendary = 'Legendary',
}

export enum MissionStatus {
  Completed = 'Completed',
  Boarding = 'Boarding',
  Soon = 'Soon',
  Departed = 'Departed',
}

export type PinataAttribute = {
  trait_type: TraitType
  value: string | number
  display_type?: string
}

export type PinataNft = {
  attributes: PinataAttribute[]
  description: string
  image: string
  name: string
}

export enum SortBy {
  Type,
  Id,
  Name,
  Series,
  Duration,
  Rewards,
  Rarity,
  Spacecrafts,
  Time,
  Status,
}
