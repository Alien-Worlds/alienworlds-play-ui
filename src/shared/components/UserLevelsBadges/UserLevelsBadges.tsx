import {
  BadgeAssociateIcon,
  BadgeChampionIcon,
  BadgeExpertIcon,
  BadgeGrandMasterIcon,
  BadgeInitiateIcon,
  BadgeMasterIcon,
  BadgeNoviceIcon,
  BadgeOshiIcon,
  BadgePeacekeeperIcon,
  BadgeSkyriderIcon,
} from '@alien-worlds/icons'
import { ResponsiveValue, Text } from '@chakra-ui/react'

type UserBadgeTitleType = {
  levelId: number
  size?: string
  fontFamily?: string
  fontWeight?: string
  textAlign?: ResponsiveValue<any>
  letterSpacing?: string
}

const badgesNames = {
  '1': 'Novice',
  '2': 'Initiate',
  '3': 'Associate',
  '4': 'Peacekeeper',
  '5': 'Expert',
  '6': 'SkyRider',
  '7': 'Master',
  '8': 'Champion',
  '9': 'Grand Master',
  '10': 'Oshi Initiate',
}

/**
 * Badges have different default widths to look similar in size design wise
 * @param level
 * @param width
 * @param height
 * @constructor
 */
const BadgesMap = ({ level, width = null, height = null }): JSX.Element => {
  switch (level) {
    case 1:
    default:
      return <BadgeNoviceIcon width={width || '55px'} height={height || '75px'} />
    case 2:
      return <BadgeInitiateIcon width={width || '75px'} height={height || '75px'} />
    case 3:
      return <BadgeAssociateIcon width={width || '90px'} height={height || '75px'} />
    case 4:
      return <BadgePeacekeeperIcon width={width || '75px'} height={height || '75px'} />
    case 5:
      return <BadgeExpertIcon width={width || '95px'} height={height || '75px'} />
    case 6:
      return <BadgeSkyriderIcon width={width || '95px'} height={height || '75px'} />
    case 7:
      return <BadgeMasterIcon width={width || '75px'} height={height || '75px'} />
    case 8:
      return <BadgeChampionIcon width={width || '75px'} height={height || '75px'} />
    case 9:
      return <BadgeGrandMasterIcon width={width || '75px'} height={height || '75px'} />
    case 10:
      return <BadgeOshiIcon width={width || '75px'} height={height || '75px'} />
  }
}

const UserLevelsBadgeTitle = ({
  levelId,
  size,
  fontFamily = 'orb',
  fontWeight = 'bold',
  textAlign = 'center',
  letterSpacing = '0.1em',
}: UserBadgeTitleType): JSX.Element => {
  if (!levelId) return null
  const title = badgesNames[levelId]

  return title ? (
    <>
      <Text
        fontSize={size || 'small'}
        textAlign={textAlign}
        fontFamily={fontFamily}
        letterSpacing={letterSpacing}
        fontWeight={fontWeight}
      >
        {title}
      </Text>
    </>
  ) : (
    <></>
  )
}

const UserLevelsBadge = ({ levelId, isTitle = true, width = null, height = null }): JSX.Element => {
  if (!levelId) return null

  return BadgesMap ? (
    <>
      <BadgesMap level={levelId} width={width} height={height} />
      {isTitle && <UserLevelsBadgeTitle levelId={levelId} />}
    </>
  ) : (
    <></>
  )
}

export { UserLevelsBadge, BadgesMap, UserLevelsBadgeTitle }
