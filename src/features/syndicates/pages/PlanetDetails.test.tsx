import { fireEvent, screen } from '@testing-library/react'
import { buildCustodian, buildDaoDetails } from 'features/syndicates/testUtils/fixtures'
import { graphqlHooks, mockGraphql } from 'features/syndicates/testUtils/graphqlMock'
import { currentPath, mockStore, renderSyndicates } from 'features/syndicates/testUtils/mockStore'

import { PlanetDetails } from './PlanetDetails'

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
  'graphql/hooks/useMsigsProposals',
  () => jest.requireActual('features/syndicates/testUtils/graphqlMock').modules.useMsigsProposals
)
jest.mock(
  '@alien-worlds/uikit',
  () => jest.requireActual('features/syndicates/testUtils/mocks').uikitMock
)
jest.mock(
  'features/glossary/components/GlossaryInfoIcon/GlossaryInfoIcon',
  () => jest.requireActual('features/syndicates/testUtils/mocks').glossaryIconMock
)
jest.mock(
  'features/syndicates/components/ProposalsTableVirtualised/ProposalsTableVirtualised',
  () => ({
    ProposalsTableVirtualised: () => <div>Proposals table</div>,
  })
)

const setup = (selectedDacId = 'kavian', at = '/syndicates/kavian') => {
  const wax = { setIsSyndicatesSidebarOpen: jest.fn() }
  const main = { showGovernanceDetailsPage: jest.fn() }
  mockStore({ state: { wax: { selectedDacId } }, actions: { wax, main } })
  renderSyndicates(<PlanetDetails />, { at, path: '/syndicates/:planetId' })
  return { ...wax, ...main }
}

beforeEach(() => {
  mockGraphql({
    daoDetails: buildDaoDetails({
      custodians: {
        custodians: [
          buildCustodian({ cust_name: 'cust1.wam' }),
          buildCustodian({ cust_name: 'cust2.wam' }),
        ],
      },
    }),
  })
})

describe('PlanetDetails', () => {
  it('reports the visit for the planet in the URL and opens the syndicates sidebar', () => {
    const { showGovernanceDetailsPage, setIsSyndicatesSidebarOpen } = setup()

    expect(showGovernanceDetailsPage).toHaveBeenCalledWith('kavian')
    expect(setIsSyndicatesSidebarOpen).toHaveBeenCalledWith(true)
  })

  it('loads the selected planet, not the one in the URL', () => {
    setup('magor', '/syndicates/kavian')

    expect(graphqlHooks.useDaoDetails).toHaveBeenLastCalledWith('magor')
    expect(graphqlHooks.useDaoGlobals).toHaveBeenLastCalledWith('magor')
    expect(graphqlHooks.useMsigsProposals).toHaveBeenLastCalledWith('magor')
  })

  it("lists the custodians and opens a custodian's vote page", () => {
    setup()

    expect(screen.getByText('cust2.wam')).toBeInTheDocument()
    expect(screen.getByText('Proposals table')).toBeInTheDocument()

    fireEvent.click(screen.getByText('cust1.wam'))

    expect(currentPath()).toBe('/syndicates/kavian/signcandidatevote/cust1.wam')
  })

  it('waits for the DAO before listing custodians', () => {
    mockGraphql({ loading: true })
    setup()

    expect(screen.getByText('Loading Custodians, please wait..')).toBeInTheDocument()
    expect(screen.queryByText('Proposals table')).not.toBeInTheDocument()
  })
})
