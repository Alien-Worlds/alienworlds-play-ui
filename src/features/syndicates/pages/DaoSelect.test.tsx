import { fireEvent, screen } from '@testing-library/react'
import { buildDaoDetails, buildTreasury } from 'features/syndicates/testUtils/fixtures'
import { graphqlHooks, mockGraphql } from 'features/syndicates/testUtils/graphqlMock'
import {
  currentPath,
  mockStore,
  renderSyndicates,
  setMockState,
} from 'features/syndicates/testUtils/mockStore'
import { useSessionStore } from 'shared/store/sessionStore'
import { collectEvent } from 'shared/util/analytics'

import { DaoSelect } from './DaoSelect'

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
  '@alien-worlds/uikit',
  () => jest.requireActual('features/syndicates/testUtils/mocks').uikitMock
)
jest.mock(
  'features/mining/components/PlanetLand/Components/PlanetImage',
  () => jest.requireActual('features/syndicates/testUtils/mocks').planetImageMock
)
jest.mock('shared/util/analytics', () => ({ collectEvent: jest.fn() }))

const mockCollectEvent = collectEvent as jest.Mock

const setup = (selectedDacId = 'kavian') => {
  const wax = {
    setSelectedDacId: jest.fn((id: string) => setMockState('wax', { selectedDacId: id })),
    getDAOInfo: jest.fn(),
  }
  const main = { showGovernanceDaoSelect: jest.fn() }
  mockStore({ state: { wax: { selectedDacId } }, actions: { wax, main } })
  renderSyndicates(<DaoSelect />, { at: `/dao/${selectedDacId}`, path: '/dao/:planetId' })
  return { ...wax, ...main }
}

// Both layouts' buttons render under jsdom: union (desktop, mobile), then syndicate (mobile,
// desktop).
const exploreButtons = () => screen.getAllByRole('button', { name: 'Explore' })

beforeEach(() => {
  useSessionStore.setState({ walletId: 'voter.wam', isDemoUser: false })
  mockGraphql({
    daoDetails: (dacId: string) => buildDaoDetails({ dac_id: dacId }),
    dacTreasury: [buildTreasury('kavian', '1000'), buildTreasury('kavianunn', '2000')],
  })
})

describe('DaoSelect', () => {
  it('reports the visit for the planet in the URL', () => {
    const { showGovernanceDaoSelect } = setup()

    expect(showGovernanceDaoSelect).toHaveBeenCalledWith('kavian')
  })

  it('loads the selected planet and its union', () => {
    setup()

    expect(graphqlHooks.useDaoTreasuries).toHaveBeenLastCalledWith(['kavian', 'kavianunn'])
    expect(graphqlHooks.useDaoGlobals).toHaveBeenCalledWith('kavian')
    expect(graphqlHooks.useDaoGlobals).toHaveBeenCalledWith('kavianunn')
    expect(graphqlHooks.useDaoDetails).toHaveBeenCalledWith('kavian')
    expect(graphqlHooks.useDaoDetails).toHaveBeenCalledWith('kavianunn')
    expect(graphqlHooks.useWalletDaoDetails).toHaveBeenCalledWith({
      dacId: 'kavian',
      walletId: 'voter.wam',
    })
  })

  it('exploring the union selects it, loads its DAO info and opens its details', () => {
    const { setSelectedDacId, getDAOInfo } = setup()

    fireEvent.click(exploreButtons()[0])

    expect(setSelectedDacId).toHaveBeenCalledWith('kavianunn')
    expect(getDAOInfo).toHaveBeenCalledWith('kavianunn')
    expect(currentPath()).toBe('/syndicates/kavianunn')
    expect(mockCollectEvent).toHaveBeenCalledWith({
      name: 'planet_select_explore',
      fields: expect.objectContaining({
        location: '/syndicates',
        planet: 'kavianunn',
        planetTreasury: '2000',
      }),
    })
  })

  it("exploring the syndicate only navigates: it doesn't select it or load its DAO info", () => {
    const { setSelectedDacId, getDAOInfo } = setup()

    fireEvent.click(exploreButtons()[2])

    expect(setSelectedDacId).not.toHaveBeenCalled()
    expect(getDAOInfo).not.toHaveBeenCalled()
    expect(currentPath()).toBe('/syndicates/kavian')
    expect(mockCollectEvent).toHaveBeenCalledWith({
      name: 'planet_select_explore',
      fields: expect.objectContaining({ location: '/syndicates', planet: 'kavian' }),
    })
  })
})
