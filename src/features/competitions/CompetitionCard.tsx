import { AlienWorldsCommunityIcon, ShardsIcon, TriliumIcon } from '@alien-worlds/icons'
import { Button } from '@alien-worlds/uikit'
import { Flex, Image, Box, Icon, Text } from '@chakra-ui/react'
import { Tournament } from 'graphql/hooks/useCompetitions'
import { Colors } from 'shared/util/colors'
import { getFormattedDate, truncateWithEllipsis } from 'shared/util/helpers'

export enum TournamentStatus {
  UPCOMING = 'upcoming',
  PLAYING = 'playing',
  PROCESSING = 'processing',
  CLAIMABLE = 'claimable',
  COMPLETED = 'completed',
}

interface Props {
  tournament: Tournament
  onCompetitionVisit: (tournament: Tournament) => void

  status: TournamentStatus
}

const isGreyedStatus = (status: TournamentStatus) => status === TournamentStatus.PROCESSING
const isCompletedStatus = (status: TournamentStatus) => status === TournamentStatus.COMPLETED

export const CompetitionCard = ({
  tournament,
  onCompetitionVisit,

  status,
}: Props) => {
  const greyed = isGreyedStatus(status)
  const completed = isCompletedStatus(status)

  return (
    <Flex
      width="272px"
      background={Colors.BLACK_SOLID_100}
      borderRadius="12px"
      position="relative"
      alignContent="center"
      p={1}
      flexDirection="column"
      alignItems="center"
      opacity={completed ? 0.5 : greyed ? 0.7 : 1}
    >
      <Flex position="relative">
        <Image
          src={tournament?.image || 'images/tournament/card-artifact-1.png'}
          width="272px"
          height="136px"
          borderRadius="12px"
          objectFit="cover"
          objectPosition="70% 30%"
        />
        {/* Gradient overlay */}
        <Box
          position="absolute"
          top={0}
          left={0}
          width="100%"
          height="100%"
          borderRadius="12px"
          background="linear-gradient( rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.2) )"
        />
        <Flex position="absolute" bottom={0} width="100%" left="30%">
          <Flex alignContent="center" justifyContent="center" alignItems="center" height="40px">
            <AlienWorldsCommunityIcon color="white" width="45px" height="24px" />
            <Icon viewBox="0 0 2 16">
              <path
                d="M1.25 0.820801V14.6492"
                stroke="white"
                strokeOpacity="0.5"
                strokeWidth="0.813433"
                strokeLinecap="round"
              />
            </Icon>
            <Text fontFamily="Orbitron" color={Colors.SNOW_WHITE} fontSize="12px" fontWeight={600}>
              Ghubs
            </Text>
          </Flex>
        </Flex>
      </Flex>
      <Flex
        justifyContent="space-evenly"
        flexDirection="column"
        height="361px"
        alignContent="center"
        alignItems="center"
      >
        <Text
          fontFamily="Orbitron"
          fontSize="16px"
          fontWeight={800}
          color={Colors.SNOW_WHITE}
          align="center"
        >
          {tournament.title}
        </Text>
        <Text
          fontFamily="Titillium Web"
          fontSize="12px"
          fontWeight={600}
          color={Colors.GRAY_CHATEAU}
        >
          Competition ID: {tournament.id}
        </Text>
        <Flex justifyContent="center" alignItems="center" width="100%" gap={1}>
          <Icon viewBox="0 0 16 16">
            <path
              d="M2 3.99984C2 3.26346 2.59695 2.6665 3.33333 2.6665H12.6667C13.403 2.6665 14 3.26346 14 3.99984V12.6665C14 13.4029 13.403 13.9998 12.6667 13.9998H3.33333C2.59695 13.9998 2 13.4029 2 12.6665V3.99984Z"
              stroke="#D9A555"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M2.66699 5.3335H13.3337"
              stroke="#D9A555"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M5.33301 8H7.99967"
              stroke="#D9A555"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M10.667 2V3.33333"
              stroke="#D9A555"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M5.33301 2V3.33333"
              stroke="#D9A555"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Icon>
          <Text
            color={Colors.DI_SERRIA}
            fontFamily="Titillium Web"
            fontSize="16px"
            fontWeight={700}
          >
            {' '}
            {getFormattedDate(tournament.start_time, '.', false)}
          </Text>

          <Text
            color={Colors.DI_SERRIA}
            fontFamily="Titillium Web"
            fontSize="16px"
            fontWeight={700}
          >
            {' '}
            -
          </Text>

          <Text
            color={Colors.DI_SERRIA}
            fontFamily="Titillium Web"
            fontSize="16px"
            fontWeight={700}
          >
            {' '}
            {getFormattedDate(tournament.end_time, '.', false)}
          </Text>
        </Flex>
        <Text
          color={Colors.SILVER}
          fontFamily="Titillium Web"
          fontSize="14px"
          fontWeight={400}
          align="center"
        >
          {truncateWithEllipsis(tournament.description, 100)}
        </Text>
        <Flex justifyContent="center" alignItems="center" gap={2}>
          <Icon viewBox="0 0 24 24">
            <path
              d="M6.75 4.75H17.25V12C17.25 14.8995 14.8995 17.25 12 17.25C9.10051 17.25 6.75 14.8995 6.75 12V4.75Z"
              stroke="white"
              strokeWidth="1.5"
            />
            <path d="M12 17.5V21" stroke="white" strokeWidth="1.5" />
            <path d="M12 17.5V21" stroke="white" strokeWidth="1.5" />
            <path d="M8 21L16 21" stroke="white" strokeWidth="1.5" />
            <path
              d="M3.75 6.75H6.25V11C6.25 11.6904 5.69036 12.25 5 12.25C4.30964 12.25 3.75 11.6904 3.75 11V6.75Z"
              stroke="white"
              strokeWidth="1.5"
            />
            <path
              d="M17.75 6.75H20.25V11C20.25 11.6904 19.6904 12.25 19 12.25C18.3096 12.25 17.75 11.6904 17.75 11V6.75Z"
              stroke="white"
              strokeWidth="1.5"
            />
          </Icon>
          <Text fontFamily="Orbitron" fontSize="14px" fontWeight={600} color={Colors.SNOW_WHITE}>
            Rewards:
          </Text>
        </Flex>
        <Box width="232px" height="1px" backgroundColor={Colors.TUNDORA}></Box>
        <Flex gap={4} alignItems="center" justifyContent="center" justifyItems="center">
          <Box>
            <Text
              fontFamily="Titillium Web"
              fontSize="10px"
              fontWeight={600}
              color={Colors.SNOW_WHITE}
              align="center"
            >
              Trillium
            </Text>
            <Flex alignItems="center" gap={2}>
              <TriliumIcon boxSize="16px" color={Colors.DI_SERRIA} />
              <Text
                fontFamily="Titillium Web"
                fontSize="16px"
                fontWeight={700}
                color={Colors.DI_SERRIA}
              >
                {tournament.winnings_budget}
              </Text>
            </Flex>
          </Box>
          <Box width="1px" height="24px" backgroundColor={Colors.TUNDORA}></Box>
          <Box>
            <Text
              fontFamily="Titillium Web"
              fontSize="10px"
              fontWeight={600}
              color={Colors.SNOW_WHITE}
              align="center"
            >
              Shards
            </Text>
            <Flex alignItems="center" gap={2}>
              <ShardsIcon boxSize="16px" color={Colors.DI_SERRIA} />
              <Text
                fontFamily="Titillium Web"
                fontSize="16px"
                fontWeight={700}
                color={Colors.DI_SERRIA}
              >
                {tournament.shards_budget}
              </Text>
            </Flex>
          </Box>
        </Flex>
        <Box width="232px" height="1px" backgroundColor={Colors.TUNDORA}></Box>
        <Flex justifyContent="space-around" gap={2} width="100%" flexWrap="wrap">
          {(status === TournamentStatus.UPCOMING || status === TournamentStatus.PLAYING) && (
            <>
              <Button
                size={'sm'}
                width="85%"
                variant={'tertiary'}
                onClick={() => onCompetitionVisit(tournament)}
              >
                View details
              </Button>
              <Button
                size={'sm'}
                variant={'primary'}
                onClick={() => tournament?.url && window.open(tournament.url, '_blank')}
              >
                Visit
              </Button>
            </>
          )}
          {status === TournamentStatus.CLAIMABLE && (
            <Button size={'sm'} variant={'tertiary'} onClick={() => onCompetitionVisit(tournament)}>
              View details
            </Button>
          )}

          {(status === TournamentStatus.PROCESSING || status === TournamentStatus.COMPLETED) && (
            <Button size={'sm'} variant={'tertiary'} onClick={() => onCompetitionVisit(tournament)}>
              View details
            </Button>
          )}

          <Box>
            <Text
              fontFamily="Titillium Web"
              fontSize="10px"
              fontWeight={600}
              color={Colors.JUMBO}
              align="center"
            >
              Participants
            </Text>
            <Text
              fontFamily="Titillium Web"
              fontSize="16px"
              fontWeight={700}
              color={Colors.SNOW_WHITE}
            >
              {tournament.num_players} / {tournament.max_players}
            </Text>
          </Box>
        </Flex>
      </Flex>
    </Flex>
  )
}
