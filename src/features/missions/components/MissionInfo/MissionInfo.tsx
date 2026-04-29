import { Box, Button, Text } from '@chakra-ui/react'
import { useMissionTimes } from 'features/missions/hooks/useMissionTimes'
import { motion } from 'framer-motion'
import { useMatch } from 'react-router-dom'
import { PagePath } from 'store/main/types'
import { Mission, MissionStatus } from 'store/missions/types'

const MotionButton = motion(Button)

const MissionInfo = ({ mission }: { mission: Mission }) => {
  const isMissionExplorerPage = useMatch(PagePath.MissionsExplorer)
  const missionTimes = useMissionTimes(mission)
  const status = missionTimes?.status ?? null

  if (!mission || !missionTimes || !status) {
    return null
  }

  return isMissionExplorerPage ? (
    <>
      {mission.attributes.investInfo?.withdrawn ? (
        <Text>Claimed</Text>
      ) : (
        <>
          {status === MissionStatus.Departed && (
            <Box
              h="30px"
              maxW="90px"
              backgroundColor="transparent"
              borderColor="white"
              borderWidth="2px"
            >
              <Box w={`${mission.view?.progressInPercentage}%`} h="full" backgroundColor="white" />
            </Box>
          )}
          {status === MissionStatus.Soon && <Text>{MissionStatus[status]}</Text>}
          {status === MissionStatus.Boarding && <Text>Stationed</Text>}
          {status === MissionStatus.Completed && (
            <>
              <MotionButton
                size="sm"
                whileHover={{ scale: 0.92 }}
                whileTap={{ scale: 0.9 }}
                borderColor="#0ed4a8"
                color="gray.800"
                letterSpacing="2px"
                variant="outline"
                fontFamily="Orbitron"
                fontWeight="thin"
                px={4}
                py={1}
                borderRadius={10}
                fontSize="14px"
                backgroundColor="#0ed4a8"
                _hover={{ backgroundColor: '#0ed4a8' }}
                _active={{ backgroundColor: '#0ed4a8' }}
              >
                Claim
              </MotionButton>
            </>
          )}
        </>
      )}
    </>
  ) : (
    <>
      {status === MissionStatus.Completed || status === MissionStatus.Departed ? (
        <>
          {' '}
          <Text fontSize="16px">{MissionStatus[status]}</Text>
        </>
      ) : (
        <MotionButton
          size="sm"
          whileHover={{ scale: 0.96 }}
          whileTap={{ scale: 0.93 }}
          borderColor="#e0e0e0"
          color="#e0e0e0"
          letterSpacing="2px"
          variant="outline"
          fontFamily="Orbitron"
          fontWeight="thin"
          px={4}
          py={1}
          borderRadius={10}
          borderWidth="2px"
          fontSize="14px"
          backgroundColor="transparent"
          _hover={{
            backgroundColor: '#e0e0e0',
            color: 'blackAlpha.800',
          }}
          _active={{
            backgroundColor: '#e0e0e0',
            color: 'blackAlpha.800',
          }}
        >
          Info
        </MotionButton>
      )}
    </>
  )
}

export { MissionInfo }
