import { VFC } from 'react'

import { chakra, Text } from '@chakra-ui/react'
import { Duration } from 'luxon'
import { padZero } from 'shared/util/helpers'

const Clock: VFC<{ duration: Duration }> = ({ duration }) => {
  const time = duration.shiftTo('hours', 'minutes', 'seconds', 'milliseconds').toObject()
  const totalHours = duration.shiftTo('hours').toObject().hours
  const totalMinutes = duration.shiftTo('minutes').toObject().minutes
  const totalSeconds = duration.shiftTo('seconds').toObject().seconds

  return (
    <>
      <Text fontFamily="Orbitron" fontSize="2xl" color="white" lineHeight={1}>
        <chakra.span color={totalHours < 1 ? 'gray.600' : 'white'}>
          {padZero(time.hours)}
        </chakra.span>
        :
        <chakra.span color={totalMinutes < 1 ? 'gray.600' : 'white'}>
          {padZero(time.minutes)}
        </chakra.span>
        :
        <chakra.span color={totalSeconds === 0 ? 'gray.600' : 'white'}>
          {padZero(time.seconds)}
        </chakra.span>
      </Text>

      <Text
        fontFamily="Titillium Web"
        fontWeight="bold"
        letterSpacing="0.1em"
        fontSize="sm"
        whiteSpace="nowrap"
      >
        Next Mine Attempt
      </Text>
    </>
  )
}

export { Clock }
