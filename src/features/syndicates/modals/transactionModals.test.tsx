import { act, fireEvent, screen } from '@testing-library/react'
import { CancelProposalModal } from 'features/syndicates/modals/CancelProposalModal/CancelProposalModal'
import { ConvertPlanetaryTokenModal } from 'features/syndicates/modals/ConvertPlanetaryTokenModal/ConvertPlanetaryTokenModal'
import { LockCandidancyModal } from 'features/syndicates/modals/LockCandidancyModal/LockCandidancyModal'
import { SignVoteModal } from 'features/syndicates/modals/SignVoteModal/SignVoteModal'
import { UnstakingVotePower } from 'features/syndicates/modals/UnstakingVotePower/UnstakingVotePower'
import { WithDrawCandidancyModal } from 'features/syndicates/modals/WithDrawCandidancyModal/WithDrawCandidancyModal'
import {
  buildCandidate,
  buildDaoDetails,
  buildDaoGlobals,
  buildWalletDaoDetails,
} from 'features/syndicates/testUtils/fixtures'
import { mockGraphql } from 'features/syndicates/testUtils/graphqlMock'
import { mockApolloClient } from 'features/syndicates/testUtils/mocks'
import {
  mockStore,
  renderSyndicates,
  updateMockState,
} from 'features/syndicates/testUtils/mockStore'
import { ErrorTypes } from 'features/syndicates/types/governanceTypes'
import { DAO_DETAILS_QUERY } from 'graphql/queries'
import { DAO_WALLET_DETAILS_QUERY } from 'graphql/queries/daoWalletDetails'
import { MSIGS_QUERY } from 'graphql/queries/msigs'
import { USER_DAO_BALANCES } from 'graphql/queries/userDaoBalances'
import { WALLET_DETAILS_QUERY_ALL } from 'graphql/queries/walletDetails'
import { useModalStore } from 'shared/store/modalStore'
import { useSessionStore } from 'shared/store/sessionStore'
import { collectEvent } from 'shared/util/analytics'
import { RequestState } from 'store/wax/types'

// The syndicates modals that send a transaction: what each one passes to its wax action, and
// how it reacts to the result.

jest.mock('store', () => jest.requireActual('features/syndicates/testUtils/mockStore').storeMock)
jest.mock(
  'graphql/hooks/useDaoDetails',
  () => jest.requireActual('features/syndicates/testUtils/graphqlMock').modules.useDaoDetails
)
jest.mock(
  'graphql/hooks/useWalletDaoDetails',
  () => jest.requireActual('features/syndicates/testUtils/graphqlMock').modules.useWalletDaoDetails
)
jest.mock(
  'graphql/hooks/useDaoGlobals',
  () => jest.requireActual('features/syndicates/testUtils/graphqlMock').modules.useDaoGlobals
)
jest.mock(
  'graphql/hooks/useWalletDetails',
  () => jest.requireActual('features/syndicates/testUtils/graphqlMock').modules.useWalletDetails
)
jest.mock(
  '@alien-worlds/uikit',
  () => jest.requireActual('features/syndicates/testUtils/mocks').uikitMock
)
jest.mock(
  '@apollo/client',
  () => jest.requireActual('features/syndicates/testUtils/mocks').apolloMock
)
jest.mock(
  'features/mining/components/PlanetLand/Components/PlanetImage',
  () => jest.requireActual('features/syndicates/testUtils/mocks').planetImageMock
)
jest.mock('shared/util/analytics', () => ({ collectEvent: jest.fn() }))

const mockCollectEvent = collectEvent as jest.Mock

const open = (modalName: string) =>
  useModalStore.getState().setPrimaryModalActive({ modalName: modalName as any, value: true })
const isOpen = (modalName: string) => useModalStore.getState().primaryModals[modalName]
const click = async (name: string | RegExp) => {
  fireEvent.click(screen.getByRole('button', { name }))
  await act(async () => {})
}

beforeEach(() => {
  useSessionStore.setState({ walletId: 'voter.wam', isDemoUser: false })
  useModalStore.getState().resetAllPrimaryModals()
  useModalStore.getState().resetAllSecondaryModals()
  mockGraphql()
})

describe('SignVoteModal', () => {
  const added = buildCandidate({ candidate_name: 'new.wam', isVoteAdded: true })
  const signed = buildCandidate({ candidate_name: 'old.wam', isVoted: true })
  const removed = buildCandidate({ candidate_name: 'gone.wam', isSignedVoteRemoved: true })

  const setup = (votedCandidatesList: any[] = [signed, added, removed]) => {
    const wax = { tryVotingCandidates: jest.fn(), resetActionProgressState: jest.fn() }
    mockStore({
      state: { wax: { selectedDacId: 'kavian', votedCandidatesList, actionProgressState: null } },
      actions: { wax },
    })
    open('SignVoteModal')
    renderSyndicates(<SignVoteModal />)
    return wax
  }

  it('shows the new votes first, then the signed ones', () => {
    setup()

    const names = screen.getAllByText(/\.wam$/).map((element) => element.textContent)
    expect(names).toEqual(['new.wam', 'old.wam'])
  })

  it('votes for the signed and added candidates, then refetches the DAO', async () => {
    const { tryVotingCandidates } = setup()

    await click('Yes, Vote')

    expect(isOpen('SignVoteModal')).toBe(false)
    expect(tryVotingCandidates).toHaveBeenCalledWith({
      dacId: 'kavian',
      newVotes: ['old.wam', 'new.wam'],
    })
    expect(mockApolloClient.refetchQueries).toHaveBeenCalledWith({
      include: [DAO_DETAILS_QUERY, DAO_WALLET_DETAILS_QUERY],
    })
  })

  it('asks a demo user to log in', async () => {
    useSessionStore.setState({ isDemoUser: true })
    const { tryVotingCandidates } = setup()

    await click('Yes, Vote')

    expect(tryVotingCandidates).not.toHaveBeenCalled()
    expect(isOpen('LoginModal')).toBe(true)
  })

  it('disables its buttons while an action is in progress', () => {
    setup()

    updateMockState('wax', { actionProgressState: RequestState.InProgress })

    expect(screen.getByRole('button', { name: 'Yes, Vote' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled()
  })

  it('closes and resets the progress once the vote succeeds', () => {
    const { resetActionProgressState } = setup()

    updateMockState('wax', { actionProgressState: RequestState.Succeeded })

    expect(isOpen('SignVoteModal')).toBe(false)
    expect(resetActionProgressState).toHaveBeenCalled()
  })

  it('has nothing to sign without votes', () => {
    setup([])

    expect(screen.getByText('Something went wrong!')).toBeInTheDocument()
  })
})

describe('UnstakingVotePower', () => {
  const setup = (walletDaoDetails = buildWalletDaoDetails()) => {
    mockGraphql({
      walletDaoDetails: {
        ...walletDaoDetails,
        stake_details: { ...walletDaoDetails.stake_details, staked_amount: '25.0000 KAV' },
      },
    })
    const wax = { tryUnstakeVotePower: jest.fn(), resetActionProgressState: jest.fn() }
    mockStore({
      state: { wax: { selectedDacId: 'kavian', actionProgressState: null } },
      actions: { wax },
    })
    open('UnstakingVotePower')
    renderSyndicates(<UnstakingVotePower />)
    return wax
  }

  it('unstakes everything staked, in the DAO token', async () => {
    const { tryUnstakeVotePower } = setup()

    await click(/^Yes, Unstake 25\.0000 TLM from\s+Kavian$/)

    expect(tryUnstakeVotePower).toHaveBeenCalledWith('25.0000 KAV')
    expect(isOpen('UnstakingVotePower')).toBe(false)
  })

  it("doesn't let a candidate unstake, but the error modal loses its message", async () => {
    const { tryUnstakeVotePower } = setup(buildWalletDaoDetails({ user_status: 'candidate' }))
    const errorTypes: ErrorTypes[] = []
    const unsubscribe = useModalStore.subscribe(({ errorType }) => errorTypes.push(errorType))

    await click(/^Yes, Unstake/)
    unsubscribe()

    expect(tryUnstakeVotePower).not.toHaveBeenCalled()
    expect(useModalStore.getState().secondaryModals.ErrorModal).toBe(true)
    // It opens the error with CANDIDATE_CANNOT_UNSTAKE, then closes itself, which clears the
    // error type (Overmind's modal actions did the same), so ErrorModal shows no message.
    expect(errorTypes).toContain(ErrorTypes.CANDIDATE_CANNOT_UNSTAKE)
    expect(useModalStore.getState().errorType).toBeNull()
  })

  it('closes and resets the progress on success (which tryUnstakeVotePower never reports)', () => {
    const { resetActionProgressState } = setup()

    updateMockState('wax', { actionProgressState: RequestState.Succeeded })

    expect(isOpen('UnstakingVotePower')).toBe(false)
    expect(resetActionProgressState).toHaveBeenCalled()
  })
})

describe('CancelProposalModal', () => {
  const payload = {
    proposalTitle: 'bridgeprop1',
    proposalStatus: 'APPROVE',
    statusCount: 1,
    from: 'kavian.dac',
    to: 'worker.wam',
    item: '100.0000 TLM',
    description: 'Build a bridge.',
    memo: 'Bridge',
    uniqueID: 12,
  }

  const setup = (dacCustodianProposalPayload: any = payload) => {
    const wax = { tryCancelProposal: jest.fn() }
    mockStore({
      state: { wax: { selectedDacId: 'kavian', dacCustodianProposalPayload } },
      actions: { wax },
    })
    open('CancelProposalModal')
    renderSyndicates(<CancelProposalModal />)
    return wax
  }

  it('cancels the proposal kept in wax.dacCustodianProposalPayload, then refetches', async () => {
    const { tryCancelProposal } = setup()

    expect(screen.getByText('Build a bridge.')).toBeInTheDocument()
    await click('Cancel Proposal')

    expect(isOpen('CancelProposalModal')).toBe(false)
    expect(tryCancelProposal).toHaveBeenCalledWith({
      canceler: 'voter.wam',
      dac_id: 'kavian',
      proposal_name: 'bridgeprop1',
    })
    expect(mockApolloClient.refetchQueries).toHaveBeenCalledWith({ include: [MSIGS_QUERY] })
  })

  it('renders nothing without a payload', () => {
    setup(null)

    expect(screen.queryByRole('button', { name: 'Cancel Proposal' })).not.toBeInTheDocument()
  })
})

describe('LockCandidancyModal', () => {
  const candidacy = { wallet: 'voter.wam', dacName: 'kavian', candidate: '{}' }

  it('registers the candidacy kept in wax.dacCandidacyProposalPayload, then refetches', async () => {
    const daoDetails = buildDaoDetails()
    const daoGlobals = buildDaoGlobals()
    const walletDaoDetails = buildWalletDaoDetails()
    mockGraphql({ daoDetails, daoGlobals, walletDaoDetails })
    const wax = { registerNewCandidate: jest.fn() }
    mockStore({
      state: { wax: { selectedDacId: 'kavian', dacCandidacyProposalPayload: candidacy } },
      actions: { wax },
    })
    open('LockCandidancyModal')
    renderSyndicates(<LockCandidancyModal />)

    await click('Yes, Become Candidate')

    expect(wax.registerNewCandidate).toHaveBeenCalledWith({
      candidacyProposal: candidacy,
      selectedDac: daoDetails,
      daoGlobals,
      daoWalletDetails: walletDaoDetails,
    })
    expect(isOpen('LockCandidancyModal')).toBe(false)
    expect(mockApolloClient.refetchQueries).toHaveBeenCalledWith({ include: [DAO_DETAILS_QUERY] })
  })
})

describe('WithDrawCandidancyModal', () => {
  it('withdraws the candidacy kept in wax.generatedCandidancyProposal', async () => {
    const candidacy = { wallet: 'voter.wam', dacName: 'kavian', isCandidateActive: true }
    const wax = { withdrawCandidate: jest.fn() }
    mockStore({
      // selectedDacCandidates is never filled, so the avatar always falls back.
      state: { wax: { selectedDacCandidates: null, generatedCandidancyProposal: candidacy } },
      actions: { wax },
    })
    open('WithDrawCandidancyModal')
    renderSyndicates(<WithDrawCandidancyModal />)

    await click('Yes, Withdraw my Candidacy')

    expect(isOpen('WithDrawCandidancyModal')).toBe(false)
    expect(wax.withdrawCandidate).toHaveBeenCalledWith(candidacy)
  })
})

describe('ConvertPlanetaryTokenModal', () => {
  const daoDetails = buildDaoDetails()

  const setup = () => {
    mockGraphql({ daoDetails, walletDetails: { tlm_balance: '500.0000 TLM' } })
    const wax = { tryStake: jest.fn(), tryUnstake: jest.fn() }
    mockStore({ state: { wax: { selectedDacId: 'kavian' } }, actions: { wax } })
    open('ConvertPlanataryTokenModal')
    renderSyndicates(<ConvertPlanetaryTokenModal />)
    return wax
  }

  const refetched = {
    include: [DAO_WALLET_DETAILS_QUERY, USER_DAO_BALANCES, WALLET_DETAILS_QUERY_ALL],
  }

  it('stakes TLM in the planet, refetches the balances and reports it', async () => {
    const { tryStake, tryUnstake } = setup()

    fireEvent.change(screen.getByLabelText('amount'), { target: { value: '12.5' } })
    await click('Stake TLM in Kavian')

    expect(tryStake).toHaveBeenCalledWith(12.5)
    expect(tryUnstake).not.toHaveBeenCalled()
    expect(mockApolloClient.refetchQueries).toHaveBeenCalledWith(refetched)
    expect(mockCollectEvent).toHaveBeenCalledWith({
      name: 'convert_token_overlay_from',
      fields: expect.objectContaining({
        planet: 'Kavian',
        stakingAmount: 12.5,
        stakedTokens: 0,
        // Read from a number, so always undefined.
        availableTokens: undefined,
      }),
    })
  })

  it('unstakes back to TLM after switching direction', async () => {
    const { tryStake, tryUnstake } = setup()

    fireEvent.click(screen.getByRole('checkbox'))
    fireEvent.change(screen.getByLabelText('amount'), { target: { value: '3' } })
    await click('Stake to TLM')

    expect(tryUnstake).toHaveBeenCalledWith({ dac: daoDetails, amount: 3 })
    expect(tryStake).not.toHaveBeenCalled()
    expect(mockCollectEvent).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'convert_token_overlay_to' })
    )
  })

  it('asks a demo user to log in', async () => {
    useSessionStore.setState({ isDemoUser: true })
    const { tryStake } = setup()

    fireEvent.change(screen.getByLabelText('amount'), { target: { value: '1' } })
    await click('Stake TLM in Kavian')

    expect(tryStake).not.toHaveBeenCalled()
    expect(isOpen('LoginModal')).toBe(true)
  })
})
