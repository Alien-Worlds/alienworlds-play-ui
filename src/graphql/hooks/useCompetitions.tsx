import { useQuery } from '@apollo/client'
import { COMPETITIONS_QUERY } from 'graphql/queries/competitions'
import { get } from 'lodash'

type TournamentRequest = {
  waxId: string
}
export type Player = {
  player: string
  reward_perc_x_100: number
  shards_perc_x_100: number
  live_score: number
  claimed: boolean
}

export type TournamentState =
  | 'preparing'
  | '1.playing'
  | '2.processing'
  | '3.auditing'
  | '4.rewarding'
  | '5.complete'
  | 'rejected'
  | 'expired'
  | 'deleting'
  | string
export type Tournament = {
  id: number
  admin: string
  title: string
  description: string
  winnings_budget: `${number} TLM`
  winnings_claimed: `${number} TLM`
  winnings_allocated_perc_x_100: string
  admin_pay_perc_x_100: string
  shards_budget: string
  shards_claimed: string
  shards_allocated_perc_x_100: string
  start_time: string
  end_time: string
  min_players: number
  max_players: number
  num_players: number
  state: TournamentState
  notice: string
  players: Player[]
  image: string | null
  url: string | null
  allow_late_registration: boolean
}
/** Matches API response 1:1 with UI tabs: Upcoming, Live, Processing, Get Rewards, Completed */
export type Competitions = {
  upcoming: Tournament[]
  live: Tournament[]
  processing: Tournament[]
  getRewards: Tournament[]
  completed: Tournament[]
}

const useCompetitions = ({ waxId }: TournamentRequest) => {
  const shouldFetch = waxId && waxId.length > 0
  const { data, loading, error, refetch } = useQuery(COMPETITIONS_QUERY, {
    variables: {
      player: waxId,
    },
    fetchPolicy: 'cache-first',
    skip: !shouldFetch,
  })

  const raw = get(data, 'tournaments', {}) as Competitions
  const tournaments: Competitions = {
    upcoming: raw.upcoming ?? [],
    live: raw.live ?? [],
    processing: raw.processing ?? [],
    getRewards: raw.getRewards ?? [],
    completed: raw.completed ?? [],
  }

  if (typeof window !== 'undefined') {
    console.log('[useCompetitions]', {
      shouldFetch,
      variables: { player: waxId },
      loading,
      error: error ? { message: error.message, graphQLErrors: error.graphQLErrors } : null,
      rawData: data,
      tournamentsCounts: {
        upcoming: tournaments.upcoming.length,
        live: tournaments.live.length,
        processing: tournaments.processing.length,
        getRewards: tournaments.getRewards.length,
        completed: tournaments.completed.length,
      },
    })
  }

  return { tournaments, loading, error, refetch }
}

export { useCompetitions }
