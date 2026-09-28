import { Tournament } from 'graphql/hooks/useCompetitions'

import { canClaimReward, formatUtc, getCardOpacity, hasUnclaimedReward } from './utils'
import { TournamentStatus } from '../types/competitionTypes'

const makeTournament = (overrides: Partial<Tournament> = {}) =>
  ({
    id: 1,
    state: 'rewarding',
    players: [
      { player: 'alice.wam', claimed: false },
      { player: 'bob.wam', claimed: true },
    ],
    ...overrides,
  } as Tournament)

describe('formatUtc', () => {
  it('formats an ISO timestamp in UTC regardless of the local zone', () => {
    expect(formatUtc('2026-03-05T23:30:00+02:00', 'dd.MM.yyyy HH:mm:ss')).toBe(
      '05.03.2026 21:30:00'
    )
  })
})

describe('hasUnclaimedReward', () => {
  it('is true for a player who has not claimed', () => {
    expect(hasUnclaimedReward(makeTournament(), 'alice.wam')).toBe(true)
  })

  it('is false for a player who already claimed', () => {
    expect(hasUnclaimedReward(makeTournament(), 'bob.wam')).toBe(false)
  })

  it('is false for a wallet that did not play', () => {
    expect(hasUnclaimedReward(makeTournament(), 'carol.wam')).toBe(false)
  })

  it('is false when the tournament has no players', () => {
    expect(hasUnclaimedReward(makeTournament({ players: undefined }), 'alice.wam')).toBe(false)
  })
})

describe('canClaimReward', () => {
  it('is true for a rewarding tournament with an unclaimed reward', () => {
    expect(canClaimReward(makeTournament(), 'alice.wam')).toBe(true)
  })

  it('is false when the tournament is not in the rewarding state', () => {
    expect(canClaimReward(makeTournament({ state: '5.complete' }), 'alice.wam')).toBe(false)
  })

  it('is false without a wallet or tournament', () => {
    expect(canClaimReward(makeTournament(), undefined)).toBe(false)
    expect(canClaimReward(null, 'alice.wam')).toBe(false)
  })
})

describe('getCardOpacity', () => {
  it('dims processing and completed cards', () => {
    expect(getCardOpacity(TournamentStatus.PROCESSING)).toBe(0.7)
    expect(getCardOpacity(TournamentStatus.COMPLETED)).toBe(0.5)
  })

  it('keeps active cards fully opaque', () => {
    expect(getCardOpacity(TournamentStatus.UPCOMING)).toBe(1)
    expect(getCardOpacity(TournamentStatus.PLAYING)).toBe(1)
    expect(getCardOpacity(TournamentStatus.CLAIMABLE)).toBe(1)
  })
})
