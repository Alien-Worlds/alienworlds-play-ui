import { chakra, Text } from '@chakra-ui/react'
import { useMissionTimes } from 'features/missions/hooks/useMissionTimes'
import { Mission } from 'store/missions/types'

const MissionTimer = ({ mission }: { mission: Mission }) => {
  const missionTimes = useMissionTimes(mission)

  if (!missionTimes) {
    return null
  }

  return (
    <Text fontWeight={400} fontFamily="Titillium Web" w="140px">
      <chakra.span w="140px">
        <>
          {missionTimes.timeLabel}
          <br />
          {missionTimes.humanizedTime}
        </>
      </chakra.span>
    </Text>
  )
}

export { MissionTimer }
