import { getVoteDecayColor, pluralize } from 'shared/util/helpers'

import { Text } from '@chakra-ui/react'

interface VoteDecayProps {
  voteDecay: number
}

export const VoteDecayPlanetDetails = ({ voteDecay }: VoteDecayProps) => {
  if (voteDecay && voteDecay > 0) {
    return (
      <>
        <Text
          fontFamily="tlm"
          letterSpacing="0.1em"
          color="grey"
          whiteSpace="nowrap"
          fontSize="md"
          mt="5px"
        >
          Vote Decay
        </Text>
        <Text
          fontSize="2xl"
          fontFamily="Orbitron"
          letterSpacing="0.1em"
          color={getVoteDecayColor(voteDecay)}
          whiteSpace="nowrap"
          mt="-5px"
        >
          {voteDecay}{' '}
          <span
            style={{
              fontFamily: 'Orbitron',
              fontSize: 12,
              color: getVoteDecayColor(voteDecay),
              fontWeight: 700,
              textTransform: 'uppercase',
              position: 'relative',
              top: -4,
              marginLeft: -5,
            }}
          >
            {pluralize(voteDecay, 'Day')}
          </span>
        </Text>
      </>
    )
  }
  return null
}
