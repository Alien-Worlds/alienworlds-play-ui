import { act, fireEvent, screen } from '@testing-library/react'
import {
  buildCandidate,
  buildDaoDetails,
  buildWalletDaoDetails,
} from 'features/syndicates/testUtils/fixtures'
import { graphqlHooks, mockGraphql } from 'features/syndicates/testUtils/graphqlMock'
import { mockStore, renderSyndicates } from 'features/syndicates/testUtils/mockStore'
import { useModalStore } from 'shared/store/modalStore'
import { useSessionStore } from 'shared/store/sessionStore'

import { ManageCandidacy } from './ManageCandidacy'

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
  '@alien-worlds/uikit',
  () => jest.requireActual('features/syndicates/testUtils/mocks').uikitMock
)
jest.mock('features/outpost/hooks/queries/useLevelNftRewards', () => ({
  useLevelNftRewards: () => ({ currentLevelReward: null }),
}))

const candidate = buildCandidate({
  candidate_name: 'cand1.wam',
  profile: { description: 'I will build things.', image: 'https://img.test/cand1.png' },
})

const setup = ({ currentTag = null, isActive = true } = {}) => {
  mockGraphql({
    daoDetails: buildDaoDetails({
      candidates: { candidates: [{ ...candidate, is_active: isActive }] },
    }),
    walletDaoDetails: buildWalletDaoDetails({ wallet: 'cand1.wam', user_status: 'candidate' }),
  })
  const wax = {
    updateCandidate: jest.fn(),
    activateNewCandidate: jest.fn(),
    updateCandidancyProposal: jest.fn(),
  }
  const main = { showGovernanceManageCandidacyPage: jest.fn() }
  mockStore({ state: { wax: { selectedDacId: 'kavian', currentTag } }, actions: { wax, main } })
  renderSyndicates(<ManageCandidacy />, {
    at: '/syndicates/kavian/manage',
    path: '/syndicates/:planetId/manage',
  })
  return { ...wax, ...main }
}

const proposal = (givenName: string) => ({
  hash: 'NA',
  wallet: 'cand1.wam',
  reqpay: '0.0000 TLM',
  dacName: 'kavian',
  isCandidateActive: true,
  candidate: JSON.stringify({
    image: 'https://img.test/cand1.png',
    givenName,
    description: 'I will build things.',
  }),
})

const message = () => document.querySelector('textarea[name="message"]') as HTMLTextAreaElement

// The buttons sit in the Formik form and submit it too; let its async submit finish.
const click = async (name: string) => {
  fireEvent.click(screen.getByRole('button', { name }))
  await act(async () => {})
}
const modals = () => useModalStore.getState()

beforeEach(() => {
  useSessionStore.setState({
    walletId: 'cand1.wam',
    isDemoUser: false,
    player: { tag: 'Player Tag' } as any,
  })
  useModalStore.getState().resetAllPrimaryModals()
  useModalStore.getState().resetAllSecondaryModals()
})

describe('ManageCandidacy', () => {
  it('reports the visit for the planet in the URL', () => {
    const { showGovernanceManageCandidacyPage } = setup()

    expect(showGovernanceManageCandidacyPage).toHaveBeenCalledWith('kavian')
    expect(graphqlHooks.useDaoDetails).toHaveBeenLastCalledWith('kavian')
  })

  it("fills the form from the candidate's profile", () => {
    setup()

    expect(message().value).toBe('I will build things.')
    expect(screen.getByLabelText('url')).toHaveValue('https://img.test/cand1.png')
    expect(screen.getByLabelText('name')).toHaveValue('Player Tag')
  })

  it('names the candidate after wax.currentTag when set', () => {
    setup({ currentTag: 'Current Tag' })

    expect(screen.getByLabelText('name')).toHaveValue('Current Tag')
  })

  it("can't edit the message: it is put back to the profile's description", () => {
    setup()

    fireEvent.change(message(), { target: { value: 'A new message' } })

    expect(message().value).toBe('I will build things.')
  })

  it('updates the profile after the disclaimer', async () => {
    const { updateCandidate } = setup()

    await click('Update Profile')
    expect(modals().secondaryModals.BlockchainSubmitDisclaimerModal).toBe(true)

    act(() => {
      modals().secondaryModals.onConfirm()
    })
    expect(updateCandidate).toHaveBeenCalledWith(proposal('Player Tag'))
  })

  it('stores the proposal and opens the withdraw modal for an active candidate', async () => {
    const { updateCandidancyProposal } = setup({ currentTag: 'Current Tag' })

    await click('Withdraw Candidacy')

    expect(updateCandidancyProposal).toHaveBeenCalledWith(proposal('Current Tag'))
    expect(modals().primaryModals.WithDrawCandidancyModal).toBe(true)
  })

  it('activates an inactive candidate', async () => {
    const { activateNewCandidate } = setup({ isActive: false })

    expect(screen.queryByRole('button', { name: 'Withdraw Candidacy' })).not.toBeInTheDocument()
    await click('Activate Candidacy')

    expect(activateNewCandidate).toHaveBeenCalledWith(proposal('Player Tag'))
  })
})
