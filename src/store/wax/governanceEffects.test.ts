import { api } from 'store/wax/effects'

// The syndicates transactions and reads, as Overmind's wax effects build them today. Transactions
// go through the real executeTransactFinal → executeTransactWharf path down to a stub Wharf
// session, so these assert the exact actions the chain receives. The move to
// shared/wax/transact has to send the same payloads.

jest.mock('@wharfkit/session', () => ({ APIClient: function APIClient() {}, Serializer: {} }))

// The msig proposals serialise their inner action with a WaxJS client built on the demo account.
const mockWaxJs = jest.fn()
const mockSerializeActions = jest.fn()
jest.mock('@waxio/waxjs/dist', () => ({
  WaxJS: function WaxJS(options: unknown) {
    mockWaxJs(options)
    return { api: { serializeActions: (actions: unknown) => mockSerializeActions(actions) } }
  },
}))

const mockJsonRpc = jest.fn()
const mockGetTableRows = jest.fn()
jest.mock('eosjs', () => ({
  JsonRpc: function JsonRpc(endpoint: string) {
    mockJsonRpc(endpoint)
    return { get_table_rows: (query: unknown) => mockGetTableRows(query) }
  },
}))

jest.mock('shared/util/config', () => ({
  config: {
    ...jest.requireActual('shared/util/config').config,
    WaxApiUrl: 'https://wax.test',
    WaxFetchApiUrl: 'https://wax-fetch.test',
    DaoApiUrl: 'https://dao.test',
    WhitelistApiUrl: 'https://whitelist.test',
    DemoUserWaxAccount: 'demo.wam',
    DemoUserPublicKey: 'PUB_DEMO',
  },
}))

const wallet = 'voter.wam'
const active = (actor: string) => [{ actor, permission: 'active' }]

let walletId: string
const mockTransact = jest.fn()
const mockOnTransactionError = jest.fn()
const mockFetch = jest.fn()

// 2026-11-20T12:00:00Z: proposal expirations are computed from now.
const NOW = Date.UTC(2026, 10, 20, 12, 0, 0)

beforeEach(() => {
  walletId = wallet
  mockTransact.mockResolvedValue({ transaction_id: 'tx1' })
  mockSerializeActions.mockImplementation(async (actions: any[]) =>
    actions.map((action) => ({ ...action, data: `hex(${action.name})` }))
  )
  mockGetTableRows.mockResolvedValue({ rows: [] })
  global.fetch = mockFetch
  jest.spyOn(Date, 'now').mockReturnValue(NOW)
  api.initialize({
    getWalletId: () => walletId,
    getSessionKit: () => null,
    getCurrentSession: () => ({ transact: mockTransact }),
    getCurrentWallet: () => 'anchor',
    getMiningRandomString: () => null,
    onTransactionError: mockOnTransactionError,
  })
})

afterEach(() => {
  jest.restoreAllMocks()
})

// The actions sent in the (only) transaction.
const sentActions = () => {
  expect(mockTransact).toHaveBeenCalledTimes(1)
  return mockTransact.mock.calls[0][0].actions
}

describe('executeTransactWharf', () => {
  it('signs with the current session, 3 blocks behind and a 20 minute expiry', async () => {
    const actions = [{ account: 'dao.worlds', name: 'votecust' }]

    await expect(api.executeTransactFinal(actions as any)).resolves.toEqual({
      transaction_id: 'tx1',
    })

    expect(mockTransact).toHaveBeenCalledWith({ actions }, { blocksBehind: 3, expireSeconds: 1200 })
  })

  it('unwraps a session stored as { session }', async () => {
    api.initialize({
      getWalletId: () => wallet,
      getCurrentSession: () => ({ session: { transact: mockTransact } }),
      onTransactionError: mockOnTransactionError,
    } as any)

    await api.executeTransactFinal([])

    expect(mockTransact).toHaveBeenCalled()
  })

  it('swallows a failed transaction: reports it and resolves null', async () => {
    const error = new Error('assertion failure')
    mockTransact.mockRejectedValue(error)

    await expect(api.executeTransactFinal([])).resolves.toBeNull()

    expect(mockOnTransactionError).toHaveBeenCalledWith(error)
  })

  it('resolves undefined without a session', async () => {
    api.initialize({
      getWalletId: () => wallet,
      getCurrentSession: () => null,
      onTransactionError: mockOnTransactionError,
    } as any)

    await expect(api.executeTransactFinal([])).resolves.toBeUndefined()
  })
})

describe('without a wallet', () => {
  it('sends nothing', async () => {
    walletId = null

    await api.stake('kavian.world', '1.0000 TLM')
    await api.unstake('1.0000 KAV')
    await api.stakeVotePower({ dac_id: 'kavian', symbol: { sym: '4,KAV' } } as any, 1, 10, 2)
    await api.voteCandidates('kavian', ['a.wam'])
    await api.unStakeVotePower('1.0000 KAV')
    await api.cancelUnstake(1, '4,KAV')
    await api.signPlanetMemberTerms({ dac_id: 'kavian' })
    await api.tryRegisterNewCandidate({} as any, null, null, null)
    await api.activateNewCandidate({} as any)
    await api.withdrawCandidate({} as any)
    await api.updateCandidate({} as any)
    await api.createNewCustodianProposal({} as any)
    await api.changeDTAPConfigs({} as any)
    await api.changeDaoConfigs({} as any)
    await api.changeElectionDuration({} as any)
    await api.createNewBudgetClaimProposal({} as any)
    await api.cancelCustodianProposal({} as any)
    await api.approveCustodianProposal({} as any)
    await api.executeCustodianProposal({} as any)

    expect(mockTransact).not.toHaveBeenCalled()
  })
})

describe('TLM and vote power', () => {
  it('stake transfers TLM to stake.worlds and stakes it on the planet', async () => {
    await api.stake('kavian.world', '12.5000 TLM')

    expect(sentActions()).toEqual([
      {
        account: 'alien.worlds',
        name: 'transfer',
        authorization: active(wallet),
        data: { from: wallet, to: 'stake.worlds', quantity: '12.5000 TLM', memo: 'staking' },
      },
      {
        account: 'stake.worlds',
        name: 'stake',
        authorization: active(wallet),
        data: { account: wallet, planet_name: 'kavian.world', quantity: '12.5000 TLM' },
      },
    ])
  })

  it('unstake transfers the DAO token back to stake.worlds', async () => {
    await api.unstake('12.5000 KAV')

    expect(sentActions()).toEqual([
      {
        account: 'token.worlds',
        name: 'transfer',
        authorization: active(wallet),
        data: { from: wallet, to: 'stake.worlds', quantity: '12.5000 KAV', memo: 'Unstaking' },
      },
    ])
  })

  const kavian: any = { dac_id: 'kavian', symbol: { sym: '4,KAV' } }
  const stakeTime = (days: number) => ({
    account: 'token.worlds',
    name: 'staketime',
    authorization: active(wallet),
    data: { account: wallet, unstake_time: days * 86400, token_symbol: '4,KAV' },
  })
  const stake = (quantity: string) => ({
    account: 'token.worlds',
    name: 'stake',
    authorization: active(wallet),
    data: { account: wallet, quantity },
  })

  it('stakeVotePower sets a longer release time, then stakes', async () => {
    await api.stakeVotePower(kavian, 100, 10, 2)

    expect(sentActions()).toEqual([stakeTime(10), stake('100.0000 KAV')])
  })

  it('stakeVotePower only stakes when the release time is 2 days or not longer than now', async () => {
    await api.stakeVotePower(kavian, 3.5, 2, 0)
    await api.stakeVotePower(kavian, 3.5, 10, 10)

    expect(mockTransact.mock.calls.map((call) => call[0].actions)).toEqual([
      [stake('3.5000 KAV')],
      [stake('3.5000 KAV')],
    ])
  })

  it('stakeVotePower only sets the release time when there is no amount', async () => {
    await api.stakeVotePower(kavian, 0, 30, 2)

    expect(sentActions()).toEqual([stakeTime(30)])
  })

  it('stakeVotePower sends an empty transaction when there is nothing to change', async () => {
    await api.stakeVotePower(kavian, 0, 2, 2)

    expect(sentActions()).toEqual([])
  })

  it('unStakeVotePower unstakes the quantity', async () => {
    await api.unStakeVotePower('5.0000 KAV')

    expect(sentActions()).toEqual([
      {
        account: 'token.worlds',
        name: 'unstake',
        authorization: active(wallet),
        data: { account: wallet, quantity: '5.0000 KAV' },
      },
    ])
  })

  it('cancelUnstake cancels the unstake by id', async () => {
    await api.cancelUnstake(7, '4,KAV')

    expect(sentActions()).toEqual([
      {
        account: 'token.worlds',
        name: 'cancel',
        authorization: active(wallet),
        data: { unstake_id: 7, token_symbol: '4,KAV' },
      },
    ])
  })

  it('voteCandidates replaces the votes on the DAO', async () => {
    await api.voteCandidates('kavian', ['a.wam', 'b.wam'])

    expect(sentActions()).toEqual([
      {
        account: 'dao.worlds',
        name: 'votecust',
        authorization: active(wallet),
        data: { voter: wallet, newvotes: ['a.wam', 'b.wam'], dac_id: 'kavian' },
      },
    ])
  })

  it('signPlanetMemberTerms registers as a member and returns the result', async () => {
    await expect(api.signPlanetMemberTerms({ dac_id: 'kavian' })).resolves.toEqual({
      transaction_id: 'tx1',
    })

    expect(sentActions()).toEqual([
      {
        account: 'token.worlds',
        name: 'memberreg',
        authorization: active(wallet),
        data: { sender: wallet, agreedterms: 'NA', dac_id: 'kavian' },
      },
    ])
  })
})

describe('candidacy', () => {
  const proposal: any = {
    candidate: '{"image":"img","givenName":"Voter","description":"Hi"}',
    hash: 'NA',
    wallet: 'cand.wam',
    reqpay: '0.0000 TLM',
    dacName: 'kavian',
    isCandidateActive: false,
  }
  const setProfile = (actor: string) => ({
    account: 'dao.worlds',
    name: 'stprofile',
    authorization: [{ permission: 'active', actor }],
    data: { cand: 'cand.wam', dac_id: 'kavian', profile: proposal.candidate },
  })
  const nominate = {
    account: 'dao.worlds',
    name: 'nominatecane',
    authorization: [{ permission: 'active', actor: 'cand.wam' }],
    data: { requestedpay: '0.0000 TLM', cand: 'cand.wam', dac_id: 'kavian' },
  }

  it('tryRegisterNewCandidate sets the profile and nominates, signed by the candidate', async () => {
    await api.tryRegisterNewCandidate(
      proposal,
      null,
      { lockupasset: { quantity: '50000.0000 TLM' } } as any,
      { stake_details: { staked_amount: '10.0000 KAV' } } as any
    )

    // No stake action: the extra stake is computed, then set to 0.
    expect(sentActions()).toEqual([setProfile('cand.wam'), nominate])
  })

  it('activateNewCandidate only nominates', async () => {
    await api.activateNewCandidate(proposal)

    expect(sentActions()).toEqual([nominate])
  })

  it('withdrawCandidate withdraws the nomination', async () => {
    await api.withdrawCandidate(proposal)

    expect(sentActions()).toEqual([
      {
        account: 'dao.worlds',
        name: 'withdrawcane',
        authorization: [{ permission: 'active', actor: 'cand.wam' }],
        data: { cand: 'cand.wam', dac_id: 'kavian' },
      },
    ])
  })

  it('updateCandidate sets the profile, signed by the connected wallet', async () => {
    await api.updateCandidate(proposal)

    expect(sentActions()).toEqual([setProfile(wallet)])
  })
})

describe('custodian msig proposals', () => {
  const owner = 'kavian.dac'
  // The proposal wrapper every msig proposal shares; `inner` is the serialised inner action.
  const propose = ({
    proposalName,
    dacId,
    metadata,
    expiration,
    inner,
  }: {
    proposalName: string
    dacId: string
    metadata: unknown
    expiration: string
    inner: Record<string, unknown>
  }) => [
    {
      account: 'msig.worlds',
      name: 'propose',
      authorization: active(wallet),
      data: {
        proposer: wallet,
        proposal_name: proposalName,
        requested: active(owner),
        dac_id: dacId,
        metadata,
        trx: {
          expiration,
          context_free_actions: [],
          delay_sec: '0',
          max_cpu_usage_ms: 0,
          max_net_usage_words: '0',
          ref_block_num: 0,
          ref_block_prefix: 0,
          actions: [{ ...inner, data: `hex(${inner.name})` }],
          transaction_extensions: [],
        },
      },
    },
  ]
  const titled = [
    { key: 'title', value: 'A title' },
    { key: 'description', value: 'A description' },
  ]
  const inSevenDays = '2026-11-27T12:00:00.000'

  it('serialises the inner action with a WaxJS client on the demo account', async () => {
    await api.createNewBudgetClaimProposal({
      dac_id: 'kavian',
      proposer: owner,
      proposal_name: 'p',
      expirationDays: 7,
      metadata: [],
    })

    expect(mockWaxJs).toHaveBeenCalledWith({
      pubKeys: ['PUB_DEMO'],
      rpcEndpoint: 'https://wax.test',
      userAccount: 'demo.wam',
    })
  })

  it('createNewCustodianProposal proposes a TLM transfer from the DAO owner', async () => {
    await api.createNewCustodianProposal({
      dac_id: 'kavian',
      proposer: owner,
      proposal_to: 'worker.wam',
      proposal_name: 'abcdefghijkl',
      proposal_memo: 'For work',
      expirationDays: 3,
      proposal_quantity: '12.5',
      metadata: titled,
    })

    expect(sentActions()).toEqual(
      propose({
        proposalName: 'abcdefghijkl',
        dacId: 'kavian',
        metadata: titled,
        expiration: '2026-11-23T12:00:00.000',
        inner: {
          authorization: active(owner),
          name: 'transfer',
          account: 'alien.worlds',
          data: { from: owner, to: 'worker.wam', memo: 'For work', quantity: '12.5000 TLM' },
        },
      })
    )
  })

  it('createNewBudgetClaimProposal proposes a budget claim', async () => {
    await api.createNewBudgetClaimProposal({
      dac_id: 'kavian',
      proposer: owner,
      proposal_name: 'budget',
      expirationDays: 7,
      metadata: [],
    })

    expect(sentActions()).toEqual(
      propose({
        proposalName: 'budget',
        dacId: 'kavian',
        metadata: [],
        expiration: inSevenDays,
        inner: {
          authorization: active(owner),
          account: 'dao.worlds',
          name: 'claimbudget',
          data: { dac_id: 'kavian' },
        },
      })
    )
  })

  it('changeDaoConfigs proposes new governance settings, expiring in 7 days', async () => {
    await api.changeDaoConfigs({
      dac_id: 'kavian',
      auththreshold: 3,
      numelected: 5,
      maxvotes: 2,
      proposer: owner,
      proposalName: 'configs',
      proposalTitle: 'A title',
      proposalDescription: 'A description',
    })

    expect(sentActions()).toEqual(
      propose({
        proposalName: 'configs',
        dacId: 'kavian',
        metadata: titled,
        expiration: inSevenDays,
        inner: {
          authorization: active(owner),
          account: 'dao.worlds',
          name: 'setdaogov',
          data: { dac_id: 'kavian', auththreshold: 3, numelected: 5, maxvotes: 2 },
        },
      })
    )
  })

  it('changeElectionDuration proposes a period length in seconds', async () => {
    await api.changeElectionDuration({
      dac_id: 'kavian',
      electionDuration: 30,
      proposer: owner,
      proposalName: 'period',
      proposalTitle: 'A title',
      proposalDescription: 'A description',
    })

    expect(sentActions()).toEqual(
      propose({
        proposalName: 'period',
        dacId: 'kavian',
        metadata: titled,
        expiration: inSevenDays,
        inner: {
          authorization: active(owner),
          account: 'dao.worlds',
          name: 'setperiodlen',
          data: { dac_id: 'kavian', periodlength: 30 * 86400 },
        },
      })
    )
  })

  it('changeDTAPConfigs proposes a planet DTAP rate on m.federation', async () => {
    await api.changeDTAPConfigs({
      dac_id: 'kavianunn',
      planet_name: 'kavian.world',
      claim_rate_perc_x100: 5000,
      destination: 'dest.wam',
      proposer: owner,
      proposalName: 'dtap',
      proposalTitle: 'A title',
      proposalDescription: 'A description',
    })

    expect(sentActions()).toEqual(
      propose({
        proposalName: 'dtap',
        dacId: 'kavianunn',
        metadata: titled,
        expiration: inSevenDays,
        inner: {
          authorization: active(owner),
          account: 'm.federation',
          name: 'pltdtapset',
          data: {
            planet_name: 'kavian.world',
            claim_rate_perc_x100: 5000,
            destination: 'dest.wam',
          },
        },
      })
    )
  })

  it('cancelCustodianProposal cancels, signed by the canceler', async () => {
    await api.cancelCustodianProposal({ dac_id: 'kavian', canceler: wallet, proposal_name: 'p1' })

    expect(sentActions()).toEqual([
      {
        account: 'msig.worlds',
        name: 'cancel',
        authorization: active(wallet),
        data: { dac_id: 'kavian', canceler: wallet, proposal_name: 'p1' },
      },
    ])
  })

  it('approveCustodianProposal approves at the active level with no hash', async () => {
    await api.approveCustodianProposal({ dac_id: 'kavian', approver: wallet, proposal_name: 'p1' })

    expect(sentActions()).toEqual([
      {
        account: 'msig.worlds',
        name: 'approve',
        authorization: active(wallet),
        data: {
          dac_id: 'kavian',
          proposal_name: 'p1',
          proposal_hash: null,
          level: { actor: wallet, permission: 'active' },
        },
      },
    ])
  })

  it('executeCustodianProposal executes, signed by the executer', async () => {
    await api.executeCustodianProposal({ dac_id: 'kavian', executer: wallet, proposal_name: 'p1' })

    expect(sentActions()).toEqual([
      {
        account: 'msig.worlds',
        name: 'exec',
        authorization: active(wallet),
        data: { dac_id: 'kavian', executer: wallet, proposal_name: 'p1' },
      },
    ])
  })
})

describe('reads', () => {
  const respond = (body: unknown, ok = true) =>
    Promise.resolve({ ok, status: ok ? 200 : 503, json: async () => body } as Response)

  it('getDAOInfo reads the DAO from the DAO API, lower-cased', async () => {
    mockFetch.mockReturnValue(respond({ results: [{ dacId: 'kavian' }] }))

    await expect(api.getDAOInfo('Kavian')).resolves.toEqual([{ dacId: 'kavian' }])
    expect(mockFetch).toHaveBeenCalledWith('https://dao.test/dacs?dacId=kavian')
  })

  it('getDAOInfo returns null for no results, a failed request, or no wallet', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {})
    mockFetch.mockReturnValueOnce(respond({ results: [] }))
    await expect(api.getDAOInfo('kavian')).resolves.toBeNull()

    mockFetch.mockRejectedValueOnce(new Error('offline'))
    await expect(api.getDAOInfo('kavian')).resolves.toBeNull()

    mockFetch.mockClear()
    await expect(api.getDAOInfo(null)).resolves.toBeNull()
    walletId = null
    await expect(api.getDAOInfo('kavian')).resolves.toBeNull()
    expect(mockFetch).not.toHaveBeenCalled()
  })

  it('getWhitelistStatus reads the status for the connected wallet', async () => {
    const status = { unions: { kavianunn: { status: 'custodian' } } }
    mockFetch.mockReturnValue(respond(status))

    await expect(api.getWhitelistStatus()).resolves.toEqual(status)
    expect(mockFetch).toHaveBeenCalledWith('https://whitelist.test/whitelist-status/voter.wam', {
      headers: { accept: 'application/json' },
    })
  })

  it('getWhitelistStatus throws on an error response', async () => {
    mockFetch.mockReturnValue(respond({}, false))

    await expect(api.getWhitelistStatus()).rejects.toThrow('Whitelist status request failed: 503')
  })

  it('verifyWhitelist posts the account, purpose and union', async () => {
    mockFetch.mockReturnValue(respond({ ok: true }))

    await expect(api.verifyWhitelist('CUSTODIAN', 'kavianunn')).resolves.toEqual({ ok: true })
    expect(mockFetch).toHaveBeenCalledWith('https://whitelist.test/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', accept: 'application/json' },
      body: JSON.stringify({ account: wallet, purpose: 'CUSTODIAN', union: 'kavianunn' }),
    })

    mockFetch.mockReturnValue(respond({}, false))
    await expect(api.verifyWhitelist('CUSTODIAN', 'kavianunn')).rejects.toThrow(
      'Whitelist verify request failed: 503'
    )
  })

  it('getWhiteListId reads the wallet row of the DAO whitelist table', async () => {
    mockGetTableRows.mockResolvedValue({ rows: [{ account: wallet }] })

    await expect(api.getWhiteListId('kavianunn')).resolves.toEqual({ account: wallet })
    expect(mockJsonRpc).toHaveBeenCalledWith('https://wax-fetch.test')
    expect(mockGetTableRows).toHaveBeenCalledWith({
      table: 'whitelist',
      code: 'dao.worlds',
      scope: 'kavianunn',
      lower_bound: wallet,
      upper_bound: wallet,
    })

    mockGetTableRows.mockResolvedValue({ rows: [] })
    await expect(api.getWhiteListId('kavianunn')).resolves.toBeNull()
    await expect(api.getWhiteListId(null)).resolves.toBeNull()
  })
})
