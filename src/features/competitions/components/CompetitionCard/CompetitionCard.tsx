import { AlienWorldsCommunityIcon, ShardsIcon, TriliumIcon } from '@alien-worlds/icons'
import { Button } from '@alien-worlds/uikit'
import { TournamentStatus } from 'features/competitions/types/competitionTypes'
import { DEFAULT_TOURNAMENT_IMAGE, getCardOpacity } from 'features/competitions/utils/utils'
import { Tournament } from 'graphql/hooks/useCompetitions'
import { Colors } from 'shared/util/colors'
import { getFormattedDate, truncateWithEllipsis } from 'shared/util/helpers'

interface Props {
  tournament: Tournament
  onCompetitionVisit: (tournament: Tournament) => void
  status: TournamentStatus
}

const CalendarIcon = () => (
  <svg viewBox="0 0 16 16" fill="none" className="h-4 w-4 shrink-0" aria-hidden="true">
    <g stroke="#D9A555" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 3.99984C2 3.26346 2.59695 2.6665 3.33333 2.6665H12.6667C13.403 2.6665 14 3.26346 14 3.99984V12.6665C14 13.4029 13.403 13.9998 12.6667 13.9998H3.33333C2.59695 13.9998 2 13.4029 2 12.6665V3.99984Z" />
      <path d="M2.66699 5.3335H13.3337" />
      <path d="M5.33301 8H7.99967" />
      <path d="M10.667 2V3.33333" />
      <path d="M5.33301 2V3.33333" />
    </g>
  </svg>
)

const TrophyIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 shrink-0" aria-hidden="true">
    <g stroke="white" strokeWidth="1.5">
      <path d="M6.75 4.75H17.25V12C17.25 14.8995 14.8995 17.25 12 17.25C9.10051 17.25 6.75 14.8995 6.75 12V4.75Z" />
      <path d="M12 17.5V21" />
      <path d="M8 21L16 21" />
      <path d="M3.75 6.75H6.25V11C6.25 11.6904 5.69036 12.25 5 12.25C4.30964 12.25 3.75 11.6904 3.75 11V6.75Z" />
      <path d="M17.75 6.75H20.25V11C20.25 11.6904 19.6904 12.25 19 12.25C18.3096 12.25 17.75 11.6904 17.75 11V6.75Z" />
    </g>
  </svg>
)

const Divider = () => <div className="h-px w-[232px]" style={{ backgroundColor: Colors.TUNDORA }} />

export const CompetitionCard = ({ tournament, onCompetitionVisit, status }: Props) => {
  const isActive = status === TournamentStatus.UPCOMING || status === TournamentStatus.PLAYING

  return (
    <div
      data-testid="competition-card"
      className="relative flex w-[272px] flex-col items-center rounded-xl p-1"
      style={{ background: Colors.BLACK_SOLID_100, opacity: getCardOpacity(status) }}
    >
      <div className="relative flex">
        <img
          src={tournament?.image || DEFAULT_TOURNAMENT_IMAGE}
          alt={tournament.title}
          className="h-[136px] w-[272px] rounded-xl object-cover object-[70%_30%]"
        />
        {/* Gradient overlay */}
        <div className="absolute left-0 top-0 h-full w-full rounded-xl bg-black/20" />
        <div className="absolute bottom-0 left-[30%] flex w-full">
          <div className="flex h-10 items-center justify-center">
            <AlienWorldsCommunityIcon color="white" width="45px" height="24px" />
            <svg viewBox="0 0 2 16" fill="none" className="h-4 w-4" aria-hidden="true">
              <path
                d="M1.25 0.820801V14.6492"
                stroke="white"
                strokeOpacity="0.5"
                strokeWidth="0.813433"
                strokeLinecap="round"
              />
            </svg>
            <p className="font-orb text-xs font-semibold" style={{ color: Colors.SNOW_WHITE }}>
              Ghubs
            </p>
          </div>
        </div>
      </div>
      <div className="flex h-[361px] flex-col items-center justify-evenly">
        <p
          className="text-center font-orb text-base font-extrabold"
          style={{ color: Colors.SNOW_WHITE }}
        >
          {tournament.title}
        </p>
        <p className="font-tlm text-xs font-semibold" style={{ color: Colors.GRAY_CHATEAU }}>
          Competition ID: {tournament.id}
        </p>
        <div className="flex w-full items-center justify-center gap-1">
          <CalendarIcon />
          <p className="font-tlm text-base font-bold" style={{ color: Colors.DI_SERRIA }}>
            {getFormattedDate(tournament.start_time, '.', false)} -{' '}
            {getFormattedDate(tournament.end_time, '.', false)}
          </p>
        </div>
        <p className="text-center font-tlm text-sm font-normal" style={{ color: Colors.SILVER }}>
          {truncateWithEllipsis(tournament.description, 100)}
        </p>
        <div className="flex items-center justify-center gap-2">
          <TrophyIcon />
          <p className="font-orb text-sm font-semibold" style={{ color: Colors.SNOW_WHITE }}>
            Rewards:
          </p>
        </div>
        <Divider />
        <div className="flex items-center justify-center gap-4">
          <div>
            <p
              className="text-center font-tlm text-[10px] font-semibold"
              style={{ color: Colors.SNOW_WHITE }}
            >
              Trillium
            </p>
            <div className="flex items-center gap-2">
              <TriliumIcon boxSize="16px" color={Colors.DI_SERRIA} />
              <p className="font-tlm text-base font-bold" style={{ color: Colors.DI_SERRIA }}>
                {tournament.winnings_budget}
              </p>
            </div>
          </div>
          <div className="h-6 w-px" style={{ backgroundColor: Colors.TUNDORA }} />
          <div>
            <p
              className="text-center font-tlm text-[10px] font-semibold"
              style={{ color: Colors.SNOW_WHITE }}
            >
              Shards
            </p>
            <div className="flex items-center gap-2">
              <ShardsIcon boxSize="16px" color={Colors.DI_SERRIA} />
              <p className="font-tlm text-base font-bold" style={{ color: Colors.DI_SERRIA }}>
                {tournament.shards_budget}
              </p>
            </div>
          </div>
        </div>
        <Divider />
        <div className="flex w-full flex-wrap justify-around gap-2">
          <Button
            size="sm"
            width={isActive ? '85%' : undefined}
            variant="tertiary"
            onClick={() => onCompetitionVisit(tournament)}
          >
            View details
          </Button>
          {isActive && (
            <Button
              size="sm"
              variant="primary"
              onClick={() => tournament?.url && window.open(tournament.url, '_blank')}
            >
              Visit
            </Button>
          )}
          <div>
            <p
              className="text-center font-tlm text-[10px] font-semibold"
              style={{ color: Colors.JUMBO }}
            >
              Participants
            </p>
            <p className="font-tlm text-base font-bold" style={{ color: Colors.SNOW_WHITE }}>
              {tournament.num_players} / {tournament.max_players}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
