import { act, fireEvent, screen } from '@testing-library/react'
import {
  buildCandidate,
  buildDaoDetails,
  buildWalletDaoDetails,
} from 'features/syndicates/testUtils/fixtures'
import { graphqlHooks, mockGraphql } from 'features/syndicates/testUtils/graphqlMock'
import { mockApolloClient } from 'features/syndicates/testUtils/mocks'
import {
  currentPath,
  mockStore,
  renderSyndicates,
  setMockState,
} from 'features/syndicates/testUtils/mockStore'
import { DAO_WALLET_DETAILS_QUERY } from 'graphql/queries/daoWalletDetails'
import { USER_DAO_BALANCES } from 'graphql/queries/userDaoBalances'
import { useModalStore } from 'shared/store/modalStore'
import { useSessionStore } from 'shared/store/sessionStore'
import { collectEvent } from 'shared/util/analytics'
import { claimUnstake } from 'shared/wax/claims'

import { SyndicatesSidebar } from './SyndicatesSidebar'

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
  '@apollo/client',
  () => jest.requireActual('features/syndicates/testUtils/mocks').apolloMock
)
jest.mock(
  'features/glossary/components/GlossaryInfoIcon/GlossaryInfoIcon',
  () => jest.requireActual('features/syndicates/testUtils/mocks').glossaryIconMock
)
jest.mock(
  'features/mining/components/PlanetLand/Components/PlanetImage',
  () => jest.requireActual('features/syndicates/testUtils/mocks').planetImageMock
)
jest.mock('features/syndicates/components/PlanetSelectionSmall/PlanetSelectionSmall', () => ({
  PlanetSelectionSmall: () => null,
}))
jest.mock('shared/util/analytics', () => ({ collectEvent: jest.fn() }))
jest.mock('shared/wax/claims', () => ({ claimUnstake: jest.fn() }))

const mockScreen = { isNotDesktop: false }
jest.mock('shared/util/hooks', () => ({
  ...jest.requireActual('shared/util/hooks'),
  useScreenSize: () => mockScreen,
}))

const mockCollectEvent = collectEvent as jest.Mock

type Setup = {
  selectedDacId?: string
  isOpen?: boolean
  walletDaoDetails?: any
  daoDetails?: any
}

const setup = ({
  selectedDacId = 'kavian',
  isOpen = true,
  walletDaoDetails = buildWalletDaoDetails(),
  daoDetails = buildDaoDetails({ candidates: { candidates: [buildCandidate()] } }),
}: Setup = {}) => {
  mockGraphql({ daoDetails, walletDaoDetails })
  const wax = {
    getDAOInfo: jest.fn(),
    tryCancelUnstake: jest.fn(),
    // Plays out the real setter, so the sidebar's own effect sees the change.
    setIsSyndicatesSidebarOpen: jest.fn((open: boolean) =>
      setMockState('wax', { isSyndicatesSidebarOpen: open })
    ),
  }
  mockStore({
    state: { wax: { selectedDacId, isSyndicatesSidebarOpen: isOpen } },
    actions: { wax },
  })
  const view = renderSyndicates(<SyndicatesSidebar />, {
    at: `/syndicates/${selectedDacId}`,
    path: ['/syndicates/:planetId', '/syndicates/:planetId/*'],
  })
  return { ...wax, view }
}

const button = (name: string) => screen.getByRole('button', { name })
const modals = () => useModalStore.getState()

beforeEach(() => {
  mockScreen.isNotDesktop = false
  useSessionStore.setState({ walletId: 'voter.wam', isDemoUser: false })
  useModalStore.getState().resetAllPrimaryModals()
  useModalStore.getState().resetAllSecondaryModals()
})

describe('SyndicatesSidebar', () => {
  it('reads the selected planet and loads its DAO info', () => {
    const { getDAOInfo } = setup()

    expect(graphqlHooks.useDaoDetails).toHaveBeenLastCalledWith('kavian')
    expect(graphqlHooks.useWalletDaoDetails).toHaveBeenLastCalledWith({
      dacId: 'kavian',
      walletId: 'voter.wam',
    })
    expect(getDAOInfo).toHaveBeenCalledTimes(1)
    expect(getDAOInfo).toHaveBeenCalledWith('kavian')
  })

  it('reloads the DAO info when the available TLM changes', () => {
    const { getDAOInfo, view } = setup()

    mockGraphql({
      daoDetails: buildDaoDetails({ candidates: { candidates: [buildCandidate()] } }),
      walletDaoDetails: buildWalletDaoDetails({
        stake_details: { available_tlm_in_dao: '20.0000 KAV' },
      }),
    })
    view.rerender(<SyndicatesSidebar />)

    expect(getDAOInfo).toHaveBeenCalledTimes(2)
  })

  describe('open state', () => {
    it("can't be closed on desktop: it reopens straight away", () => {
      const { setIsSyndicatesSidebarOpen } = setup()

      // The ellipsis in the drawer header.
      fireEvent.click(document.querySelector('.chakra-modal__header > div'))

      expect(setIsSyndicatesSidebarOpen.mock.calls).toEqual([[false], [true]])
      expect(button('Planet Details')).toBeInTheDocument()
    })

    it("closes below desktop, and can't be opened there", () => {
      mockScreen.isNotDesktop = true
      const { setIsSyndicatesSidebarOpen } = setup()

      expect(setIsSyndicatesSidebarOpen).toHaveBeenCalledWith(false)
      expect(screen.queryByRole('button', { name: 'Planet Details' })).not.toBeInTheDocument()

      act(() => setMockState('wax', { isSyndicatesSidebarOpen: true }))

      expect(setIsSyndicatesSidebarOpen).toHaveBeenLastCalledWith(false)
    })
  })

  describe('menu', () => {
    it.each([
      ['Planet Details', '/syndicates/kavian'],
      ['View Candidates', '/syndicates/kavian/signcandidatevote'],
      ['Read Member Terms', '/syndicates/kavian/memberTerms'],
      ['Become a Candidate', '/syndicates/kavian/register'],
    ])('%s opens %s, keeping the sidebar open on desktop', (name, path) => {
      const { setIsSyndicatesSidebarOpen } = setup()

      fireEvent.click(button(name))

      expect(currentPath()).toBe(path)
      expect(setIsSyndicatesSidebarOpen).toHaveBeenLastCalledWith(true)
    })

    it("can't become a candidate on a DAO without candidates", () => {
      setup({ daoDetails: buildDaoDetails() })

      expect(button('Become a Candidate')).toBeDisabled()
    })

    it('links a custodian to the Custodian Centre', () => {
      setup({ walletDaoDetails: buildWalletDaoDetails({ user_status: 'custodian' }) })

      fireEvent.click(button('Custodian Centre'))
      expect(currentPath()).toBe('/syndicates/kavian/dashboard')
    })

    it('shows a candidate their candidacy', () => {
      setup({ walletDaoDetails: buildWalletDaoDetails({ user_status: 'candidate' }) })

      fireEvent.click(button('Manage Candidacy'))

      expect(currentPath()).toBe('/syndicates/kavian/manage')
      expect(screen.queryByRole('button', { name: 'Custodian Centre' })).not.toBeInTheDocument()
    })

    it('names the union details on a union', () => {
      setup({ selectedDacId: 'kavianunn' })

      expect(button('Union Details')).toBeInTheDocument()
    })
  })

  describe('vote power', () => {
    it('asks a demo user to log in', () => {
      useSessionStore.setState({ isDemoUser: true })
      setup()

      fireEvent.click(button('Add Vote Power'))

      expect(modals().primaryModals.LoginModal).toBe(true)
    })

    it('explains how to vote when nothing is available to stake', () => {
      setup({
        walletDaoDetails: buildWalletDaoDetails({
          stake_details: { available_tlm_in_dao: '0.0000 KAV' },
        }),
      })

      fireEvent.click(button('Add Vote Power'))

      expect(modals().secondaryModals.NotEnoughTokensToVoteModal).toBe(true)
    })

    it('opens Add Vote Power and reports it twice', () => {
      setup()

      fireEvent.click(button('Add Vote Power'))

      expect(modals().primaryModals.AddStakingVotePower).toBe(true)
      expect(mockCollectEvent).toHaveBeenCalledTimes(2)
      expect(mockCollectEvent).toHaveBeenCalledWith({
        name: 'stake_vote_power',
        fields: expect.objectContaining({
          planet: 'kavian',
          voteWeight: 0,
          stakedTokens: '0.0000 KAV',
          availableTokens: '100.0000 KAV',
        }),
      })
    })

    it('stakes more or unstakes once there is vote power', () => {
      setup({ walletDaoDetails: buildWalletDaoDetails({ vote_weight: { weight: 250000 } }) })

      expect(screen.queryByRole('button', { name: 'Add Vote Power' })).not.toBeInTheDocument()
      fireEvent.click(button('Stake Vote Power'))
      expect(modals().primaryModals.StakingVotePowerWithRelease).toBe(true)

      fireEvent.click(button('Unstake Vote Power'))
      expect(modals().primaryModals.UnstakingVotePower).toBe(true)
    })

    it('stakes with a release timer while tokens are being released', () => {
      setup({
        walletDaoDetails: buildWalletDaoDetails({
          stake_details: {
            unstakes: [{ key: 3, stake: '5.0000', release_time: '2999-01-01T00:00:00Z' }],
          },
        }),
      })

      fireEvent.click(button('Stake with Release Timer'))

      expect(modals().primaryModals.StakingVotePowerWithRelease).toBe(true)
    })
  })

  describe('unstakes', () => {
    const released = { key: 3, stake: '5.0000', release_time: '2020-01-01T00:00:00Z' }
    const pending = { key: 4, stake: '7.0000', release_time: '2999-01-01T00:00:00Z' }

    it('cancels an unstake by key with the DAO token symbol, then refetches the balances', async () => {
      const { tryCancelUnstake } = setup({
        walletDaoDetails: buildWalletDaoDetails({ stake_details: { unstakes: [pending] } }),
      })

      fireEvent.click(button('Cancel'))
      await act(async () => {})

      expect(tryCancelUnstake).toHaveBeenCalledWith({ id: 4, symbol: '4,KAV' })
      expect(mockApolloClient.refetchQueries).toHaveBeenCalledWith({
        include: [DAO_WALLET_DETAILS_QUERY, USER_DAO_BALANCES],
      })
    })

    it('claims released TLM from the last unstake', async () => {
      setup({
        walletDaoDetails: buildWalletDaoDetails({
          stake_details: { unstakes: [pending, released] },
        }),
      })

      expect(screen.getAllByRole('button', { name: 'Claim TLM' })).toHaveLength(1)
      fireEvent.click(button('Claim TLM'))
      await act(async () => {})

      expect(claimUnstake).toHaveBeenCalledWith('4,KAV')
    })

    it("doesn't offer a claim before any release time has passed", () => {
      setup({ walletDaoDetails: buildWalletDaoDetails({ stake_details: { unstakes: [pending] } }) })

      expect(screen.queryByRole('button', { name: 'Claim TLM' })).not.toBeInTheDocument()
    })
  })
})
