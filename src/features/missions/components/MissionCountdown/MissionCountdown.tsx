import { Flex } from '@chakra-ui/react'
import { MissionTimer } from 'features/missions/components/MissionTimer/MissionTimer'
import { Colors } from 'shared/util/colors'
import { Mission } from 'store/missions/types'

type MissionCountdownProps = {
  mission: Mission | null
}

export const MissionCountdown = ({ mission }: MissionCountdownProps) => {
  if (!mission) return null

  return (
    <Flex w="140px" color={Colors.RADICAL_RED} pb="2px" justifyContent="end">
      <MissionTimer mission={mission} />
    </Flex>
  )
}
