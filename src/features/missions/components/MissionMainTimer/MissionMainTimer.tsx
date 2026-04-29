import { Flex, Text } from '@chakra-ui/react'
import { useMissionTimes } from 'features/missions/hooks/useMissionTimes'
import { useAppState } from 'store'
import { MissionTypeIcon } from 'store/missions/helpers'
import { MissionStatus } from 'store/missions/types'

export const MissionMainTimer = () => {
  const {
    missions: { selectedMission },
  } = useAppState()

  const missionTimes = useMissionTimes(selectedMission)

  if (!selectedMission || !missionTimes) {
    return null
  }

  return (
    <Flex
      alignSelf={{ base: 'center', xl: 'flex-start' }}
      justifyContent={{ base: 'center', xl: 'space-between' }}
    >
      <Flex alignItems="center" pb="25px" w={{ base: 'initial', xl: '400px' }}>
        <Flex direction="column" mr={{ base: 3, md: 4, xl: 6 }}>
          <MissionTypeIcon
            type={selectedMission.attributes.missionType}
            boxSize={60}
            color={selectedMission.view.rarityColor}
          />
          <Text
            mb={3}
            color="white"
            lineHeight="tall"
            fontFamily="Titillium Web"
            fontWeight={300}
            textAlign="center"
            fontSize={{ base: '12px', md: '14px', xl: '18px' }}
          >
            ID: {selectedMission.id}
          </Text>
        </Flex>
        {selectedMission.view.status !== MissionStatus.Completed && (
          <Flex direction="column" gap="10px" w={{ md: '250px', xl: '300px' }}>
            <Text
              color={selectedMission.view.status === MissionStatus.Boarding ? 'white' : '#959595'}
              fontSize={{ base: '24px', sm: '30px', xl: '36px' }}
              lineHeight="32px"
              fontWeight={400}
              fontFamily="tlm"
            >
              {missionTimes.timeLabel}
            </Text>
            <Text
              color={selectedMission.view.status === MissionStatus.Boarding ? 'white' : '#959595'}
              fontSize={{ base: '16px', sm: '20px', xl: '24px' }}
              fontFamily="orb"
            >
              {missionTimes.humanizedTime}
            </Text>
          </Flex>
        )}
      </Flex>
    </Flex>
  )
}
