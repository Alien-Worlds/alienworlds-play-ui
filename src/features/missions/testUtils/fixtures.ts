import { bindMissionView } from 'store/missions/helpers'
import {
  Explorer,
  InvestInfo,
  Mission,
  MissionAttributes,
  MissionRarity,
  MissionStatus,
  MissionType,
  PinataNft,
  TraitType,
} from 'store/missions/types'

// Mission fixtures for the missions tests. Times are relative to now, so a mission built with a
// status keeps it for the length of a test (each window is at least an hour).

const HOUR = 3600

export const epochNow = () => Math.floor(Date.now() / 1000)

const timesFor = (status: MissionStatus) => {
  const now = epochNow()
  switch (status) {
    case MissionStatus.Soon:
      return { boardingTime: now + HOUR, launchTime: now + 2 * HOUR, endTime: now + 3 * HOUR }
    case MissionStatus.Departed:
      return { boardingTime: now - 2 * HOUR, launchTime: now - HOUR, endTime: now + HOUR }
    case MissionStatus.Completed:
      return { boardingTime: now - 3 * HOUR, launchTime: now - 2 * HOUR, endTime: now - HOUR }
    case MissionStatus.Boarding:
    default:
      return { boardingTime: now - HOUR, launchTime: now + HOUR, endTime: now + 2 * HOUR }
  }
}

export const buildPinata = ({
  name = 'Mission NFT',
  rarity = MissionRarity.Rare,
  series = 1,
  cardNumber = 1,
  image = 'https://ipfs.io/ipfs/nft-image',
}: {
  name?: string
  rarity?: MissionRarity
  series?: number
  cardNumber?: number
  image?: string
} = {}): PinataNft => ({
  name,
  description: `${name} description`,
  image,
  attributes: [
    { trait_type: TraitType.Rarity, value: rarity },
    { trait_type: TraitType.Series, value: series },
    { trait_type: TraitType.CardNumber, value: cardNumber },
    { trait_type: TraitType.BasePower, value: 10 },
    { trait_type: TraitType.BoostPower, value: 2 },
    { trait_type: TraitType.EquivPartType, value: 'Key A' },
  ],
})

export const buildInvestInfo = (overrides: Partial<InvestInfo> = {}): InvestInfo => ({
  numberOfShips: 2,
  totalStakeBNB: 0,
  totalStakeTLM: 20000,
  withdrawn: false,
  ...overrides,
})

type BuildMission = {
  id?: string
  status?: MissionStatus
  attributes?: Partial<MissionAttributes>
  investInfo?: InvestInfo
  pinataNft?: PinataNft | null
  /** Leave the mission without a `view`, as the API returns it. */
  raw?: boolean
}

export const buildMission = ({
  id = '1',
  status = MissionStatus.Boarding,
  attributes = {},
  investInfo,
  pinataNft = buildPinata(),
  raw = false,
}: BuildMission = {}): Mission => {
  const mission: Mission = {
    id,
    type: 'missions',
    attributes: {
      ...timesFor(status),
      description: `Mission ${id} description`,
      duration: 2 * HOUR,
      missionPower: 0,
      missionType: MissionType.Explore,
      name: `Mission ${id}`,
      nftContract: '0xnft',
      nftTokenURI: `ipfs-hash-${id}`,
      reward: 1000000,
      spaceshipCost: 10000,
      totalShips: 10,
      ...(investInfo ? { investInfo } : {}),
      ...attributes,
    },
    ...(pinataNft ? { pinataNft } : {}),
  }
  return raw ? mission : bindMissionView(mission)
}

export const buildExplorer = (missions: Mission[], id = 'explorer-1'): Explorer => ({
  id,
  type: 'explorers',
  attributes: {
    address: '0xabc',
    missions,
    totalInvestInfo: { totalStakeBNB: 0, totalStakeTLM: 0 },
  },
})

export const buildUserWallet = (address = '0xabc0000000000000000000000000000000000001') => ({
  label: 'MetaMask',
  provider: {},
  accounts: [{ address }],
})
