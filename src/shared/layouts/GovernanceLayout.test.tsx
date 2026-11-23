import { screen } from '@testing-library/react'
import { graphqlHooks, mockGraphql } from 'features/syndicates/testUtils/graphqlMock'
import {
  mockStore,
  renderSyndicates,
  updateMockState,
} from 'features/syndicates/testUtils/mockStore'
import { useSessionStore } from 'shared/store/sessionStore'

import GovernanceLayout from './GovernanceLayout'

// The layout around the syndicates pages: what it reads and resets in Overmind's wax state.

jest.mock('store', () => jest.requireActual('features/syndicates/testUtils/mockStore').storeMock)
jest.mock(
  'graphql/hooks/useDaoDetails',
  () => jest.requireActual('features/syndicates/testUtils/graphqlMock').modules.useDaoDetails
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
  'graphql/hooks/useWalletDaoDetails',
  () => jest.requireActual('features/syndicates/testUtils/graphqlMock').modules.useWalletDaoDetails
)
jest.mock(
  'graphql/hooks/useWalletDetails',
  () => jest.requireActual('features/syndicates/testUtils/graphqlMock').modules.useWalletDetails
)
jest.mock('features/syndicates/pages/SyndicatesSidebar', () => ({
  SyndicatesSidebar: () => <div>sidebar</div>,
}))
jest.mock('features/syndicates/components/GovernanceHeader', () => ({
  GovernanceHeader: () => <div>header</div>,
}))

const setup = (at = '/syndicates/kavian') => {
  const wax = {
    resetCandidatesList: jest.fn(),
    resetCustodiansList: jest.fn(),
    resetCustodiansProposalsList: jest.fn(),
  }
  mockStore({
    state: {
      wax: { selectedDacId: 'kavian', votedCandidatesList: [], isSyndicatesSidebarOpen: true },
    },
    actions: { wax },
  })
  const view = renderSyndicates(<GovernanceLayout />, {
    at,
    path: ['/syndicates', '/syndicates/:planetId', '/syndicates/:planetId/*'],
  })
  return { ...wax, view }
}

beforeEach(() => {
  useSessionStore.setState({ walletId: 'voter.wam', isDemoUser: false })
  mockGraphql()
})

describe('GovernanceLayout', () => {
  it('loads the selected planet and its union for the pages below', () => {
    setup()

    expect(graphqlHooks.useDaoTreasuries).toHaveBeenLastCalledWith(['kavian', 'kavianunn'])
    expect(graphqlHooks.useDaoGlobals).toHaveBeenCalledWith('kavian')
    expect(graphqlHooks.useDaoGlobals).toHaveBeenCalledWith('kavianunn')
    expect(graphqlHooks.useDaoDetails).toHaveBeenLastCalledWith('kavian')
    expect(graphqlHooks.useWalletDetails).toHaveBeenLastCalledWith('voter.wam')
    expect(graphqlHooks.useWalletDaoDetails).toHaveBeenLastCalledWith({
      dacId: 'kavian',
      walletId: 'voter.wam',
    })
  })

  it('resets the (never filled) candidate, custodian and proposal lists per planet', () => {
    const { resetCandidatesList, resetCustodiansList, resetCustodiansProposalsList, view } = setup()
    expect(resetCandidatesList).toHaveBeenCalledTimes(1)
    expect(resetCustodiansList).toHaveBeenCalledTimes(1)
    expect(resetCustodiansProposalsList).toHaveBeenCalledTimes(1)

    // Once on cleanup, once for the new planet.
    updateMockState('wax', { selectedDacId: 'magor' })
    expect(resetCandidatesList).toHaveBeenCalledTimes(3)

    view.unmount()
    expect(resetCustodiansList).toHaveBeenCalledTimes(4)
  })

  it('shows the sidebar and header on a planet', () => {
    setup()

    expect(screen.getByText('sidebar')).toBeInTheDocument()
    expect(screen.getByText('header')).toBeInTheDocument()
  })

  it('hides them on planet select', () => {
    setup('/syndicates')

    expect(screen.queryByText('sidebar')).not.toBeInTheDocument()
    expect(screen.queryByText('header')).not.toBeInTheDocument()
  })
})
