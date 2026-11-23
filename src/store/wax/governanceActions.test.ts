import { DateTime } from 'luxon'
import { createOvermindMock } from 'overmind'
import { namespaced } from 'overmind/config'
import { getDefaultSyncAi } from 'store/main/helpers'
import * as wax from 'store/wax'
import { RequestState } from 'store/wax/types'

// Characterisation tests for the syndicates part of Overmind's `wax` namespace: what each action
// sends, reads and writes today, so the move to Zustand can be checked against them. They run the
// real `wax` namespace with a stub `main` (only the state these actions touch) and a stub `atomic`;
// the full config pulls in the Wharf wallet plugins. The effects are mocked: their payloads are
// pinned in governanceEffects.test.ts.
//
// A failed transaction doesn't throw here: the effect stores the error in
// `wax.lastTransactionError` and the action reads it afterwards, so tests seed that field.

jest.mock('@wharfkit/session', () => ({
  APIClient: jest.fn(),
  Serializer: { objectify: jest.fn() },
}))
jest.mock('@waxio/waxjs/dist', () => ({ WaxJS: jest.fn() }))
jest.mock('eosjs', () => ({ JsonRpc: jest.fn() }))

const mockNavigate = jest.fn()
const mockLocation = { pathname: '/syndicates/kavian' }
jest.mock('routes', () => ({
  router: {
    navigate: (...args: unknown[]) => mockNavigate(...args),
    state: {
      get location() {
        return mockLocation
      },
    },
  },
}))

const mockToastMessage = jest.fn()
const mockToastErrorMessage = jest.fn()
jest.mock('store/main/actions', () => ({
  toastMessage: (message: string) => mockToastMessage(message),
  toastErrorMessage: (message: string) => mockToastErrorMessage(message),
}))

jest.mock('shared/util/analytics', () => ({ collectEvent: jest.fn() }))

const notDueSyncAi = () => {
  const syncAi = getDefaultSyncAi()
  Object.values(syncAi).forEach((info) => {
    info.executeAfter = DateTime.now().plus({ hours: 1 })
  })
  return syncAi
}

// Every wax effect a governance action can reach; createOvermindMock throws on the others.
const defaultWaxApi = () => ({
  initialize: jest.fn(),
  stake: jest.fn(async () => {}),
  unstake: jest.fn(async () => {}),
  cancelUnstake: jest.fn(async () => {}),
  stakeVotePower: jest.fn(async () => {}),
  unStakeVotePower: jest.fn(async () => {}),
  voteCandidates: jest.fn(async () => {}),
  getWhitelistStatus: jest.fn(async () => null),
  getWhiteListId: jest.fn(async () => null),
  verifyWhitelist: jest.fn(async () => null),
  getDAOInfo: jest.fn(async () => null),
  getRefundsInProgress: jest.fn(async () => []),
  signPlanetMemberTerms: jest.fn(async () => ({ transaction_id: 'tx' })),
  tryRegisterNewCandidate: jest.fn(async () => {}),
  activateNewCandidate: jest.fn(async () => {}),
  withdrawCandidate: jest.fn(async () => {}),
  updateCandidate: jest.fn(async () => {}),
  createNewCustodianProposal: jest.fn(async () => {}),
  changeDaoConfigs: jest.fn(async () => {}),
  changeElectionDuration: jest.fn(async () => {}),
  changeDTAPConfigs: jest.fn(async () => {}),
  createNewBudgetClaimProposal: jest.fn(async () => {}),
  cancelCustodianProposal: jest.fn(async () => {}),
  approveCustodianProposal: jest.fn(async () => {}),
  executeCustodianProposal: jest.fn(async () => {}),
})

type Setup = {
  waxState?: Record<string, any>
  mainState?: Record<string, any>
  api?: Record<string, any>
}

const setup = ({ waxState = {}, mainState = {}, api: apiOverrides = {} }: Setup = {}) => {
  const api = { ...defaultWaxApi(), ...apiOverrides }
  const config = namespaced({
    wax,
    main: {
      state: {
        syncAi: notDueSyncAi(),
        isFocusedWindow: true,
        isSigningDACTerms: false,
        autoExpireSigningDACTerms: null,
        autoExpireVoteDACCandidates: null,
        ...mainState,
      },
    },
  })
  const overmind = createOvermindMock(config as any, { wax: { api } }, (state: any) => {
    Object.assign(state.wax, { walletId: 'voter.wam', ...waxState })
  }) as any

  return {
    actions: overmind.actions.wax,
    state: overmind.state.wax,
    main: overmind.state.main,
    api,
  }
}

// Seconds until a sync slot is due; executeAfter moves it to now + delay.
const dueInSeconds = (info: { executeAfter: DateTime }) =>
  Math.round(info.executeAfter.diff(DateTime.now(), 'seconds').seconds)

const kavianDao: any = {
  dac_id: 'kavian',
  title: 'Kavian',
  symbol: { sym: '4,KAV', contract: 'token.worlds' },
}

beforeEach(() => {
  mockLocation.pathname = '/syndicates/kavian'
  jest.spyOn(console, 'error').mockImplementation(() => {})
})

afterEach(() => {
  jest.restoreAllMocks()
})

describe('initial state', () => {
  it('starts on Naron with the syndicates sidebar open and no DAO info', () => {
    const { state } = setup()

    expect(state.selectedDacId).toBe('naron')
    expect(state.isSyndicatesSidebarOpen).toBe(true)
    expect(state.selectedDrawerView).toBeNull()
    expect(state.actionProgressState).toBeNull()
    expect(state.votedCandidatesList).toEqual([])
    expect(state.selectedDacInfo).toBeNull()
    expect(state.currentDAOInfo).toBeNull()
    expect(state.userWhitelistStatus).toBeNull()
    expect(state.isUserWhiteListed).toBe(false)
    expect(state.proposalsFilter).toEqual({ sortBy: null, reversed: true })
  })

  it('never fills the candidate, custodian and proposal lists, it only resets them', () => {
    const { state, actions } = setup()

    expect(state.selectedDacCandidates).toBeNull()
    expect(state.selectedDacCustodians).toEqual([])
    expect(state.dacCustodianProposals).toEqual([])

    actions.resetCandidatesList()
    actions.resetCustodiansList()
    actions.resetCustodiansProposalsList()

    expect(state.selectedDacCandidates).toBeNull()
    expect(state.selectedDacCustodians).toBeNull()
    expect(state.dacCustodianProposals).toEqual([])
    expect(state.filterredAndSortedProposals).toEqual([])
  })

  it('never writes userStakedDAOTokens, so it stays 0', () => {
    expect(setup().state.userStakedDAOTokens).toBe(0)
  })
})

describe('UI state setters', () => {
  it('selects a DAO, ignoring an empty id', () => {
    const { state, actions } = setup()

    actions.setSelectedDacId('kavian')
    expect(state.selectedDacId).toBe('kavian')

    actions.setSelectedDacId('')
    actions.setSelectedDacId(null)
    expect(state.selectedDacId).toBe('kavian')
  })

  it('opens and closes the syndicates sidebar and picks the drawer view', () => {
    const { state, actions } = setup()

    actions.setIsSyndicatesSidebarOpen(false)
    expect(state.isSyndicatesSidebarOpen).toBe(false)
    actions.setIsSyndicatesSidebarOpen(true)
    expect(state.isSyndicatesSidebarOpen).toBe(true)

    actions.setSelectedDrawerView(2)
    expect(state.selectedDrawerView).toBe(2)
  })

  it('keeps the candidacy and custodian proposal payloads for the modals', () => {
    const { state, actions } = setup()
    const candidacy = { wallet: 'voter.wam', dacName: 'kavian' }
    const proposal = { proposalTitle: 'abc', uniqueID: 4 }

    actions.setDacCandidacyProposalPayload(candidacy)
    actions.setDacCustodianProposalPayload(proposal)
    actions.updateCandidancyProposal(candidacy)

    expect(state.dacCandidacyProposalPayload).toEqual(candidacy)
    expect(state.dacCustodianProposalPayload).toEqual(proposal)
    expect(state.generatedCandidancyProposal).toEqual(candidacy)

    actions.setDacCandidacyProposalPayload(null)
    expect(state.dacCandidacyProposalPayload).toBeNull()
  })

  it('replaces the voted candidates only when the list changes', () => {
    const { state, actions } = setup()
    const voted: any = [{ candidate_name: 'a.wam', isVoteAdded: true }]

    actions.updateVotedCandidates(voted)
    expect(state.votedCandidatesList).toEqual(voted)

    actions.updateVotedCandidates([{ candidate_name: 'b.wam', isVoted: true }])
    expect(state.votedCandidatesList).toEqual([{ candidate_name: 'b.wam', isVoted: true }])

    actions.updateVotedCandidates([])
    expect(state.votedCandidatesList).toEqual([])
  })

  it('resets the action progress', () => {
    const { state, actions } = setup({ waxState: { actionProgressState: RequestState.Succeeded } })

    actions.resetActionProgressState()

    expect(state.actionProgressState).toBeNull()
  })

  it('setProposalsFilter clears the sorted list and asks for a re-sort that has nothing to sort', () => {
    const { state, actions } = setup()

    actions.setProposalsFilter({ sortBy: 0, reversed: true })

    expect(state.proposalsFilter).toEqual({ sortBy: 0, reversed: true })
    expect(state.filterredAndSortedProposals).toBeNull()
    expect(state.triggerFilterAndSortProposals).toBe(true)

    // main.updateWorld runs this every second; the proposals list is never filled.
    actions.filterAndSortProposals()
    expect(state.filterredAndSortedProposals).toEqual([])
  })

  it('filterAndSortProposals does nothing off the syndicates pages', () => {
    mockLocation.pathname = '/inventory'
    const { state, actions } = setup({ waxState: { triggerFilterAndSortProposals: true } })

    actions.filterAndSortProposals()

    expect(state.filterredAndSortedProposals).toEqual([])
    expect(state.triggerFilterAndSortProposals).toBe(true)
  })
})

describe('wax.getDAOInfo', () => {
  const daoApiResult = (dacId: string) => [
    {
      dacId,
      symbol: { precision: 4, code: 'KAV' },
      dacTreasury: { balance: '200000.0000 TLM' },
      electionGlobals: {
        periodLength: 604800,
        lastPeriodTime: '2026-11-01T00:00:00',
        budgetPercentage: 150,
        totalVotesOnCandidates: '1234',
        numberActiveCandidates: '12',
        lockupAsset: { quantity: '50000.0000 TLM', contract: 'token.worlds' },
      },
    },
  ]

  it('loads the DAO and its union, and stores the processed election globals', async () => {
    const getDAOInfo = jest.fn(async (dacId: string) => daoApiResult(dacId))
    const { state, actions } = setup({ api: { getDAOInfo } })

    await actions.getDAOInfo('kavian')

    expect(getDAOInfo.mock.calls).toEqual([['kavian'], ['kavianunn']])
    expect(state.selectedDacInfo).toMatchObject({
      dac_id: 'kavian',
      dac_state: 0,
      lockupAsset: '50000.0000 TLM',
      totalVotesCandidates: '1234',
      totalActiveCandidates: '12',
      totalBudgetPercentage: 150,
      // trunc(150 * 200000 / 100 / 100)
      custodianBudget: 3000,
      symbol: { sym: '4,KAV' },
      dacTreasury: { balance: '200000.0000 TLM' },
    })
    expect(state.currentDAOInfo).toEqual(state.selectedDacInfo)
    expect(state.selectedUnionDacInfo).toMatchObject({ dac_id: 'kavianunn' })
  })

  it('asks the DAO API for an undefined union when given a union id', async () => {
    const getDAOInfo = jest.fn(async (dacId: string) => (dacId ? daoApiResult(dacId) : null))
    const { state, actions } = setup({ api: { getDAOInfo } })

    await actions.getDAOInfo('kavianunn')

    expect(getDAOInfo.mock.calls).toEqual([['kavianunn'], [undefined]])
    expect(state.selectedDacInfo).toMatchObject({ dac_id: 'kavianunn' })
    expect(state.selectedUnionDacInfo).toEqual({})
  })

  it('stores empty objects when the DAO API has nothing', async () => {
    const { state, actions } = setup()

    await actions.getDAOInfo('kavian')

    expect(state.selectedDacInfo).toEqual({})
    expect(state.currentDAOInfo).toEqual({})
    expect(state.selectedUnionDacInfo).toEqual({})
  })

  it('toasts when the request throws', async () => {
    const getDAOInfo = jest.fn(async () => {
      throw new Error('offline')
    })
    const { actions } = setup({ api: { getDAOInfo } })

    await actions.getDAOInfo('kavian')

    expect(mockToastErrorMessage).toHaveBeenCalledWith('offline')
  })
})

describe('wax.initializeOrReloadRefundsInProgress', () => {
  const dueRefunds = () => {
    const syncAi = notDueSyncAi()
    syncAi.refunds.executeAfter = DateTime.now().minus({ minutes: 1 })
    return syncAi
  }

  it('loads refunds every 2 minutes on the planet select page (nothing reads them)', async () => {
    mockLocation.pathname = '/syndicates'
    const getRefundsInProgress = jest.fn(async () => [{ id: 1 }])
    const { state, actions, main } = setup({
      api: { getRefundsInProgress },
      mainState: { syncAi: dueRefunds() },
    })

    await actions.initializeOrReloadRefundsInProgress()

    expect(getRefundsInProgress).toHaveBeenCalledTimes(1)
    expect(state.refundsInProgress).toEqual([{ id: 1 }])
    expect(dueInSeconds(main.syncAi.refunds)).toBe(120)
  })

  it("doesn't load on a planet's pages", async () => {
    const getRefundsInProgress = jest.fn(async () => [])
    const { actions } = setup({
      api: { getRefundsInProgress },
      mainState: { syncAi: dueRefunds() },
    })

    await actions.initializeOrReloadRefundsInProgress()

    expect(getRefundsInProgress).not.toHaveBeenCalled()
  })
})

describe('TLM staking', () => {
  it('tryStake sends TLM to the selected planet treasury and schedules balance reloads', async () => {
    const { actions, api, main } = setup({ waxState: { selectedDacId: 'kavian' } })

    await expect(actions.tryStake(12.5)).resolves.toBe(true)

    expect(api.stake).toHaveBeenCalledWith('kavian.world', '12.5000 TLM')
    expect(mockToastMessage).toHaveBeenCalledWith('TLM staked successfully.')
    expect(dueInSeconds(main.syncAi.tlmBalance)).toBe(2)
    expect(dueInSeconds(main.syncAi.planets)).toBe(2)
  })

  it('tryStake uses the Neri treasury name for nerix', async () => {
    const { actions, api } = setup({ waxState: { selectedDacId: 'nerix' } })

    await actions.tryStake(1)

    expect(api.stake).toHaveBeenCalledWith('neri.world', '1.0000 TLM')
  })

  it('tryStake shows the transaction error and returns false', async () => {
    const { actions, state } = setup({ waxState: { lastTransactionError: 'overdrawn balance' } })

    await expect(actions.tryStake(1)).resolves.toBe(false)

    expect(mockToastErrorMessage).toHaveBeenCalledWith('overdrawn balance')
    expect(mockToastMessage).not.toHaveBeenCalled()
    expect(state.lastTransactionError).toBeNull()
  })

  it('tryStake toasts a thrown error, or a default message', async () => {
    const stake = jest.fn(async () => {
      throw new Error('rejected')
    })
    const { actions } = setup({ api: { stake } })

    await expect(actions.tryStake(1)).resolves.toBe(false)
    expect(mockToastErrorMessage).toHaveBeenCalledWith('rejected')

    stake.mockImplementationOnce(async () => {
      throw {}
    })
    await actions.tryStake(1)
    expect(mockToastErrorMessage).toHaveBeenLastCalledWith('Staking has failed')
  })

  it('tryUnstake sends the amount in the DAO token and schedules reloads', async () => {
    const { actions, api, main } = setup()

    await expect(actions.tryUnstake({ dac: kavianDao, amount: 12.5 })).resolves.toBeUndefined()

    expect(api.unstake).toHaveBeenCalledWith('12.5000 KAV')
    expect(mockToastMessage).toHaveBeenCalledWith('TLM unstaked successfully.')
    expect(dueInSeconds(main.syncAi.tlmBalance)).toBe(5)
    expect(dueInSeconds(main.syncAi.refunds)).toBe(15)
    expect(dueInSeconds(main.syncAi.planets)).toBe(15)
  })

  it("tryUnstake uses the token's precision", async () => {
    const { actions, api } = setup()

    await actions.tryUnstake({ dac: { ...kavianDao, symbol: { sym: '2,KAV' } }, amount: 3 })

    expect(api.unstake).toHaveBeenCalledWith('3.00 KAV')
  })

  it('tryUnstake shows the transaction error, or a thrown one', async () => {
    const { actions } = setup({ waxState: { lastTransactionError: 'no balance' } })
    await actions.tryUnstake({ dac: kavianDao, amount: 1 })
    expect(mockToastErrorMessage).toHaveBeenCalledWith('no balance')

    const unstake = jest.fn(async () => {
      throw {}
    })
    const second = setup({ api: { unstake } })
    await second.actions.tryUnstake({ dac: kavianDao, amount: 1 })
    expect(mockToastErrorMessage).toHaveBeenLastCalledWith('Unstaking has failed')
  })

  it('tryCancelUnstake cancels an unstake by id and token symbol', async () => {
    const { actions, api, main } = setup()

    await expect(actions.tryCancelUnstake({ id: 7, symbol: '4,KAV' })).resolves.toBe(true)

    expect(api.cancelUnstake).toHaveBeenCalledWith(7, '4,KAV')
    expect(mockToastMessage).toHaveBeenCalledWith('Unstaking on Release cancelled.')
    expect(dueInSeconds(main.syncAi.tlmBalance)).toBe(5)
    expect(dueInSeconds(main.syncAi.planets)).toBe(15)
  })

  it('tryCancelUnstake shows the transaction error and returns false', async () => {
    const { actions } = setup({ waxState: { lastTransactionError: 'nope' } })

    await expect(actions.tryCancelUnstake({ id: 7, symbol: '4,KAV' })).resolves.toBe(false)
    expect(mockToastErrorMessage).toHaveBeenCalledWith('nope')
  })
})

describe('vote power', () => {
  const stakeInput = { planet: kavianDao, amount: 100, releaseTime: 10, currentVotingDelay: 2 }

  it('tryStakeVotePower passes the input to the effect and marks the action succeeded', async () => {
    const { actions, api, state, main } = setup()

    const result = actions.tryStakeVotePower(stakeInput)
    expect(state.actionProgressState).toBe(RequestState.InProgress)

    await expect(result).resolves.toBe(true)
    expect(api.stakeVotePower).toHaveBeenCalledWith(kavianDao, 100, 10, 2)
    expect(state.actionProgressState).toBe(RequestState.Succeeded)
    expect(mockToastMessage).toHaveBeenCalledWith('Staking Vote Power successfully.')
    expect(dueInSeconds(main.syncAi.tlmBalance)).toBe(5)
    expect(dueInSeconds(main.syncAi.planets)).toBe(15)
  })

  it('tryStakeVotePower leaves the action in progress after a transaction error', async () => {
    const { actions, state } = setup({ waxState: { lastTransactionError: 'expired' } })

    await expect(actions.tryStakeVotePower(stakeInput)).resolves.toBe(false)

    expect(mockToastErrorMessage).toHaveBeenCalledWith('expired')
    expect(state.actionProgressState).toBe(RequestState.InProgress)
  })

  it('tryStakeVotePower marks the action failed when the effect throws', async () => {
    const stakeVotePower = jest.fn(async () => {
      throw {}
    })
    const { actions, state } = setup({ api: { stakeVotePower } })

    await expect(actions.tryStakeVotePower(stakeInput)).resolves.toBe(false)

    expect(state.actionProgressState).toBe(RequestState.Failed)
    expect(mockToastErrorMessage).toHaveBeenCalledWith('Staking Vote Power Failed.')
  })

  it('tryUnstakeVotePower sends the quantity but never reports success', async () => {
    const { actions, api, state } = setup()

    await expect(actions.tryUnstakeVotePower('5.0000 KAV')).resolves.toBeNull()

    expect(api.unStakeVotePower).toHaveBeenCalledWith('5.0000 KAV')
    expect(mockToastMessage).not.toHaveBeenCalled()
    // Stays in progress: SignVoteModal disables its buttons until something resets it.
    expect(state.actionProgressState).toBe(RequestState.InProgress)
  })

  it('tryUnstakeVotePower marks a transaction error as failed', async () => {
    const { actions, state } = setup({ waxState: { lastTransactionError: 'locked' } })

    await actions.tryUnstakeVotePower('5.0000 KAV')

    expect(mockToastErrorMessage).toHaveBeenCalledWith('locked')
    expect(state.actionProgressState).toBe(RequestState.Failed)
    expect(state.lastTransactionError).toBeNull()
  })

  it('tryUnstakeVotePower reports a thrown error as a success message', async () => {
    const unStakeVotePower = jest.fn(async () => {
      throw new Error('rejected')
    })
    const { actions, state } = setup({ api: { unStakeVotePower } })

    await actions.tryUnstakeVotePower('5.0000 KAV')

    expect(state.actionProgressState).toBe(RequestState.Failed)
    expect(mockToastMessage).toHaveBeenCalledWith(
      'Unstaking Vote Power successfully. Error: rejected'
    )
  })
})

describe('wax.tryVotingCandidates', () => {
  const votes = { dacId: 'kavian', newVotes: ['a.wam', 'b.wam'] }

  it('votes, marks the action succeeded and arms the 10s auto-reset', async () => {
    const { actions, api, state, main } = setup()

    await expect(actions.tryVotingCandidates(votes)).resolves.toBe(true)

    expect(api.voteCandidates).toHaveBeenCalledWith('kavian', ['a.wam', 'b.wam'])
    expect(state.actionProgressState).toBe(RequestState.Succeeded)
    expect(main.autoExpireVoteDACCandidates).toBe(10)
    expect(mockToastMessage).toHaveBeenCalledWith('Candidates voted successfully.')
    expect(dueInSeconds(main.syncAi.planets)).toBe(15)
    expect(dueInSeconds(main.syncAi.selectedDacCandidatesCustodians)).toBe(2)
  })

  it('leaves the action in progress after a transaction error (the 10s auto-reset clears it)', async () => {
    const { actions, state, main } = setup({ waxState: { lastTransactionError: 'max votes' } })

    await expect(actions.tryVotingCandidates(votes)).resolves.toBe(false)

    expect(mockToastErrorMessage).toHaveBeenCalledWith('max votes')
    expect(state.actionProgressState).toBe(RequestState.InProgress)
    expect(main.autoExpireVoteDACCandidates).toBe(10)
  })

  it('marks the action failed when the effect throws', async () => {
    const voteCandidates = jest.fn(async () => {
      throw {}
    })
    const { actions, state } = setup({ api: { voteCandidates } })

    await expect(actions.tryVotingCandidates(votes)).resolves.toBe(false)

    expect(state.actionProgressState).toBe(RequestState.Failed)
    expect(mockToastErrorMessage).toHaveBeenCalledWith('Voting Candidates Failed.')
  })
})

describe('verification for union candidacy', () => {
  const statusFor = (dacId: string, status: string) => ({ unions: { [dacId]: { status } } })

  it('checkWhitelist accepts a custodian verification for that union', async () => {
    const getWhitelistStatus = jest.fn(async () => statusFor('kavianunn', 'custodian'))
    const { actions, state, api } = setup({ api: { getWhitelistStatus } })

    await expect(actions.checkWhitelist('KavianUnn')).resolves.toBe(true)

    expect(state.userWhitelistStatus).toBe('custodian')
    expect(state.isUserWhiteListed).toBe(true)
    expect(api.getWhiteListId).not.toHaveBeenCalled()
  })

  it('checkWhitelist rejects an arbiter without checking the chain', async () => {
    const getWhitelistStatus = jest.fn(async () => statusFor('kavianunn', 'arbiter'))
    const { actions, state, api } = setup({ api: { getWhitelistStatus } })

    await expect(actions.checkWhitelist('kavianunn')).resolves.toBe(false)

    expect(state.userWhitelistStatus).toBe('arbiter')
    expect(state.isUserWhiteListed).toBe(false)
    expect(api.getWhiteListId).not.toHaveBeenCalled()
  })

  it('checkWhitelist falls back to the on-chain whitelist without a status for the union', async () => {
    const getWhitelistStatus = jest.fn(async () => statusFor('magorunn', 'custodian'))
    const getWhiteListId = jest.fn(async () => ({ account: 'voter.wam' }))
    const { actions, state } = setup({ api: { getWhitelistStatus, getWhiteListId } })

    await expect(actions.checkWhitelist('kavianunn')).resolves.toBe(true)

    expect(getWhiteListId).toHaveBeenCalledWith('kavianunn')
    expect(state.userWhitelistStatus).toBeNull()
    expect(state.isUserWhiteListed).toBe(true)
  })

  it('checkWhitelist falls back to the chain when the status API fails', async () => {
    const getWhitelistStatus = jest.fn(async () => {
      throw new Error('503')
    })
    const { actions, state } = setup({ api: { getWhitelistStatus } })

    await expect(actions.checkWhitelist('kavianunn')).resolves.toBe(false)

    expect(state.isUserWhiteListed).toBe(false)
    expect(mockToastErrorMessage).not.toHaveBeenCalled()
  })

  it('checkWhitelist toasts and returns null when the chain read fails', async () => {
    const getWhiteListId = jest.fn(async () => {
      throw new Error('rpc down')
    })
    const { actions } = setup({ api: { getWhiteListId } })

    await expect(actions.checkWhitelist('kavianunn')).resolves.toBeNull()

    expect(mockToastErrorMessage).toHaveBeenCalledWith('rpc down')
  })

  it('switchWhitelistToCustodian only switches an arbiter', async () => {
    const { actions, api } = setup({ waxState: { userWhitelistStatus: null } })

    await expect(actions.switchWhitelistToCustodian('kavianunn')).resolves.toBe(false)

    expect(api.verifyWhitelist).not.toHaveBeenCalled()
  })

  it('switchWhitelistToCustodian switches an arbiter to custodian on that union', async () => {
    const verifyWhitelist = jest.fn(async () => ({ ok: true }))
    const { actions, state } = setup({
      waxState: { userWhitelistStatus: 'arbiter' },
      api: { verifyWhitelist },
    })

    await expect(actions.switchWhitelistToCustodian('KavianUnn')).resolves.toBe(true)

    expect(verifyWhitelist).toHaveBeenCalledWith('CUSTODIAN', 'kavianunn')
    expect(state.userWhitelistStatus).toBe('custodian')
    expect(state.isUserWhiteListed).toBe(true)
  })

  it('switchWhitelistToCustodian returns false on an empty or failed response', async () => {
    const verifyWhitelist = jest.fn(async () => null)
    const { actions, state } = setup({
      waxState: { userWhitelistStatus: 'arbiter' },
      api: { verifyWhitelist },
    })

    await expect(actions.switchWhitelistToCustodian('kavianunn')).resolves.toBe(false)
    expect(state.userWhitelistStatus).toBe('arbiter')

    verifyWhitelist.mockImplementationOnce(async () => {
      throw new Error('500')
    })
    await expect(actions.switchWhitelistToCustodian('kavianunn')).resolves.toBe(false)
    expect(mockToastErrorMessage).not.toHaveBeenCalled()
  })
})

describe('wax.signPlanetMemberTerms', () => {
  it('signs, toasts and clears the signing flag', async () => {
    const { actions, api, main } = setup()

    const result = actions.signPlanetMemberTerms('kavian')
    expect(main.isSigningDACTerms).toBe(true)
    expect(main.autoExpireSigningDACTerms).toBe(10)

    await result
    expect(api.signPlanetMemberTerms).toHaveBeenCalledWith({ dac_id: 'kavian' })
    expect(mockToastMessage).toHaveBeenCalledWith('Planet Member Terms signed successfully.')
    expect(main.isSigningDACTerms).toBe(false)
  })

  it('shows the transaction error when the effect returns nothing', async () => {
    const signPlanetMemberTerms = jest.fn(async () => null)
    const { actions, state, main } = setup({
      api: { signPlanetMemberTerms },
      waxState: { lastTransactionError: 'not a member' },
    })

    await actions.signPlanetMemberTerms('kavian')

    expect(mockToastMessage).not.toHaveBeenCalled()
    expect(mockToastErrorMessage).toHaveBeenCalledWith('not a member')
    expect(state.lastTransactionError).toBeNull()
    expect(main.isSigningDACTerms).toBe(false)
  })

  it('toasts a thrown error and clears the signing flag', async () => {
    const signPlanetMemberTerms = jest.fn(async () => {
      throw {}
    })
    const { actions, main } = setup({ api: { signPlanetMemberTerms } })

    await actions.signPlanetMemberTerms('kavian')

    expect(mockToastErrorMessage).toHaveBeenCalledWith('Signing failed')
    expect(main.isSigningDACTerms).toBe(false)
  })
})

describe('candidacy', () => {
  const proposal = {
    candidate: '{"givenName":"Voter"}',
    hash: 'NA',
    wallet: 'voter.wam',
    reqpay: '0.0000 TLM',
    dacName: 'kavian',
    isCandidateActive: false,
  }

  it('registerNewCandidate registers, clears the payload and opens Manage Candidacy', async () => {
    const { actions, api, state } = setup({
      waxState: { selectedDacId: 'kavian', dacCandidacyProposalPayload: proposal },
    })
    const data = {
      candidacyProposal: proposal,
      selectedDac: kavianDao,
      daoGlobals: { lockupasset: { quantity: '50000.0000 TLM' } },
      daoWalletDetails: { stake_details: { staked_amount: '0' } },
    }

    await expect(actions.registerNewCandidate(data)).resolves.toBe(true)

    expect(api.tryRegisterNewCandidate).toHaveBeenCalledWith(
      proposal,
      kavianDao,
      data.daoGlobals,
      data.daoWalletDetails
    )
    expect(state.dacCandidacyProposalPayload).toBeNull()
    expect(mockToastMessage).toHaveBeenCalledWith(
      'New Candidate registered successfully. Redirecting shortly, please wait...'
    )
    expect(mockNavigate).toHaveBeenCalledWith('/syndicates/kavian/manage')
  })

  it("registerNewCandidate clears the payload but doesn't navigate after an error", async () => {
    const { actions, state } = setup({
      waxState: { dacCandidacyProposalPayload: proposal, lastTransactionError: 'stake first' },
    })

    await expect(actions.registerNewCandidate({ candidacyProposal: proposal })).resolves.toBe(false)

    expect(state.dacCandidacyProposalPayload).toBeNull()
    expect(mockToastErrorMessage).toHaveBeenCalledWith('stake first')
    expect(mockNavigate).not.toHaveBeenCalled()
  })

  it('activateNewCandidate activates and clears the payload, without navigating', async () => {
    const { actions, api, state } = setup({ waxState: { dacCandidacyProposalPayload: proposal } })

    await expect(actions.activateNewCandidate(proposal)).resolves.toBe(true)

    expect(api.activateNewCandidate).toHaveBeenCalledWith(proposal)
    expect(state.dacCandidacyProposalPayload).toBeNull()
    expect(mockToastMessage).toHaveBeenCalledWith('Candidate activated successfully.')
    expect(mockNavigate).not.toHaveBeenCalled()
  })

  it('withdrawCandidate withdraws and goes back to Become a Candidate', async () => {
    const { actions, api } = setup({ waxState: { selectedDacId: 'kavian' } })

    await expect(actions.withdrawCandidate(proposal)).resolves.toBe(true)

    expect(api.withdrawCandidate).toHaveBeenCalledWith(proposal)
    expect(mockToastMessage).toHaveBeenCalledWith(
      'Candidate withdrawn successfully. Redirecting shortly, please wait...'
    )
    expect(mockNavigate).toHaveBeenCalledWith('/syndicates/kavian/register')
  })

  it('updateCandidate updates the profile', async () => {
    const { actions, api } = setup()

    await expect(actions.updateCandidate(proposal)).resolves.toBe(true)

    expect(api.updateCandidate).toHaveBeenCalledWith(proposal)
    expect(mockToastMessage).toHaveBeenCalledWith(
      'Executing transaction on the chain. This process may take a few seconds to complete..'
    )
  })

  it.each([
    ['registerNewCandidate', 'Register new Candidate has failed', 'tryRegisterNewCandidate'],
    ['activateNewCandidate', 'Activate Candidate has failed', 'activateNewCandidate'],
    ['withdrawCandidate', 'Withdraw Candidate has failed', 'withdrawCandidate'],
    ['updateCandidate', 'Update Candidate has failed', 'updateCandidate'],
  ])('%s toasts "%s" when the effect throws', async (action, fallback, effect) => {
    const throwing = jest.fn(async () => {
      throw {}
    })
    const { actions } = setup({ api: { [effect]: throwing } })

    const arg = action === 'registerNewCandidate' ? { candidacyProposal: proposal } : proposal
    await expect(actions[action](arg)).resolves.toBe(false)

    expect(mockToastErrorMessage).toHaveBeenCalledWith(fallback)
  })
})

describe('custodian proposals', () => {
  const payload = { dac_id: 'kavian', proposal_name: 'abcdefghijkl' }

  it.each([
    [
      'tryCreateNewProposal',
      'createNewCustodianProposal',
      'New Proposal created successfully.',
      'Create new Proposal has failed',
    ],
    [
      'tryChangeDaoConfigs',
      'changeDaoConfigs',
      'Dao Configs Changed Successfully.',
      'Change configs has failed',
    ],
    [
      'tryChangeElectionDuration',
      'changeElectionDuration',
      'Election Config Changed Successfully.',
      'Change configs has failed',
    ],
    [
      'trySetDtapConfigs',
      'changeDTAPConfigs',
      'DTAP Proposal Created Successfully.',
      'Proposal creation has failed',
    ],
    [
      'tryClaimBudget',
      'createNewBudgetClaimProposal',
      'Budget claimed successfully.',
      'Create new Proposal has failed',
    ],
    [
      'tryCancelProposal',
      'cancelCustodianProposal',
      'Proposal cancelled successfully.',
      'Cancel Proposal has failed',
    ],
    [
      'tryApproveProposal',
      'approveCustodianProposal',
      'Proposal approved successfully.',
      'Approve Proposal has failed',
    ],
    [
      'tryExecuteProposal',
      'executeCustodianProposal',
      'Proposal executed successfully.',
      'Execute Proposal has failed',
    ],
  ])('%s calls %s and toasts its result', async (action, effect, success, fallback) => {
    const ok = setup()
    await expect(ok.actions[action](payload)).resolves.toBe(true)
    expect(ok.api[effect]).toHaveBeenCalledWith(payload)
    expect(mockToastMessage).toHaveBeenCalledWith(success)

    mockToastMessage.mockClear()
    const failed = setup({ waxState: { lastTransactionError: 'unauthorized' } })
    await expect(failed.actions[action](payload)).resolves.toBe(false)
    expect(mockToastErrorMessage).toHaveBeenLastCalledWith('unauthorized')
    expect(failed.state.lastTransactionError).toBeNull()
    expect(mockToastMessage).not.toHaveBeenCalled()

    const throwing = jest.fn(async () => {
      throw {}
    })
    const thrown = setup({ api: { [effect]: throwing } })
    await expect(thrown.actions[action](payload)).resolves.toBe(false)
    expect(mockToastErrorMessage).toHaveBeenLastCalledWith(fallback)
  })
})
