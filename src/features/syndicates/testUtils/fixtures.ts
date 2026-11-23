import { mergeWith } from 'lodash'

// Builders for the GraphQL responses the syndicates components read. Defaults describe Kavian, a
// voter who is a member with signed terms, 100 KAV available to stake and nothing staked yet.
// Overrides merge deeply; arrays replace.

const merge = <T>(base: T, overrides: unknown): T =>
  mergeWith({}, base, overrides, (_: unknown, value: unknown) =>
    Array.isArray(value) ? value : undefined
  )

export const buildCandidate = (overrides: Record<string, any> = {}): any =>
  merge(
    {
      candidate_name: 'cand1.wam',
      rank: 1,
      total_vote_power: 1000,
      is_active: true,
      number_voters: 3,
      avg_vote_time_stamp: '2026-11-01T00:00:00',
      running_weight_time: '',
      profile: {
        description: 'I will build things.',
        email: null,
        familyName: null,
        gender: null,
        givenName: 'Candidate One',
        image: 'https://img.test/cand1.png',
        timezone: null,
        url: null,
      },
      member_terms_version: 2,
      isSelected: false,
      isVoted: false,
      isVoteAdded: false,
      isSignedVoteRemoved: false,
      flagged: false,
      voteDecay: 1,
      rankIndex: 0,
      hasSignedCurrentDaoTerms: true,
    },
    overrides
  )

export const buildCustodian = (overrides: Record<string, any> = {}): any =>
  merge(
    {
      cust_name: 'cust1.wam',
      rank: 1,
      total_vote_power: 5000,
      number_voters: 10,
      avg_vote_time_stamp: '2026-11-01T00:00:00',
      profile: { givenName: 'Custodian One', image: 'https://img.test/cust1.png' },
    },
    overrides
  )

export const buildDaoDetails = (overrides: Record<string, any> = {}): any =>
  merge(
    {
      title: 'Kavian',
      dac_id: 'kavian',
      symbol: { sym: '4,KAV', contract: 'token.worlds' },
      owner: 'kavian.dac',
      dac_state: '0',
      refs: { planet_image: '', description: 'Kavian is a cold planet.', map_image: '' },
      candidates: { total_count: 0, candidates: [] },
      custodians: { total_count: 0, custodians: [] },
      member_terms: { version: 2, terms: 'ipfs://terms' },
      min_stake_time: '172800',
      // 180 days
      max_stake_time: '15552000',
      tlm_balances: [],
      supply: '1000000.0000 KAV',
      max_supply: '10000000000.0000 KAV',
      time_multiplier: '1',
    },
    overrides
  )

export const buildWalletDaoDetails = (overrides: Record<string, any> = {}): any =>
  merge(
    {
      dac_id: 'kavian',
      wallet: 'voter.wam',
      agreed_terms_version: 2,
      stake_details: {
        dao_token_balance: '0.0000 KAV',
        staked_amount: '0.0000 KAV',
        unstake_total: '0.0000 KAV',
        available_tlm_in_dao: '100.0000 KAV',
        // 2 days
        staked_delay: 172800,
        unstakes: [],
      },
      votes: { candidates: [] },
      vote_weight: { weight: 0 },
      user_status: 'member',
    },
    overrides
  )

export const buildDaoGlobals = (overrides: Record<string, any> = {}): any =>
  merge(
    {
      auth_threshold_high: 4,
      auth_threshold_low: 2,
      auth_threshold_mid: 3,
      budget_percentage: 150,
      initial_vote_quorum_percent: 1,
      lastclaimbudgettime: '2026-11-01T00:00:00',
      lastperiodtime: '2026-11-01T00:00:00',
      lockup_release_time_delay: 1,
      maxvotes: 2,
      met_initial_votes_threshold: true,
      number_active_candidates: 12,
      numelected: 5,
      periodlength: 604800,
      should_pay_via_service_provider: false,
      token_supply_theshold: 0,
      vote_quorum_percent: 1,
      lockupasset: { quantity: '50000.0000 TLM', contract: 'token.worlds' },
      requested_pay_max: { quantity: '0.0000 TLM', contract: 'token.worlds' },
    },
    overrides
  )

export const buildTreasury = (dacId: string, totals = '200000.0000'): any => ({
  dac_id: dacId,
  balances: [{ account: `${dacId}.dac`, balance: `${totals} TLM` }],
  totals,
})

// A proposal as ProposalsTableVirtualised hands it to ProposalDrawer.
export const buildFlattenedProposal = (overrides: Record<string, any> = {}): any =>
  merge(
    {
      id: '12',
      title: 'Fund the bridge',
      proposalName: 'bridgeprop1',
      createdBy: 'voter.wam',
      description: 'Build a bridge.',
      to: 'worker.wam',
      item: '100.0000',
      date: '2026-11-10T00:00:00',
      votes: 1,
      action: 'transfer',
      status: 'approvable',
      expiration: '2026-11-30T00:00:00',
      hasClaimBudget: false,
      totalVotes: 5,
      unpacked: {
        actions: [
          {
            account: 'alien.worlds',
            name: 'transfer',
            data: {
              from: 'kavian.dac',
              to: 'worker.wam',
              quantity: '100.0000 TLM',
              memo: 'Bridge',
            },
          },
        ],
      },
      approvals: [],
    },
    overrides
  )
