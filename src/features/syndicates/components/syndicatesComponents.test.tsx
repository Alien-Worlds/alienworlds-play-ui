import { act, fireEvent, screen } from '@testing-library/react'
import { GovernanceHeader } from 'features/syndicates/components/GovernanceHeader/GovernanceHeader'
import { SignMemberTermsBtn } from 'features/syndicates/components/PlanetaryActions/PlanetaryActions'
import { PlanetaryBalances } from 'features/syndicates/components/PlanetaryBalances/PlanetaryBalances'
import { PlanetaryCandidacy } from 'features/syndicates/components/PlanetaryCandidacy/PlanetaryCandidacy'
import { PlanetaryCustodianBudget } from 'features/syndicates/components/PlanetaryCustodianBudget/PlanetaryCustodianBudget'
import { PlanetaryVotePower } from 'features/syndicates/components/PlanetaryVotePower/PlanetaryVotePower'
import { PlanetaryVotePowerReceived } from 'features/syndicates/components/PlanetaryVotePowerReceived/PlanetaryVotePowerReceived'
import { PlanetSelectionSmall } from 'features/syndicates/components/PlanetSelectionSmall/PlanetSelectionSmall'
import { ProposalDrawer } from 'features/syndicates/components/ProposalDrawer/ProposalDrawer'
import { ProposalsTableVirtualised } from 'features/syndicates/components/ProposalsTableVirtualised/ProposalsTableVirtualised'
import { SyndicatesView } from 'features/syndicates/components/SyndicatesView/SyndicatesView'
import { SyndicateView } from 'features/syndicates/components/SyndicateView/SyndicateView'
import {
  buildCandidate,
  buildDaoDetails,
  buildFlattenedProposal,
  buildWalletDaoDetails,
} from 'features/syndicates/testUtils/fixtures'
import { graphqlHooks, mockGraphql } from 'features/syndicates/testUtils/graphqlMock'
import {
  currentPath,
  mockStore,
  renderSyndicates,
  setMockState,
} from 'features/syndicates/testUtils/mockStore'
import { useModalStore } from 'shared/store/modalStore'
import { useSessionStore } from 'shared/store/sessionStore'
import { collectEvent } from 'shared/util/analytics'

// The syndicates components that read or set Overmind's wax state: which DAO they show, what they
// select, and what they send.

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
  'graphql/hooks/useDaoTreasury',
  () => jest.requireActual('features/syndicates/testUtils/graphqlMock').modules.useDaoTreasury
)
jest.mock(
  'graphql/hooks/useMsigsProposals',
  () => jest.requireActual('features/syndicates/testUtils/graphqlMock').modules.useMsigsProposals
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
  'react-select',
  () => jest.requireActual('features/syndicates/testUtils/mocks').reactSelectMock
)
jest.mock(
  'features/glossary/components/GlossaryInfoIcon/GlossaryInfoIcon',
  () => jest.requireActual('features/syndicates/testUtils/mocks').glossaryIconMock
)
jest.mock(
  'features/mining/components/PlanetLand/Components/PlanetImage',
  () => jest.requireActual('features/syndicates/testUtils/mocks').planetImageMock
)
// SyndicateView's "Visit Planet" check lives with the missions actions (and web3-onboard).
jest.mock('features/missions/components/MissionsActions', () => ({
  useShowVisitPlanetBtn: () => false,
}))
jest.mock('features/outpost/hooks/queries/useLevelNftRewards', () => ({
  useLevelNftRewards: () => ({ currentLevelReward: null }),
}))
jest.mock('shared/util/analytics', () => ({ collectEvent: jest.fn() }))
jest.mock('shared/util/config', () => ({
  config: {
    ...jest.requireActual('shared/util/config').config,
    ActiveDacIds: 'eyeke,kavian,magor,eyekeunn,kavianunn,testa',
  },
}))

const mockCollectEvent = collectEvent as jest.Mock
const click = (name: string) => fireEvent.click(screen.getByRole('button', { name }))

beforeEach(() => {
  useSessionStore.setState({ walletId: 'voter.wam', isDemoUser: false })
  useModalStore.setState({ isMainDrawerOpen: false })
  useModalStore.getState().resetAllPrimaryModals()
  mockGraphql()
})

describe('SyndicatesView (main drawer)', () => {
  const setup = () => {
    const wax = { setSelectedDacId: jest.fn(), getDAOInfo: jest.fn() }
    mockStore({ actions: { wax } })
    useModalStore.setState({ isMainDrawerOpen: true })
    renderSyndicates(<SyndicatesView />, { at: '/inventory' })
    return wax
  }

  it("opens the chosen planet's union", () => {
    const { setSelectedDacId, getDAOInfo } = setup()
    fireEvent.change(screen.getByLabelText('Select an option'), { target: { value: 'kavian' } })

    click('Union')

    expect(setSelectedDacId).toHaveBeenCalledWith('kavianunn')
    expect(getDAOInfo).toHaveBeenCalledWith('kavianunn')
    expect(useModalStore.getState().isMainDrawerOpen).toBe(false)
    expect(currentPath()).toBe('/syndicates/kavianunn')
  })

  it('opens the syndicate of the chosen planet, Eyeke by default', () => {
    const { setSelectedDacId, getDAOInfo } = setup()

    click('Syndicate')

    expect(setSelectedDacId).toHaveBeenCalledWith('eyeke')
    expect(getDAOInfo).toHaveBeenCalledWith('eyeke')
    expect(currentPath()).toBe('/syndicates/eyeke')
  })
})

describe('PlanetSelectionSmall', () => {
  const setup = ({
    selectedDacId = 'kavian',
    at = '/syndicates/kavian',
    path = '/syndicates/:planetId/*',
    showBackNavigation = false,
  } = {}) => {
    const wax = {
      setSelectedDacId: jest.fn((id: string) => setMockState('wax', { selectedDacId: id })),
    }
    mockStore({ state: { wax: { selectedDacId } }, actions: { wax } })
    renderSyndicates(<PlanetSelectionSmall showBackNavigation={showBackNavigation} />, {
      at,
      path,
    })
    return wax
  }

  it('lists the active planets, without unions or the test DAO', () => {
    setup()

    const planets = screen.getAllByRole('button', { name: /^planet / })
    expect(planets.map((planet) => planet.getAttribute('aria-label'))).toEqual([
      'planet eyeke',
      'planet kavian',
      'planet magor',
    ])
  })

  it("ignores the planet that's already selected", () => {
    const { setSelectedDacId } = setup()

    click('planet kavian')

    expect(setSelectedDacId).not.toHaveBeenCalled()
  })

  it('selects another planet and opens its DAO page', () => {
    const { setSelectedDacId } = setup({ at: '/syndicates/kavian/manage' })

    click('planet magor')

    expect(setSelectedDacId).toHaveBeenCalledWith('magor')
    expect(currentPath()).toBe('/dao/magor')
  })

  it("stays on the candidates when picked from a candidate's profile", () => {
    setup({ at: '/syndicates/kavian/signcandidatevote/cand1.wam' })

    click('planet magor')

    expect(currentPath()).toBe('/syndicates/magor/signcandidatevote')
  })

  it("doesn't navigate from the open main drawer", () => {
    useModalStore.setState({ isMainDrawerOpen: true })
    const { setSelectedDacId } = setup({ at: '/inventory', path: '/inventory' })

    click('planet magor')

    expect(setSelectedDacId).toHaveBeenCalledWith('magor')
    expect(currentPath()).toBe('/inventory')
  })

  it('goes back to planet select, reporting the change', () => {
    useModalStore.setState({ isMainDrawerOpen: true })
    setup({ showBackNavigation: true })

    fireEvent.click(screen.getByText('Back to Planet Selection'))

    expect(useModalStore.getState().isMainDrawerOpen).toBe(false)
    expect(currentPath()).toBe('/syndicates')
    expect(mockCollectEvent).toHaveBeenCalledWith({
      name: 'change_planet',
      fields: expect.objectContaining({ planet: 'kavian' }),
    })
  })
})

describe('PlanetaryCustodianBudget', () => {
  it("shows the DAO info's budget and reloads it whenever the info changes", () => {
    // Each load writes a new selectedDacInfo, which the effect depends on: it would load forever,
    // so the stand-in stops writing after three loads.
    let loads = 0
    const wax = {
      getDAOInfo: jest.fn(() => {
        loads += 1
        if (loads <= 3) setMockState('wax', { selectedDacInfo: { custodianBudget: 3000 + loads } })
      }),
    }
    mockStore({
      state: { wax: { selectedDacId: 'kavian', selectedDacInfo: null } },
      actions: { wax },
    })

    renderSyndicates(<PlanetaryCustodianBudget />)

    expect(wax.getDAOInfo).toHaveBeenCalledTimes(4)
    expect(wax.getDAOInfo).toHaveBeenCalledWith('kavian')
    expect(screen.getByText('3003')).toBeInTheDocument()
  })
})

describe('PlanetaryVotePowerReceived', () => {
  it('shows 0: it reads wax.selectedDacCandidates, which nothing fills', () => {
    mockStore({ state: { wax: { selectedDacCandidates: null } } })
    renderSyndicates(<PlanetaryVotePowerReceived />)

    expect(screen.getByText('0')).toBeInTheDocument()
  })

  it("would show the wallet's received vote power from that list", () => {
    mockStore({
      state: { wax: { selectedDacCandidates: [{ account: 'voter.wam', votePower: 1234 }] } },
    })
    renderSyndicates(<PlanetaryVotePowerReceived />)

    expect(screen.getByText('1,234')).toBeInTheDocument()
  })
})

describe('SignMemberTermsBtn (main drawer)', () => {
  it('signs the terms of the planet it is given', () => {
    const wax = { signPlanetMemberTerms: jest.fn() }
    mockStore({ actions: { wax } })
    renderSyndicates(<SignMemberTermsBtn selectedDacId="magor" />)

    click('Sign Member Terms')

    expect(wax.signPlanetMemberTerms).toHaveBeenCalledWith('magor')
  })

  it('asks a demo user to log in', () => {
    useSessionStore.setState({ isDemoUser: true })
    const wax = { signPlanetMemberTerms: jest.fn() }
    mockStore({ actions: { wax } })
    renderSyndicates(<SignMemberTermsBtn selectedDacId="magor" />)

    click('Sign Member Terms')

    expect(wax.signPlanetMemberTerms).not.toHaveBeenCalled()
    expect(useModalStore.getState().primaryModals.LoginModal).toBe(true)
  })
})

describe('ProposalDrawer', () => {
  const setup = ({
    status = 'approvable',
    userStatus = 'custodian',
    createdBy = 'voter.wam',
    at = '/syndicates/kavian/dashboard',
  } = {}) => {
    mockGraphql({ walletDaoDetails: buildWalletDaoDetails({ user_status: userStatus }) })
    const wax = {
      setDacCustodianProposalPayload: jest.fn(),
      tryApproveProposal: jest.fn(),
      tryExecuteProposal: jest.fn(),
    }
    mockStore({ state: { wax: { selectedDacId: 'kavian' } }, actions: { wax } })
    renderSyndicates(
      <ProposalDrawer
        proposal={buildFlattenedProposal({ status, createdBy })}
        isOpen
        onClose={jest.fn()}
      />,
      { at, path: ['/syndicates/:planetId', '/syndicates/:planetId/dashboard'] }
    )
    return wax
  }

  it('lets a custodian approve an approvable proposal', () => {
    const { tryApproveProposal } = setup()

    expect(screen.queryByRole('button', { name: 'Execute Proposal' })).not.toBeInTheDocument()
    click('Approve Proposal')

    expect(tryApproveProposal).toHaveBeenCalledWith({
      approver: 'voter.wam',
      dac_id: 'kavian',
      proposal_name: 'bridgeprop1',
    })
  })

  it('lets a custodian approve or execute a pending proposal', () => {
    const { tryExecuteProposal } = setup({ status: 'pending' })

    expect(screen.getByRole('button', { name: 'Approve Proposal' })).toBeInTheDocument()
    click('Execute Proposal')

    expect(tryExecuteProposal).toHaveBeenCalledWith({
      executer: 'voter.wam',
      dac_id: 'kavian',
      proposal_name: 'bridgeprop1',
    })
  })

  it('offers nothing to a member', () => {
    setup({ userStatus: 'member', status: 'pending' })

    expect(screen.queryByRole('button', { name: 'Approve Proposal' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Execute Proposal' })).not.toBeInTheDocument()
  })

  it('stores the cancel payload and opens the cancel modal for its proposer', () => {
    const { setDacCustodianProposalPayload } = setup()

    click('Cancel Proposal')

    expect(setDacCustodianProposalPayload).toHaveBeenCalledWith({
      proposalTitle: 'bridgeprop1',
      proposalStatus: 'APPROVE',
      statusCount: 1,
      from: 'kavian.dac',
      to: 'worker.wam',
      item: '100.0000 TLM',
      description: 'Build a bridge.',
      memo: 'Bridge',
      uniqueID: 12,
    })
    expect(useModalStore.getState().primaryModals.CancelProposalModal).toBe(true)
  })

  it('only offers the cancel on the Custodian Centre, to the proposer', () => {
    setup({ at: '/syndicates/kavian' })
    expect(screen.queryByRole('button', { name: 'Cancel Proposal' })).not.toBeInTheDocument()
  })

  it("doesn't offer the cancel on someone else's proposal", () => {
    setup({ createdBy: 'other.wam' })
    expect(screen.queryByRole('button', { name: 'Cancel Proposal' })).not.toBeInTheDocument()
  })
})

describe('components that show the selected DAO', () => {
  beforeEach(() => {
    // PlanetaryCandidacy expects the wallet among the candidates.
    mockGraphql({
      daoDetails: buildDaoDetails({
        candidates: { candidates: [buildCandidate({ candidate_name: 'voter.wam' })] },
      }),
    })
    mockStore({
      state: { wax: { selectedDacId: 'magor' } },
      actions: { wax: { getDAOInfo: jest.fn(), signPlanetMemberTerms: jest.fn() } },
    })
  })

  const forMagor = { dacId: 'magor', walletId: 'voter.wam' }

  it.each([
    ['PlanetaryVotePower', 'useWalletDaoDetails', PlanetaryVotePower, forMagor],
    ['PlanetaryBalances', 'useDaoDetails', PlanetaryBalances, 'magor'],
    ['PlanetaryBalances', 'useWalletDaoDetails', PlanetaryBalances, forMagor],
    ['PlanetaryCandidacy', 'useDaoDetails', PlanetaryCandidacy, 'magor'],
    ['GovernanceHeader', 'useDaoDetails', GovernanceHeader, 'magor'],
    ['GovernanceHeader', 'useDaoGlobals', GovernanceHeader, 'magor'],
    ['GovernanceHeader', 'useDaoTreasuries', GovernanceHeader, ['magor']],
    ['GovernanceHeader', 'useWalletDaoDetails', GovernanceHeader, forMagor],
    ['SyndicateView', 'useDaoDetails', SyndicateView, 'magor'],
    ['SyndicateView', 'useWalletDaoDetails', SyndicateView, forMagor],
    ['ProposalsTableVirtualised', 'useMsigsProposals', ProposalsTableVirtualised, 'magor'],
  ])('%s reads %s for wax.selectedDacId', (_, hook, Component, args) => {
    renderSyndicates(<Component />)

    expect(graphqlHooks[hook as keyof typeof graphqlHooks]).toHaveBeenCalledWith(args)
  })

  it("PlanetaryCandidacy throws when the wallet isn't among the DAO's candidates", () => {
    jest.spyOn(console, 'error').mockImplementation(() => {})
    mockGraphql({ loading: true, daoDetails: undefined })

    expect(() => renderSyndicates(<PlanetaryCandidacy />)).toThrow(
      "Cannot read properties of undefined (reading 'member_terms_version')"
    )
    jest.restoreAllMocks()
  })

  it('GovernanceHeader names a union as such', async () => {
    mockStore({ state: { wax: { selectedDacId: 'magorunn' } } })
    renderSyndicates(<GovernanceHeader />)
    await act(async () => {})

    expect(screen.getByText('Union Vote Power')).toBeInTheDocument()
  })
})
