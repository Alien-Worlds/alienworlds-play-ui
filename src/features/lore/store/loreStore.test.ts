import { act, renderHook } from '@testing-library/react'
import { useModalStore } from 'shared/store/modalStore'
import { useSessionStore } from 'shared/store/sessionStore'

import { useLoreStore } from './loreStore'

jest.mock('shared/util/config', () => ({ config: { DemoUserWaxAccount: 'demo.wam' } }))

const mockTransact = jest.fn()
jest.mock('shared/wax/transact', () => ({
  transact: (actions: unknown) => mockTransact(actions),
}))

const mockToastMessage = jest.fn()
const mockToastErrorMessage = jest.fn()
jest.mock('shared/util/toast', () => ({
  toastMessage: (message: string) => mockToastMessage(message),
  toastErrorMessage: (message: string) => mockToastErrorMessage(message),
}))

const mockFetchLorePullRequests = jest.fn()
const mockFetchLorePullRequestCommitMessage = jest.fn()
const mockFetchLoreReadMe = jest.fn()
jest.mock('../utils/github', () => ({
  fetchLorePullRequests: () => mockFetchLorePullRequests(),
  fetchLorePullRequestCommitMessage: (n: number) => mockFetchLorePullRequestCommitMessage(n),
  fetchLoreReadMe: () => mockFetchLoreReadMe(),
}))

const initialState = useLoreStore.getState()

describe('useLoreStore', () => {
  afterEach(() => {
    act(() => {
      useLoreStore.setState({ selectedProposalId: null, stakedInput: 0 })
    })
  })

  it('starts with no proposal selected and zero staked input', () => {
    const { result } = renderHook(() => useLoreStore())
    expect(result.current.selectedProposalId).toBeNull()
    expect(result.current.stakedInput).toBe(0)
  })

  it('selects a proposal', () => {
    const { result } = renderHook(() => useLoreStore())

    act(() => {
      result.current.selectProposal(42)
    })

    expect(result.current.selectedProposalId).toBe(42)
  })

  it('clears the selected proposal', () => {
    const { result } = renderHook(() => useLoreStore())

    act(() => {
      result.current.selectProposal(42)
    })
    expect(result.current.selectedProposalId).toBe(42)

    act(() => {
      result.current.clearSelection()
    })

    expect(result.current.selectedProposalId).toBeNull()
  })

  it('sets the staked input amount', () => {
    const { result } = renderHook(() => useLoreStore())

    act(() => {
      result.current.setStakedInput(1000)
    })

    expect(result.current.stakedInput).toBe(1000)
  })

  it('normalizes NaN staked input to zero', () => {
    const { result } = renderHook(() => useLoreStore())

    act(() => {
      result.current.setStakedInput(500)
    })
    expect(result.current.stakedInput).toBe(500)

    act(() => {
      result.current.setStakedInput(NaN)
    })

    expect(result.current.stakedInput).toBe(0)
  })
})

describe('useLoreStore filter', () => {
  it('defaults to no sort column, reversed', () => {
    expect(initialState.loreFilter).toEqual({ sortBy: null, reversed: true })
  })

  it('replaces the filter', () => {
    useLoreStore.getState().setLoreFilter({ sortBy: 2, reversed: false })
    expect(useLoreStore.getState().loreFilter).toEqual({ sortBy: 2, reversed: false })
  })
})

describe('useLoreStore GitHub data', () => {
  let errorSpy: jest.SpyInstance

  beforeEach(() => {
    jest.clearAllMocks()
    errorSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined)
    useLoreStore.setState(initialState, true)
  })

  afterEach(() => {
    errorSpy.mockRestore()
  })

  it('loads the pull requests', async () => {
    const pulls = [{ number: 1, title: 'Fix', html_url: 'https://github.com/x/pull/1' }]
    mockFetchLorePullRequests.mockResolvedValue(pulls)

    await useLoreStore.getState().loadLorePullRequests()
    expect(useLoreStore.getState().lorePullRequests).toEqual(pulls)
  })

  it('keeps the previous pull requests and toasts when loading fails', async () => {
    mockFetchLorePullRequests.mockRejectedValue(new Error('rate limited'))

    await useLoreStore.getState().loadLorePullRequests()
    expect(useLoreStore.getState().lorePullRequests).toEqual([])
    expect(mockToastErrorMessage).toHaveBeenCalledWith('rate limited')
  })

  it('loads the readme', async () => {
    mockFetchLoreReadMe.mockResolvedValue('<h1>Lore</h1>')

    await useLoreStore.getState().loadLoreReadMe()
    expect(useLoreStore.getState().loreReadMe).toBe('<h1>Lore</h1>')
  })

  it('resolves a pull request commit message, or null on failure', async () => {
    mockFetchLorePullRequestCommitMessage.mockResolvedValueOnce('Add chapter 3')
    expect(await useLoreStore.getState().getLorePullRequestCommit(3)).toBe('Add chapter 3')
    expect(mockFetchLorePullRequestCommitMessage).toHaveBeenCalledWith(3)

    mockFetchLorePullRequestCommitMessage.mockRejectedValueOnce(new Error('not found'))
    expect(await useLoreStore.getState().getLorePullRequestCommit(4)).toBeNull()
    expect(mockToastErrorMessage).toHaveBeenCalledWith('not found')
  })
})

describe('useLoreStore transactions', () => {
  let errorSpy: jest.SpyInstance
  const auth = [{ actor: 'alice.wam', permission: 'active' }]

  beforeEach(() => {
    jest.clearAllMocks()
    errorSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined)
    useLoreStore.setState(initialState, true)
    useSessionStore.getState().setWalletId('alice.wam')
    mockTransact.mockResolvedValue({})
  })

  afterEach(() => {
    errorSpy.mockRestore()
  })

  it('stakes by transferring TLM to lore.worlds and then staking', async () => {
    expect(await useLoreStore.getState().stakeLore('12.5')).toBe(true)
    expect(mockTransact).toHaveBeenCalledWith([
      {
        account: 'alien.worlds',
        name: 'transfer',
        authorization: auth,
        data: {
          from: 'alice.wam',
          to: 'lore.worlds',
          memo: 'staking for lore',
          quantity: '12.5000 TLM',
        },
      },
      {
        account: 'lore.worlds',
        name: 'stake',
        authorization: auth,
        data: { account: 'alice.wam' },
      },
    ])
    expect(mockToastMessage).toHaveBeenCalledWith('Staking TLM successfully.')
  })

  it('unstakes with unstake + refund and closes all modals', async () => {
    const resetSecondary = jest.spyOn(useModalStore.getState(), 'resetAllSecondaryModals')
    const resetPrimary = jest.spyOn(useModalStore.getState(), 'resetAllPrimaryModals')

    expect(await useLoreStore.getState().unstakeLore()).toBe(true)
    expect(mockTransact).toHaveBeenCalledWith([
      {
        account: 'lore.worlds',
        name: 'unstake',
        authorization: auth,
        data: { account: 'alice.wam' },
      },
      {
        account: 'lore.worlds',
        name: 'refund',
        authorization: auth,
        data: { account: 'alice.wam' },
      },
    ])
    expect(resetSecondary).toHaveBeenCalled()
    expect(resetPrimary).toHaveBeenCalled()
    expect(mockToastMessage).toHaveBeenCalledWith('Unstaked Successfully')
  })

  it('claims the voter reward', async () => {
    expect(await useLoreStore.getState().claimLoreReward()).toBe(true)
    expect(mockTransact).toHaveBeenCalledWith([
      {
        account: 'lore.worlds',
        name: 'claimreward',
        authorization: auth,
        data: { voter: 'alice.wam' },
      },
    ])
    expect(mockToastMessage).toHaveBeenCalledWith('TLM Reward claimed successfully.')
  })

  it('votes with the vote power formatted as VP', async () => {
    expect(
      await useLoreStore.getState().voteLore({ proposalId: 9, vote: 'yes', votePower: 3 })
    ).toBe(true)
    expect(mockTransact).toHaveBeenCalledWith([
      {
        account: 'lore.worlds',
        name: 'vote',
        authorization: auth,
        data: { voter: 'alice.wam', proposal_id: 9, vote: 'yes', vote_power: '3.0000 VP' },
      },
    ])
    expect(mockToastMessage).toHaveBeenCalledWith('Lore Vote Successful.')
  })

  it('submits by paying the fee and proposing the PR taken from the URL', async () => {
    const resetSecondary = jest.spyOn(useModalStore.getState(), 'resetAllSecondaryModals')
    const url = 'https://github.com/Alien-Worlds/the-lore/pull/42'

    expect(
      await useLoreStore
        .getState()
        .submitLore({ title: 'Chapter', url, description: 'Desc', fee: '200.0000 TLM' })
    ).toBe(true)
    expect(mockTransact).toHaveBeenCalledWith([
      {
        account: 'alien.worlds',
        name: 'transfer',
        authorization: auth,
        data: { from: 'alice.wam', to: 'lore.worlds', quantity: '200.0000 TLM', memo: 'lore' },
      },
      {
        account: 'lore.worlds',
        name: 'propose',
        authorization: auth,
        data: {
          proposal_id: 42,
          proposer: 'alice.wam',
          title: 'Chapter',
          type: 'lore',
          attributes: [
            { key: 'pull_req_id', value: ['uint16', 42] },
            { key: 'url', value: ['string', url] },
            { key: 'description', value: ['string', 'Desc'] },
          ],
        },
      },
    ])
    expect(resetSecondary).toHaveBeenCalled()
    expect(mockToastMessage).toHaveBeenCalledWith('Lore Proposal Submitted.')
  })

  it('does nothing without a wallet', async () => {
    useSessionStore.getState().setWalletId(null)

    expect(await useLoreStore.getState().claimLoreReward()).toBe(false)
    expect(mockTransact).not.toHaveBeenCalled()
  })

  it('toasts the transaction error, keeps modals open and resolves false', async () => {
    const resetSecondary = jest.spyOn(useModalStore.getState(), 'resetAllSecondaryModals')
    mockTransact.mockRejectedValue(new Error('overdrawn balance'))

    expect(await useLoreStore.getState().unstakeLore()).toBe(false)
    expect(mockToastErrorMessage).toHaveBeenCalledWith('overdrawn balance')
    expect(mockToastMessage).not.toHaveBeenCalled()
    expect(resetSecondary).not.toHaveBeenCalled()
  })

  it('falls back to a generic message when the error has none', async () => {
    mockTransact.mockRejectedValue(undefined)

    expect(await useLoreStore.getState().stakeLore('1')).toBe(false)
    expect(mockToastErrorMessage).toHaveBeenCalledWith('Staking TLM failed.')
  })

  it('tracks isTransacting while a transaction is in flight', async () => {
    let resolveTransact: () => void
    mockTransact.mockReturnValue(new Promise<void>((resolve) => (resolveTransact = resolve)))

    const pending = useLoreStore.getState().claimLoreReward()
    expect(useLoreStore.getState().isTransacting).toBe(true)

    resolveTransact()
    await pending
    expect(useLoreStore.getState().isTransacting).toBe(false)
  })
})
