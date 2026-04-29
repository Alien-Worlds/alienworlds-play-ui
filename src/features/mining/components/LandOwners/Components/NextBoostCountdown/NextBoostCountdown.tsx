import { useState } from 'react'

import { InfoIcon2 } from '@alien-worlds/icons'
import { Flex, Text, Show } from '@chakra-ui/react'
import { useInterval } from 'react-use'
import { Colors } from 'shared/util/colors'
import { getDiffToStartOfNext25hDay, next25hDayDiffNow } from 'shared/util/helpers'
import { useActions } from 'store'

const NextBoostCountdown = () => {
  const {
    wax: { loadManagingLandDetailsAndBoostsWithDelay },
  } = useActions()
  const [timer, setTimer] = useState(getDiffToStartOfNext25hDay())

  useInterval(() => {
    setTimer(getDiffToStartOfNext25hDay())

    // Check less than equals 1 second then reload
    // reload will have 2s delay
    if (next25hDayDiffNow().toMillis() <= 1000) {
      loadManagingLandDetailsAndBoostsWithDelay()
    }
  }, 1000)

  return (
    <Flex alignItems="center" gap={2.5}>
      <Show above="lg">
        <InfoIcon2 boxSize={25} />
      </Show>
      <Flex flexDirection="column" w="100%" alignItems={{ base: 'center', lg: 'flex-start' }}>
        <Text fontWeight="semibold" fontSize="sm" textAlign="start" color={Colors.GRAY}>
          Next Boost Application:
        </Text>
        <Text
          fontFamily="Titillium Web"
          fontSize={24}
          letterSpacing="0.1em"
          textAlign="start"
          color={Colors.SNOW_WHITE}
          lineHeight="30px"
        >
          {timer}
        </Text>
      </Flex>
    </Flex>
  )
}

export { NextBoostCountdown }
