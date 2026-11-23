import { buildDaoDetails } from 'features/syndicates/testUtils/fixtures'
import { graphqlHooks, mockGraphql } from 'features/syndicates/testUtils/graphqlMock'
import { mockStore, renderSyndicates } from 'features/syndicates/testUtils/mockStore'
import { useSessionStore } from 'shared/store/sessionStore'

import BackgroundLayer from './BackgroundLayer'

// The syndicates pages' background follows Overmind's wax.selectedDacId.

jest.mock('store', () => jest.requireActual('features/syndicates/testUtils/mockStore').storeMock)
jest.mock(
  'graphql/hooks/useDaoDetails',
  () => jest.requireActual('features/syndicates/testUtils/graphqlMock').modules.useDaoDetails
)
jest.mock(
  '@web3-onboard/react',
  () => jest.requireActual('features/missions/testUtils/onboardMock').onboardMock
)

const setup = (selectedDacId: string, at: string, path: string) => {
  mockGraphql({ daoDetails: (dacId: string) => buildDaoDetails({ dac_id: dacId }) })
  mockStore({ state: { wax: { selectedDacId } } })
  renderSyndicates(<BackgroundLayer />, { at, path })
}

// The image is set through Emotion's css, so it ends up in the injected styles.
const styles = () => Array.from(document.querySelectorAll('style'), (s) => s.textContent).join('')

beforeEach(() => {
  useSessionStore.setState({ walletId: 'voter.wam', isLoggedIn: true })
  jest.requireActual('features/missions/testUtils/onboardMock').mockOnboard()
})

describe('BackgroundLayer on the syndicates pages', () => {
  it("shows the selected planet's details background", () => {
    setup('kavian', '/syndicates/kavian', '/syndicates/:planetId')

    expect(graphqlHooks.useDaoDetails).toHaveBeenLastCalledWith('kavian')
    expect(styles()).toContain('alienworlds-planet-bg-kavian-details.jpg')
  })

  it("shows the selected planet's candidates background on the candidacy pages", () => {
    setup('magor', '/syndicates/magor/register', '/syndicates/:planetId/register')

    expect(styles()).toContain('alienworlds-planet-bg-magor-candidates.jpg')
  })

  it('shows the generic governance background for a union', () => {
    setup('kavianunn', '/syndicates/kavianunn', '/syndicates/:planetId')

    expect(styles()).toContain('alienworlds-db-bg-governance.jpg')
  })
})
