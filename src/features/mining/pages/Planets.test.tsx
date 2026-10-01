import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { mockStore } from 'features/mining/testUtils/mockStore'
import { useModalStore } from 'shared/store/modalStore'

import { Planets } from './Planets'

jest.mock('store', () => jest.requireActual('features/mining/testUtils/mockStore').storeMock)

const mockNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}))

jest.mock('features/mining/components/MiningSelect/MiningSelect', () => ({
  MiningSelect: () => null,
}))
jest.mock('features/mining/components/MiningTabs', () => ({
  MiningTabPanelMotion: ({ children }: any) => <div>{children}</div>,
}))
jest.mock('features/mining/components/OptionalMiningTabs', () => ({
  OptionalMiningTabs: () => null,
}))
jest.mock('features/mining/components/PlanetLand/Components/LandImage', () => ({
  LandImage: () => <div data-testid="land-image" />,
}))
jest.mock('features/mining/components/PlanetLand/Components/PlanetImage', () => ({
  PlanetImage: ({ dacId, onClick, isSelected }: any) => (
    <button type="button" onClick={onClick} data-selected={isSelected}>
      {`planet ${dacId}`}
    </button>
  ),
}))
jest.mock('features/mining/components/PlanetLand/Components/PlanetButtons', () => ({
  PlanetButtons: ({ onDetailsBtnClick, onExploreBtnClick }: any) => (
    <div>
      <button type="button" onClick={onDetailsBtnClick}>
        Details
      </button>
      <button type="button" onClick={onExploreBtnClick}>
        Explore
      </button>
    </div>
  ),
}))
jest.mock('features/mining/components/RarityPoolsHorizontalBar', () => ({
  RarityPoolsHorizontalBar: () => <div data-testid="rarity-pools-bar" />,
}))
jest.mock('features/mining/modals/PlanetDetailsDrawer', () => ({
  PlanetDetailsDrawer: ({ isOpen, planet }: any) =>
    isOpen ? <div data-testid="planet-details-drawer">{planet}</div> : null,
}))
jest.mock('shared/components/RingPositionHelper/RingPositionHelper', () => ({
  RingPositionHelper: ({ children }: any) => <div>{children}</div>,
  RingPositions: { CENTER: 'center' },
}))
jest.mock('features/syndicates/components/LoadingSpinner/LoadingSpinner', () => ({
  LoadingSpinner: () => <div data-testid="loading-spinner" />,
}))

let mockPlanetDetail: { planetDetails: any; loading: boolean }
jest.mock('graphql/hooks/usePlanetDetail', () => ({
  usePlanetDetail: () => mockPlanetDetail,
}))

let mockPlanets: { filteredPlanets: any[]; loading: boolean }
jest.mock('graphql/hooks/usePlanets', () => ({
  usePlanets: () => mockPlanets,
}))

const makePlanet = (id: string, title: string) => ({
  id,
  planet_details: { title, planet_name: `${id}.world` },
})

const showPlanetPage = jest.fn()
const setPlanetSelectedForMiningIntent = jest.fn()
const setPlanetNameForMiningIntent = jest.fn()

const setup = (wax: Record<string, any> = {}, atomic: Record<string, any> = {}) => {
  mockStore({
    state: {
      atomic: { landAsset: null, ...atomic },
      wax: { planetSelectedForMining: null, isOnboarded: true, ...wax },
    },
    actions: {
      wax: { setPlanetSelectedForMiningIntent, setPlanetNameForMiningIntent },
      main: { showPlanetPage },
    },
  })
  return render(<Planets />)
}

const planetCard = (id: string) => screen.getByText(`planet ${id}`).parentElement

beforeEach(() => {
  jest.clearAllMocks()
  mockPlanetDetail = { planetDetails: null, loading: false }
  mockPlanets = {
    filteredPlanets: [makePlanet('eyeke', 'Eyeke'), makePlanet('kavian', 'Kavian')],
    loading: false,
  }
  useModalStore.setState({ planetDetailsDrawer: { isOpen: false } })
})

describe('Planets page', () => {
  it('registers the page on mount', () => {
    setup()

    expect(showPlanetPage).toHaveBeenCalledTimes(1)
  })

  // Current behaviour: the spinner only shows while both queries are loading.
  it('shows a spinner only while both the planet and the planet list load', () => {
    mockPlanetDetail = { planetDetails: null, loading: true }
    mockPlanets = { filteredPlanets: null, loading: true }

    setup()

    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument()
  })

  it('lists every planet', () => {
    setup()

    expect(screen.getByText('planet eyeke')).toBeInTheDocument()
    expect(screen.getByText('planet kavian')).toBeInTheDocument()
  })

  it('selects a planet for mining when clicked', async () => {
    setup()

    await userEvent.click(screen.getByText('planet kavian'))

    expect(setPlanetNameForMiningIntent).toHaveBeenCalledWith('kavian.world')
    expect(setPlanetSelectedForMiningIntent).toHaveBeenCalledWith('kavian')
    expect(screen.getByText('planet kavian')).toHaveAttribute('data-selected', 'true')
  })

  it('explores a planet without a planet name', async () => {
    setup()

    await userEvent.click(within(planetCard('eyeke')).getByRole('button', { name: 'Explore' }))

    expect(setPlanetNameForMiningIntent).toHaveBeenCalledWith()
    expect(setPlanetSelectedForMiningIntent).toHaveBeenCalledWith('eyeke')
  })

  it('opens the details drawer for the chosen planet', async () => {
    setup()

    await userEvent.click(within(planetCard('kavian')).getByRole('button', { name: 'Details' }))

    expect(screen.getByTestId('planet-details-drawer')).toHaveTextContent('kavian')
  })

  it('shows the mining land on the planet being mined', () => {
    setup({ planetSelectedForMining: 'kavian' }, { landAsset: { asset_id: '1' } })

    expect(within(planetCard('kavian')).getByTestId('land-image')).toBeInTheDocument()
    expect(within(planetCard('eyeke')).queryByTestId('land-image')).not.toBeInTheDocument()
  })

  it('shows the rarity pools only once a planet is being mined', () => {
    setup()
    expect(screen.queryByTestId('rarity-pools-bar')).not.toBeInTheDocument()
  })

  it('offers a way back to onboarding for players not yet onboarded', async () => {
    const { container } = setup({ isOnboarded: false })

    await userEvent.click(container.querySelector('svg'))

    expect(mockNavigate).toHaveBeenCalledWith('/onboarding')
  })
})
