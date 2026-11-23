import { fireEvent, screen } from '@testing-library/react'
import { buildDaoDetails } from 'features/syndicates/testUtils/fixtures'
import { graphqlHooks, mockGraphql, mockRefetch } from 'features/syndicates/testUtils/graphqlMock'
import {
  currentPath,
  mockStore,
  renderSyndicates,
  setMockState,
} from 'features/syndicates/testUtils/mockStore'
import { useSessionStore } from 'shared/store/sessionStore'

import { PlanetSelect } from './PlanetSelect'

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
  'features/glossary/components/GlossaryInfoIcon/GlossaryInfoIcon',
  () => jest.requireActual('features/syndicates/testUtils/mocks').glossaryIconMock
)
jest.mock(
  'features/mining/components/PlanetLand/Components/PlanetImage',
  () => jest.requireActual('features/syndicates/testUtils/mocks').planetImageMock
)
jest.mock(
  'react-spring-3d-carousel',
  () => jest.requireActual('features/syndicates/testUtils/mocks').carouselMock
)
jest.mock('shared/util/config', () => ({
  config: {
    ...jest.requireActual('shared/util/config').config,
    ActivePlanetIds: 'eyeke,kavian,naron',
  },
}))

const setup = (selectedDacId = 'naron') => {
  const actions = {
    setSelectedDacId: jest.fn((id: string) => setMockState('wax', { selectedDacId: id })),
    setIsSyndicatesSidebarOpen: jest.fn(),
  }
  const main = { showGovernancePage: jest.fn() }
  mockStore({ state: { wax: { selectedDacId } }, actions: { wax: actions, main } })
  renderSyndicates(<PlanetSelect />, { at: '/syndicates' })
  return { ...actions, ...main }
}

beforeEach(() => {
  useSessionStore.setState({ walletId: 'voter.wam', isDemoUser: false })
  mockGraphql({ daoDetails: (dacId: string) => buildDaoDetails({ dac_id: dacId, title: dacId }) })
})

describe('PlanetSelect', () => {
  it('selects Naron, reports the visit and closes the syndicates sidebar on mount', () => {
    const { setSelectedDacId, showGovernancePage, setIsSyndicatesSidebarOpen } = setup('kavian')

    expect(setSelectedDacId).toHaveBeenCalledWith('naron')
    expect(showGovernancePage).toHaveBeenCalledTimes(1)
    expect(setIsSyndicatesSidebarOpen).toHaveBeenCalledWith(false)
  })

  it('reads the selected planet and the connected wallet', () => {
    setup()

    expect(graphqlHooks.useDaoDetails).toHaveBeenLastCalledWith('naron')
    expect(graphqlHooks.useWalletDaoDetails).toHaveBeenLastCalledWith({
      dacId: 'naron',
      walletId: 'voter.wam',
    })
    expect(screen.getByRole('heading', { name: 'naron' })).toBeInTheDocument()
  })

  it('selects a planet from the carousel', () => {
    const { setSelectedDacId } = setup()

    fireEvent.click(screen.getByRole('button', { name: 'planet eyeke' }))

    expect(setSelectedDacId).toHaveBeenLastCalledWith('eyeke')
    expect(graphqlHooks.useDaoDetails).toHaveBeenLastCalledWith('eyeke')
    expect(screen.getByRole('heading', { name: 'eyeke' })).toBeInTheDocument()
  })

  it('explores the selected planet on its DAO page', () => {
    setup()

    fireEvent.click(screen.getByRole('button', { name: 'planet kavian' }))
    fireEvent.click(screen.getByRole('button', { name: 'Explore' }))

    expect(currentPath()).toBe('/dao/kavian')
  })

  it('offers a refresh while the planet has no DAO details', () => {
    mockGraphql({ daoDetails: null })
    setup()

    fireEvent.click(screen.getByRole('button', { name: 'Refresh' }))

    expect(mockRefetch).toHaveBeenCalledTimes(1)
    expect(currentPath()).toBe('/syndicates')
  })
})
