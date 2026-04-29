import { useEffect, useState, VFC } from 'react'

import { MissionCraftIcon } from '@alien-worlds/icons'
import { Box, Flex, Text } from '@chakra-ui/react'
import { filter } from 'lodash'
import { Colors } from 'shared/util/colors'
import { useAppState } from 'store'
import { MissionStatus } from 'store/missions/types'

export const MissionsCrafts: VFC = () => {
  const {
    missions: { explorer, availableMissions },
  } = useAppState()

  const [totalCurrentMissions, setTotalCurrentMissions] = useState<number>(0)

  useEffect(() => {
    if (explorer?.attributes?.missions) {
      const currentMissionsCount: number = filter(
        explorer.attributes.missions,
        (m) => m.view.status === MissionStatus.Departed
      )?.length
      setTotalCurrentMissions(currentMissionsCount)
    }
  }, [explorer])

  return (
    <Flex alignItems="flex-start">
      <Box w="50px" position="relative" fill={Colors.SNOW_WHITE}>
        <Box w="50px" mr={2} fill={Colors.SNOW_WHITE}>
          <MissionCraftIcon boxSize="40px" />
        </Box>
      </Box>
      <Flex direction="column" ml="10px">
        <Text fontSize="2xl" lineHeight={1} fontFamily="Orbitron" color={Colors.SNOW_WHITE}>
          {totalCurrentMissions} / {availableMissions?.length ?? 0}
        </Text>
        <Text
          fontSize="sm"
          color="#08a3dd"
          fontWeight="bold"
          letterSpacing="0.1em"
          fontFamily="Titillium Web"
        >
          Active Missions
        </Text>
      </Flex>
    </Flex>
  )
}
