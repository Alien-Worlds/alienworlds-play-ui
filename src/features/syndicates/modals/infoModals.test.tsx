import { fireEvent, screen } from '@testing-library/react'
import { NotEnoughTokensToBecomeCandidateModal } from 'features/syndicates/modals/NotEnoughTokensToBecomeCandidateModal/NotEnoughTokensToBecomeCandidateModal'
import { NotEnoughTokensToVoteModal } from 'features/syndicates/modals/NotEnoughTokensToVoteModal/NotEnoughTokensToVoteModal'
import { NotSignedMemberTermsModal } from 'features/syndicates/modals/NotSignedMemberTermsModal/NotSignedMemberTermsModal'
import { UserWhiteListModal } from 'features/syndicates/modals/UserWhiteListModal/UserWhiteListModal'
import { buildWalletDaoDetails } from 'features/syndicates/testUtils/fixtures'
import { graphqlHooks, mockGraphql } from 'features/syndicates/testUtils/graphqlMock'
import { currentPath, mockStore, renderSyndicates } from 'features/syndicates/testUtils/mockStore'
import { useModalStore } from 'shared/store/modalStore'
import { useSessionStore } from 'shared/store/sessionStore'

// The syndicates modals that explain a missing step and send the user on: what they read from
// Overmind and where they lead.

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
jest.mock(
  'features/mining/components/PlanetLand/Components/PlanetImage',
  () => jest.requireActual('features/syndicates/testUtils/mocks').planetImageMock
)

const openSecondary = (modalName: string, onConfirm: () => void = null) =>
  useModalStore
    .getState()
    .setSecondaryModalActive({ modalName: modalName as any, value: true, onConfirm })
const modals = () => useModalStore.getState()
const click = (name: string) => fireEvent.click(screen.getByRole('button', { name }))

beforeEach(() => {
  useSessionStore.setState({ walletId: 'voter.wam', isDemoUser: false })
  useModalStore.getState().resetAllPrimaryModals()
  useModalStore.getState().resetAllSecondaryModals()
  mockGraphql()
})

describe('NotEnoughTokensToVoteModal', () => {
  it('closes and opens the TLM staking modal for the selected planet', () => {
    mockStore({ state: { wax: { selectedDacId: 'kavian' } } })
    openSecondary('NotEnoughTokensToVoteModal')
    renderSyndicates(<NotEnoughTokensToVoteModal />)

    expect(graphqlHooks.useDaoDetails).toHaveBeenLastCalledWith('kavian')
    click('Stake your TLM')

    expect(modals().secondaryModals.NotEnoughTokensToVoteModal).toBe(false)
    expect(modals().primaryModals.ConvertPlanataryTokenModal).toBe(true)
  })
})

describe('NotEnoughTokensToBecomeCandidateModal', () => {
  const setup = (stakeDetails: Record<string, string>) => {
    mockGraphql({ walletDaoDetails: buildWalletDaoDetails({ stake_details: stakeDetails }) })
    mockStore({
      state: {
        wax: { selectedDacId: 'kavian', currentDAOInfo: { lockupAsset: '50000.0000 TLM' } },
      },
    })
    openSecondary('NotEnoughTokensToBecomeCandidateModal')
    renderSyndicates(<NotEnoughTokensToBecomeCandidateModal />)
  }

  it("states the missing lockup from wax.currentDAOInfo, less what's staked", () => {
    setup({ staked_amount: '10000.0000 KAV', available_tlm_in_dao: '0.0000 KAV' })

    expect(screen.getByText(/You will need/)).toHaveTextContent(
      'You will need 40,000.0000 TLM in Kavian to stake'
    )
  })

  it.each([
    [
      'adds vote power when staked',
      { staked_amount: '10.0000 KAV', available_tlm_in_dao: '6000.0000 KAV' },
      'AddStakingVotePower',
    ],
    [
      'stakes vote power when nothing is staked',
      { staked_amount: '0.0000 KAV', available_tlm_in_dao: '6000.0000 KAV' },
      'StakingVotePower',
    ],
    [
      'stakes TLM in the planet first',
      { staked_amount: '0.0000 KAV', available_tlm_in_dao: '100.0000 KAV' },
      'ConvertPlanataryTokenModal',
    ],
  ])('%s, measured against a fixed 5,000 TLM', (_, stakeDetails, modalName) => {
    setup(stakeDetails)

    click('Stake my TLM')

    expect(modals().primaryModals[modalName]).toBe(true)
    expect(modals().secondaryModals.NotEnoughTokensToBecomeCandidateModal).toBe(false)
  })
})

describe('NotSignedMemberTermsModal', () => {
  it("goes to the selected planet's member terms", () => {
    mockStore({ state: { wax: { selectedDacId: 'magor' } } })
    openSecondary('NotSignedMemberTermsModal')
    renderSyndicates(<NotSignedMemberTermsModal />, { at: '/syndicates/magor/register' })

    click('Go To Member Terms')

    expect(currentPath()).toBe('/syndicates/magor/memberTerms')
    expect(modals().secondaryModals.NotSignedMemberTermsModal).toBe(false)
  })
})

describe('UserWhiteListModal', () => {
  const setup = (userWhitelistStatus: string, onConfirm: () => void = null) => {
    mockStore({ state: { wax: { selectedDacId: 'neriunn', userWhitelistStatus } } })
    openSecondary('UserWhiteListModal', onConfirm)
    renderSyndicates(<UserWhiteListModal />)
  }

  it('sends an unverified wallet to verify as custodian for the union', () => {
    const open = jest.spyOn(window, 'open').mockReturnValue(null)
    setup(null)

    expect(screen.getByText('You have to Verify to be able to vote')).toBeInTheDocument()
    click('Verify Me')

    expect(open).toHaveBeenCalledWith(
      'https://verifyme.alienworlds.io/?role=custodian&union=neriunn',
      '_blank',
      'noopener'
    )
    expect(modals().secondaryModals.UserWhiteListModal).toBe(false)
    open.mockRestore()
  })

  it('tells an arbiter to verify as custodian', () => {
    setup('arbiter')

    expect(screen.getByText('You are verified as Arbiter on Neri Union')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Verify Me' })).toBeInTheDocument()
  })

  it('continues the candidacy once an arbiter was switched to custodian', () => {
    const onConfirm = jest.fn()
    setup('custodian', onConfirm)

    expect(screen.getByText('You are now verified as Custodian on Neri Union')).toBeInTheDocument()
    click('Continue')

    expect(onConfirm).toHaveBeenCalledTimes(1)
    expect(modals().secondaryModals.UserWhiteListModal).toBe(false)
  })
})
