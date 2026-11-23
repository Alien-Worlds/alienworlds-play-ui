import { fireEvent, screen } from '@testing-library/react'
import {
  buildCandidate,
  buildDaoDetails,
  buildWalletDaoDetails,
} from 'features/syndicates/testUtils/fixtures'
import { graphqlHooks, mockGraphql } from 'features/syndicates/testUtils/graphqlMock'
import {
  currentPath,
  mockStore,
  renderSyndicates,
  setMockState,
  updateMockState,
} from 'features/syndicates/testUtils/mockStore'
import { useModalStore } from 'shared/store/modalStore'
import { useSessionStore } from 'shared/store/sessionStore'
import { toastErrorMessage } from 'store/main/actions'

import { CandidateListPage } from './CandidateListPage'

jest.mock('store', () => jest.requireActual('features/syndicates/testUtils/mockStore').storeMock)
jest.mock('store/main/actions', () => ({ toastErrorMessage: jest.fn() }))
jest.mock(
  'graphql/hooks/useStructuredDaoDetail',
  () =>
    jest.requireActual('features/syndicates/testUtils/graphqlMock').modules.useStructuredDaoDetail
)
jest.mock(
  'graphql/hooks/useWalletDaoDetails',
  () => jest.requireActual('features/syndicates/testUtils/graphqlMock').modules.useWalletDaoDetails
)

// The lists and the card are UI around the page's vote logic: these stand-ins expose the
// callbacks the page hands them. CandidateListFull (wide screens) is the one that can vote.
const mockValidationResults: boolean[] = []
const mockCandidateList = (props: any) => (
  <div>
    {props.candidateList.map((candidate: any) => (
      <div key={candidate.candidate_name}>
        <button type="button" onClick={() => props.onClickListItem(candidate.candidate_name)}>
          open {candidate.candidate_name}
        </button>
        <button type="button" onClick={() => props.addOrRemoveVoteSelection(candidate)}>
          vote {candidate.candidate_name}
        </button>
      </div>
    ))}
    <button
      type="button"
      onClick={() => mockValidationResults.push(props.CheckTermsAndConditionValidation())}
    >
      validate
    </button>
    {props.showRefreshVotesButton && (
      <button type="button" onClick={props.refreshVotes}>
        refresh votes
      </button>
    )}
  </div>
)
jest.mock('features/syndicates/components/CandidateListFull/CandidateListFull', () => ({
  CandidateListFull: (props: any) => mockCandidateList(props),
}))
jest.mock('features/syndicates/components/CandidateListSmall/CandidateListSmall', () => ({
  CandidateListSmall: () => <div>small list</div>,
}))
jest.mock('features/syndicates/components/CandidateCard/CandidateCard', () => ({
  CandidateCard: ({ selectedCandidate }: any) => <div>card {selectedCandidate.candidate_name}</div>,
}))
jest.mock('shared/util/hooks', () => ({
  ...jest.requireActual('shared/util/hooks'),
  useScreenSize: () => ({ isMediumScreen: true }),
}))

const mockToastErrorMessage = toastErrorMessage as jest.Mock

const cand1 = buildCandidate({ candidate_name: 'cand1.wam', profile: { givenName: 'One' } })
const cand2 = buildCandidate({ candidate_name: 'cand2.wam', profile: { givenName: 'Two' } })
const cand3 = buildCandidate({ candidate_name: 'cand3.wam', profile: { givenName: 'Three' } })

type Setup = {
  candidates?: any[]
  walletIdParam?: string
  selectedDacCandidateWalletId?: string
  termsAccepted?: boolean
  walletDaoDetails?: any
}

const setup = ({
  candidates = [cand1, cand2, cand3],
  walletIdParam,
  selectedDacCandidateWalletId = null,
  termsAccepted = true,
  walletDaoDetails = buildWalletDaoDetails(),
}: Setup = {}) => {
  mockGraphql({ daoDetails: buildDaoDetails({ candidates: { candidates } }), walletDaoDetails })
  const wax = {
    updateVotedCandidates: jest.fn((list: any[]) =>
      setMockState('wax', { votedCandidatesList: list })
    ),
  }
  const main = { showGovernanceSignCandidateVotePage: jest.fn() }
  mockStore({
    state: {
      wax: {
        selectedDacId: 'kavian',
        votedCandidatesList: [],
        termsAccepted,
        selectedDacCandidateWalletId,
      },
    },
    actions: { wax, main },
  })
  const base = '/syndicates/kavian/signcandidatevote'
  renderSyndicates(<CandidateListPage />, {
    at: walletIdParam ? `${base}/${walletIdParam}` : base,
    path: [
      '/syndicates/:planetId/signcandidatevote',
      '/syndicates/:planetId/signcandidatevote/:walletId',
    ],
  })
  return { ...wax, ...main }
}

const voted = (updateVotedCandidates: jest.Mock) =>
  updateVotedCandidates.mock.lastCall[0].map((candidate: any) => candidate.candidate_name)

beforeEach(() => {
  mockValidationResults.length = 0
  useSessionStore.setState({ walletId: 'voter.wam', isDemoUser: false })
  useModalStore.getState().resetAllPrimaryModals()
  useModalStore.getState().resetAllSecondaryModals()
})

describe('CandidateListPage', () => {
  it('reports the visit with the planet and candidate from the URL', () => {
    const { showGovernanceSignCandidateVotePage } = setup({ walletIdParam: 'cand2.wam' })

    expect(showGovernanceSignCandidateVotePage).toHaveBeenCalledWith({
      id: 'kavian',
      walletId: 'cand2.wam',
    })
  })

  it('reads the candidates of the selected planet for the wallet', () => {
    setup()

    expect(graphqlHooks.useStructuredDaoDetail).toHaveBeenLastCalledWith({
      dacId: 'kavian',
      walletId: 'voter.wam',
    })
  })

  it('starts the vote selection from the candidates already voted for', () => {
    const { updateVotedCandidates } = setup({
      candidates: [cand1, { ...cand2, isVoted: true }, cand3],
    })

    expect(voted(updateVotedCandidates)).toEqual(['cand2.wam'])
  })

  it('adds and removes votes', () => {
    const { updateVotedCandidates } = setup()

    fireEvent.click(screen.getByRole('button', { name: 'vote cand1.wam' }))
    expect(voted(updateVotedCandidates)).toEqual(['cand1.wam'])
    expect(updateVotedCandidates.mock.lastCall[0][0]).toMatchObject({ isVoteAdded: true })

    fireEvent.click(screen.getByRole('button', { name: 'vote cand3.wam' }))
    expect(voted(updateVotedCandidates)).toEqual(['cand1.wam', 'cand3.wam'])

    fireEvent.click(screen.getByRole('button', { name: 'vote cand1.wam' }))
    expect(voted(updateVotedCandidates)).toEqual(['cand3.wam'])
  })

  it('removes a signed vote', () => {
    const { updateVotedCandidates } = setup({ candidates: [{ ...cand1, isVoted: true }, cand2] })

    fireEvent.click(screen.getByRole('button', { name: 'vote cand1.wam' }))

    expect(voted(updateVotedCandidates)).toEqual([])
  })

  it('allows two votes at most', () => {
    const { updateVotedCandidates } = setup()
    fireEvent.click(screen.getByRole('button', { name: 'vote cand1.wam' }))
    fireEvent.click(screen.getByRole('button', { name: 'vote cand2.wam' }))
    updateVotedCandidates.mockClear()

    fireEvent.click(screen.getByRole('button', { name: 'vote cand3.wam' }))

    expect(updateVotedCandidates).not.toHaveBeenCalled()
    expect(mockToastErrorMessage).toHaveBeenCalledWith(
      'Already Voted For Two Candidates, Try Removing one'
    )
  })

  describe('member terms check before voting', () => {
    it('passes when the voter and the chosen candidates signed the current terms', () => {
      setup()
      fireEvent.click(screen.getByRole('button', { name: 'vote cand1.wam' }))

      fireEvent.click(screen.getByRole('button', { name: 'validate' }))

      expect(mockValidationResults).toEqual([true])
    })

    it('names a chosen candidate who has not signed', () => {
      setup({ candidates: [{ ...cand1, hasSignedCurrentDaoTerms: false }, cand2] })
      fireEvent.click(screen.getByRole('button', { name: 'vote cand1.wam' }))

      fireEvent.click(screen.getByRole('button', { name: 'validate' }))

      expect(mockValidationResults).toEqual([false])
      expect(mockToastErrorMessage).toHaveBeenCalledWith('One has not signed the latest DAO Terms.')
    })

    it('says when neither chosen candidate has signed', () => {
      setup({
        candidates: [
          { ...cand1, hasSignedCurrentDaoTerms: false },
          { ...cand2, hasSignedCurrentDaoTerms: false },
        ],
      })
      fireEvent.click(screen.getByRole('button', { name: 'vote cand1.wam' }))
      fireEvent.click(screen.getByRole('button', { name: 'vote cand2.wam' }))

      fireEvent.click(screen.getByRole('button', { name: 'validate' }))

      expect(mockToastErrorMessage).toHaveBeenCalledWith(
        'Both of your Candidates have not signed the latest DAO Terms.'
      )
    })

    it("asks the voter to sign when they haven't signed the planet's terms", () => {
      setup({ walletDaoDetails: buildWalletDaoDetails({ agreed_terms_version: 1 }) })

      fireEvent.click(screen.getByRole('button', { name: 'validate' }))

      expect(mockValidationResults).toEqual([false])
      expect(useModalStore.getState().secondaryModals.NotSignedMemberTermsModal).toBe(true)
    })

    it("asks the voter to sign when the game terms (wax.termsAccepted) aren't accepted", () => {
      setup({ termsAccepted: false })

      fireEvent.click(screen.getByRole('button', { name: 'validate' }))

      expect(mockValidationResults).toEqual([false])
      expect(useModalStore.getState().secondaryModals.NotSignedMemberTermsModal).toBe(true)
    })
  })

  it('opens the candidate set in wax.selectedDacCandidateWalletId', () => {
    setup()

    updateMockState('wax', { selectedDacCandidateWalletId: 'cand2.wam' })

    expect(currentPath()).toBe('/syndicates/kavian/signcandidatevote/cand2.wam')
    expect(screen.getByText('card cand2.wam')).toBeInTheDocument()
  })

  it('offers to sign the two previous votes again', () => {
    setup({ candidates: [{ ...cand1, isVoted: true }, { ...cand2, isVoted: true }, cand3] })

    fireEvent.click(screen.getByRole('button', { name: 'refresh votes' }))

    expect(useModalStore.getState().primaryModals.SignVoteModal).toBe(true)
  })
})
