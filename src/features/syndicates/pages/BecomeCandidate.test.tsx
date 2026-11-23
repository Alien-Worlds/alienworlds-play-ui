import { act, fireEvent, screen, waitFor } from '@testing-library/react'
import {
  buildDaoDetails,
  buildDaoGlobals,
  buildWalletDaoDetails,
} from 'features/syndicates/testUtils/fixtures'
import { graphqlHooks, mockGraphql } from 'features/syndicates/testUtils/graphqlMock'
import { mockStore, renderSyndicates } from 'features/syndicates/testUtils/mockStore'
import { useAssetsStore } from 'shared/store/assetsStore'
import { useModalStore } from 'shared/store/modalStore'
import { useSessionStore } from 'shared/store/sessionStore'

import { BecomeCandidate } from './BecomeCandidate'

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
  'features/glossary/components/GlossaryInfoIcon/GlossaryInfoIcon',
  () => jest.requireActual('features/syndicates/testUtils/mocks').glossaryIconMock
)
jest.mock('shared/components/topbar/PlayerAvatar', () => ({ PlayerAvatar: () => null }))

type Setup = {
  selectedDacId?: string
  planetId?: string
  currentTag?: string
  isWhiteListed?: boolean
  isSwitched?: boolean
}

const setup = ({
  selectedDacId = 'kavian',
  planetId = selectedDacId,
  currentTag = null,
  isWhiteListed = true,
  isSwitched = false,
}: Setup = {}) => {
  const wax = {
    setDacCandidacyProposalPayload: jest.fn(),
    checkWhitelist: jest.fn(async () => isWhiteListed),
    switchWhitelistToCustodian: jest.fn(async () => isSwitched),
  }
  const main = { showGovernanceBecomeCandidatePage: jest.fn() }
  mockStore({ state: { wax: { selectedDacId, currentTag } }, actions: { wax, main } })
  const view = renderSyndicates(<BecomeCandidate />, {
    at: `/syndicates/${planetId}/register`,
    path: '/syndicates/:planetId/register',
  })
  return { ...wax, ...main, view }
}

const message = () => document.querySelector('textarea[name="message"]')

const submit = async (text = 'Vote for me, I will fix the roads.') => {
  fireEvent.change(message(), { target: { value: text } })
  fireEvent.click(screen.getByRole('button', { name: 'Become a Candidate' }))
  // Let Formik's async submit and the whitelist check settle.
  await act(async () => {})
}

const modals = () => useModalStore.getState()

// Enough staked to cover the 50,000 lockup, nothing left to stake.
const fullyStaked = buildWalletDaoDetails({
  stake_details: { staked_amount: '50000.0000 KAV', available_tlm_in_dao: '0.0000 KAV' },
})

beforeEach(() => {
  useSessionStore.setState({ walletId: 'voter.wam', isDemoUser: false })
  useAssetsStore.setState({ avatarAsset: null })
  useModalStore.getState().resetAllPrimaryModals()
  useModalStore.getState().resetAllSecondaryModals()
  mockGraphql({
    daoDetails: buildDaoDetails(),
    daoGlobals: buildDaoGlobals(),
    walletDaoDetails: fullyStaked,
    walletDetails: { tag: 'Wallet Tag' },
  })
})

describe('BecomeCandidate', () => {
  it('clears the candidacy payload and reports the visit on mount', () => {
    const { setDacCandidacyProposalPayload, showGovernanceBecomeCandidatePage, checkWhitelist } =
      setup()

    expect(setDacCandidacyProposalPayload).toHaveBeenCalledWith(null)
    expect(showGovernanceBecomeCandidatePage).toHaveBeenCalledWith('kavian')
    expect(checkWhitelist).not.toHaveBeenCalled()
  })

  it('checks the verification of a union on mount', () => {
    const { checkWhitelist } = setup({ selectedDacId: 'kavianunn' })

    expect(checkWhitelist).toHaveBeenCalledWith('kavianunn')
  })

  it('reads the selected planet', () => {
    setup({ selectedDacId: 'magor', planetId: 'kavian' })

    expect(graphqlHooks.useDaoDetails).toHaveBeenLastCalledWith('magor')
    expect(graphqlHooks.useDaoGlobals).toHaveBeenLastCalledWith('magor')
    expect(graphqlHooks.useWalletDaoDetails).toHaveBeenLastCalledWith({
      dacId: 'magor',
      walletId: 'voter.wam',
    })
  })

  it("names the candidate after wax.currentTag, else the wallet's tag", () => {
    setup({ currentTag: 'Current Tag' })
    expect(screen.getByText('Current Tag')).toBeInTheDocument()
  })

  it("falls back to the wallet's tag", () => {
    setup()
    expect(screen.getByText('Wallet Tag')).toBeInTheDocument()
  })

  it('needs a candidacy message', () => {
    setup()

    expect(screen.getByRole('button', { name: 'Become a Candidate' })).toBeDisabled()
    fireEvent.change(message(), { target: { value: 'Hi' } })
    expect(screen.getByRole('button', { name: 'Become a Candidate' })).toBeEnabled()
  })

  it('asks a demo user to log in', async () => {
    useSessionStore.setState({ isDemoUser: true })
    setup()

    await submit()

    expect(modals().primaryModals.LoginModal).toBe(true)
  })

  it('asks to sign the current member terms first', async () => {
    mockGraphql({
      daoDetails: buildDaoDetails({ member_terms: { version: 3 } }),
      walletDaoDetails: buildWalletDaoDetails({ agreed_terms_version: 2 }),
    })
    setup()

    await submit()

    expect(modals().secondaryModals.NotSignedMemberTermsModal).toBe(true)
  })

  it.each([
    [
      'adds vote power when some is staked but less than the lockup',
      { staked_amount: '100.0000 KAV', available_tlm_in_dao: '10.0000 KAV' },
      'primary',
      'AddStakingVotePower',
    ],
    [
      'stakes vote power when none is staked yet',
      { staked_amount: '0.0000 KAV', available_tlm_in_dao: '10.0000 KAV' },
      'primary',
      'StakingVotePower',
    ],
    [
      "explains the lockup when there's nothing to stake",
      { staked_amount: '100.0000 KAV', available_tlm_in_dao: '0.0000 KAV' },
      'secondary',
      'NotEnoughTokensToBecomeCandidateModal',
    ],
  ])('%s', async (_, stakeDetails, level, modalName) => {
    mockGraphql({ walletDaoDetails: buildWalletDaoDetails({ stake_details: stakeDetails }) })
    setup()

    await submit()

    const opened = level === 'primary' ? modals().primaryModals : modals().secondaryModals
    expect(opened[modalName]).toBe(true)
  })

  it('confirms the registration, then stores the candidacy payload and opens the lockup', async () => {
    const { setDacCandidacyProposalPayload } = setup({ currentTag: 'Current Tag' })

    await submit('  Vote for me.  ')

    expect(modals().secondaryModals.BlockchainSubmitDisclaimerModal).toBe(true)
    act(() => modals().secondaryModals.onConfirm())

    expect(setDacCandidacyProposalPayload).toHaveBeenLastCalledWith({
      candidate: JSON.stringify({
        image: '/images/alienworlds-profile-sample01.jpg',
        givenName: 'Current Tag',
        description: 'Vote for me.',
      }),
      hash: 'NA',
      wallet: 'voter.wam',
      reqpay: '0.0000 TLM',
      dacName: 'kavian',
      isCandidateActive: false,
    })
    expect(modals().primaryModals.LockCandidancyModal).toBe(true)
  })

  describe('on a union', () => {
    it('continues when verified for the union in the URL', async () => {
      const { checkWhitelist, switchWhitelistToCustodian } = setup({
        selectedDacId: 'kavianunn',
        planetId: 'magorunn',
      })

      await submit()

      expect(checkWhitelist).toHaveBeenLastCalledWith('magorunn')
      expect(switchWhitelistToCustodian).not.toHaveBeenCalled()
      expect(modals().secondaryModals.BlockchainSubmitDisclaimerModal).toBe(true)
    })

    it('switches an arbiter to custodian, and continues from the verification modal', async () => {
      const { switchWhitelistToCustodian } = setup({
        selectedDacId: 'kavianunn',
        isWhiteListed: false,
        isSwitched: true,
      })

      await submit()

      expect(switchWhitelistToCustodian).toHaveBeenCalledWith('kavianunn')
      expect(modals().secondaryModals.UserWhiteListModal).toBe(true)

      act(() => modals().secondaryModals.onConfirm())
      await waitFor(() =>
        expect(modals().secondaryModals.BlockchainSubmitDisclaimerModal).toBe(true)
      )
    })

    it('stops at the verification modal for an unverified wallet', async () => {
      setup({ selectedDacId: 'kavianunn', isWhiteListed: false, isSwitched: false })

      await submit()

      expect(modals().secondaryModals.UserWhiteListModal).toBe(true)
      expect(modals().secondaryModals.onConfirm).toBeNull()
    })
  })
})
