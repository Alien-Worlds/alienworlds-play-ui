import { FC } from 'react'

import {
  BattleIcon,
  MissionExploreIcon,
  MissionLiberationIcon,
  MissionRecoveryIcon,
  MissionScoutingIcon,
  MissionSupplyIcon,
  ArtifactIcon,
  RarityCardIcon,
  MissionCourierIcon,
} from '@alien-worlds/icons'
import { Box } from '@chakra-ui/react'
import { BigNumber } from 'ethers'
import { commify, formatUnits } from 'ethers/lib/utils'
import { find, isNil } from 'lodash'
import { Colors } from 'shared/util/colors'
import { humanizeMissionDuration } from 'shared/util/duration-humanizer'
import { formatNumber } from 'shared/util/numbers'

import {
  Mission,
  MissionAttributes,
  MissionRarity,
  MissionStatus,
  MissionType,
  MissionView,
  PinataNft,
  TraitType,
} from './types'

const findNftTraitByType = (nft: PinataNft, type: TraitType) => {
  if (nft === null || nft === undefined) return null

  return find(nft.attributes, (x) => x.trait_type === type) ?? null
}

const getRarity = (nft: PinataNft) => {
  const trait = findNftTraitByType(nft, TraitType.Rarity)

  return MissionRarity[trait?.value as keyof typeof MissionRarity]
}

const getRarityColor = (rarity: MissionRarity): string => {
  switch (rarity) {
    case MissionRarity.Epic:
      return '#9449db'
    case MissionRarity.Legendary:
      return '#d1772c'
    case MissionRarity.Rare:
      return '#07a3dd'
    case MissionRarity.Common:
    default:
      return '#c6c6c6'
  }
}

const getRarityIconColor = (rarity: MissionRarity) => {
  switch (rarity) {
    case MissionRarity.Epic:
      return 'linear-gradient(135deg, rgba(208,197,216,1) 0%,rgba(137,40,217,1) 100%)'
    case MissionRarity.Legendary:
      return 'linear-gradient(135deg, rgba(213,204,179,1) 1%,rgba(178,90,16,1) 100%)'
    case MissionRarity.Rare:
      return 'linear-gradient(135deg, rgba(152,195,230,1) 0%,rgba(6,154,209,1) 100%)'
    case MissionRarity.Common:
    default:
      return 'linear-gradient(135deg, rgba(231, 231, 231, 1) 0%, rgba(106, 106, 106, 1) 100%)'
  }
}

const getHoverColor = (rarity: MissionRarity): string => {
  switch (rarity) {
    case MissionRarity.Epic:
      return 'rgba(135, 35, 217, .3)'
    case MissionRarity.Legendary:
      return 'rgba(179, 92, 18, .3)'
    case MissionRarity.Rare:
      return 'rgba(8, 163, 221, .3)'
    case MissionRarity.Common:
    default:
      return 'rgba(170, 170, 170, .3)'
  }
}

const getTextColor = (status: MissionStatus): string => {
  switch (status) {
    // TODO and invested
    case MissionStatus.Boarding:
      return 'white'
    case MissionStatus.Departed:
      return '#ff3b52'
    case MissionStatus.Completed:
      return '#959595'
    case MissionStatus.Soon:
    default:
      return 'white'
  }
}

const getStatusColor = (status: MissionStatus): string => {
  switch (status) {
    case MissionStatus.Departed:
      return '#ff3b52'
    case MissionStatus.Completed:
      return '#959595'
    case MissionStatus.Boarding:
    case MissionStatus.Soon:
    default:
      return '#d9a555'
  }
}

const getSeries = (nft: PinataNft) => {
  const trait = findNftTraitByType(nft, TraitType.Series)
  return trait?.value.toString() ?? ''
}

const getBasePower = (nft: PinataNft) => {
  const trait = findNftTraitByType(nft, TraitType.BasePower)
  return trait?.value.toString() ?? ''
}

const getBoostPower = (nft: PinataNft) => {
  const trait = findNftTraitByType(nft, TraitType.BoostPower)
  return trait?.value.toString() ?? ''
}

const getCardNumber = (nft: PinataNft) => {
  const trait = findNftTraitByType(nft, TraitType.CardNumber)
  return trait?.value.toString() ?? ''
}

const getCraftingKey = (nft: PinataNft) => {
  const trait = findNftTraitByType(nft, TraitType.EquivPartType)
  return trait?.value.toString() ?? ''
}

export const isEmpty = (value: any): boolean => isNil(value) || value === 0

export const getMissionReward = (totalShips: number, reward: number) => {
  let missionReward: string

  if (isEmpty(reward)) missionReward = 'n/a'
  else missionReward = formatNumber(reward / 10000)

  return missionReward
}

export const getMissionSpacecrafts = (totalShips: number) => {
  const missionSpacecrafts: string = formatNumber(totalShips)

  return missionSpacecrafts
}

const getRewardPerShip = (mission: Mission) => {
  const { totalShips, reward } = mission.attributes

  if (isEmpty(reward)) {
    return 'n/a'
  }

  let rewardPerShip: number = reward / 10000

  if (totalShips > 0) {
    rewardPerShip = reward / 10000 / totalShips
  }
  return formatNumber(rewardPerShip)
}

const getStakedTlm = (mission: Mission) => {
  if (!mission.attributes.investInfo) return '0'

  return commify(formatUnits(mission.attributes.investInfo.totalStakeTLM, 4))
}

const getStakedShips = (mission: Mission) => {
  if (!mission.attributes.investInfo) return 0

  return mission.attributes.investInfo.totalStakeTLM / mission.attributes.spaceshipCost
}

const getProgressInPercentage = (mission: Mission) => {
  const departure = mission.attributes.launchTime
  const end = mission.attributes.endTime
  const diff = end - departure
  const now = Date.now() / 1000
  const nowDiff = now - departure

  return Math.min(Math.floor(nowDiff / (diff / 100)), 100)
}

export const getStatusAndTimes = (
  attributes: MissionAttributes
): { status: MissionStatus; time: number; timeLabel: string } => {
  const epochNow = Math.floor(Date.now() / 1000)

  if (attributes.endTime < epochNow) {
    return {
      status: MissionStatus.Completed,
      time: 0,
      timeLabel: '--',
    }
  }

  if (attributes.launchTime < epochNow) {
    return {
      status: MissionStatus.Departed,
      time: attributes.endTime - epochNow,
      timeLabel: 'Finishing in:',
    }
  }

  if (attributes.launchTime > epochNow && attributes.boardingTime < epochNow) {
    return {
      status: MissionStatus.Boarding,
      time: attributes.launchTime - epochNow,
      timeLabel: 'Starting in:',
    }
  }

  return {
    status: MissionStatus.Soon,
    time: attributes.boardingTime - epochNow,
    timeLabel: 'Boarding in:',
  }
}

export const bindMissionView = (mission: Mission) => {
  const times = getStatusAndTimes(mission.attributes)
  const rarity = getRarity(mission.pinataNft)
  const progressInPercentage =
    times.status === MissionStatus.Departed ? getProgressInPercentage(mission) : null

  const missionView: MissionView = {
    rarity,
    status: times.status,
    progressInPercentage,
    time: times.time,
    timeLabel: times.timeLabel,
    rarityColor: getRarityColor(rarity),
    duration: humanizeMissionDuration(mission.attributes.duration * 1000),
    series: getSeries(mission.pinataNft),
    basePower: getBasePower(mission.pinataNft),
    boostPower: getBoostPower(mission.pinataNft),
    cardNumber: getCardNumber(mission.pinataNft),
    craftingKey: getCraftingKey(mission.pinataNft),
    rewardPerShip: getRewardPerShip(mission),
    hoverColor: getHoverColor(rarity),
    textColor: getTextColor(times.status),
    statusColor: getStatusColor(times.status),
    stakedTlm: getStakedTlm(mission),
    stakedShips: getStakedShips(mission),
  }

  mission.view = missionView

  return mission
}

export const bindMissionViews = (missions: Mission[]) => {
  if (!missions) return
  missions.forEach((mission) => {
    bindMissionView(mission)
  })
}

export const getMaxShipsToLease = (tlmBalance: BigNumber, mission: Mission) => {
  const maxShips = Number(tlmBalance.toNumber() / mission.attributes.spaceshipCost)
  return Math.floor(maxShips)
}

export const MissionTypeIcon: FC<{ type: MissionType; color?: string; boxSize: number }> = ({
  type,
  color,
  boxSize,
}) => {
  const iconProps = { color, boxSize }
  const componentMap = {
    [MissionType.Artifact]: ArtifactIcon,
    [MissionType.Battle]: BattleIcon,
    [MissionType.Courier]: MissionCourierIcon,
    [MissionType.Explore]: MissionExploreIcon,
    [MissionType.Liberation]: MissionLiberationIcon,
    [MissionType.Recovery]: MissionRecoveryIcon,
    [MissionType.Scouting]: MissionScoutingIcon,
    [MissionType.Supply]: MissionSupplyIcon,
  }

  const Component = componentMap[type] || null
  return Component ? <Component {...iconProps} /> : <></>
}

export const getMissionRarityIcon = (rarity: MissionRarity) => {
  return (
    <Box w="35px" h="35px" transform="rotate(45deg)" background={getRarityIconColor(rarity)}>
      <Box transform="rotate(-45deg)">
        <RarityCardIcon boxSize={35} color={Colors.MINE_SHAFT} />
      </Box>
    </Box>
  )
}
