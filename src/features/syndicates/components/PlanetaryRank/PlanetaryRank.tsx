import { LevelRing } from '@alien-worlds/uikit'
import { VStack } from '@chakra-ui/react'
import { useLevelNftRewards } from 'features/outpost/hooks/queries/useLevelNftRewards'
import { MemberTermsStatusBadge } from 'features/syndicates/components/MemberTermsStatusBadge/MemberTermsStatusBadge'
import { getLevelVariant, getNftImage, maleHumanAvatar } from 'shared/util/nft'

export const PlanetaryRank = ({ isTermsSigned, avatar }: { isTermsSigned: boolean; avatar }) => {
  const { currentLevelReward } = useLevelNftRewards()
  return (
    <VStack mr="10px">
      <MemberTermsStatusBadge isTermsSigned={isTermsSigned} positionOffset={3}>
        <LevelRing
          variant={getLevelVariant(currentLevelReward?.level)}
          radius={8.5}
          src={avatar ? getNftImage(avatar) : maleHumanAvatar}
          fallbackSrc={maleHumanAvatar}
        />
      </MemberTermsStatusBadge>
    </VStack>
  )
}
