import { Tournament } from 'graphql/hooks/useCompetitions'
import { DateTime } from 'luxon'

import { TournamentStatus } from '../types/competitionTypes'

export const DEFAULT_TOURNAMENT_IMAGE = 'images/tournament/card-artifact-1.png'
export const DEFAULT_COMPETITIONS_URL =
  'https://github.com/Alien-Worlds/the-alien-worlds-competitions'

export const formatUtc = (dateTime: string, format: string) =>
  DateTime.fromISO(dateTime, { zone: 'utc' }).toFormat(format)

export const hasUnclaimedReward = (tournament: Tournament, walletId: string) =>
  tournament?.players?.some((p) => p.player === walletId && !p.claimed) ?? false

export const canClaimReward = (tournament: Tournament | null, walletId?: string) =>
  tournament?.state === 'rewarding' && !!walletId && hasUnclaimedReward(tournament, walletId)

export const getCardOpacity = (status: TournamentStatus) => {
  if (status === TournamentStatus.COMPLETED) return 0.5
  if (status === TournamentStatus.PROCESSING) return 0.7
  return 1
}
