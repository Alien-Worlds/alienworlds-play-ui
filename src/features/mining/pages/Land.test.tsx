import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { mockStore } from 'features/mining/testUtils/mockStore'
import { useModalStore } from 'shared/store/modalStore'
import { useSessionStore } from 'shared/store/sessionStore'

import { Land } from './Land'

jest.mock('store', () => jest.requireActual('features/mining/testUtils/mockStore').storeMock)

const mockNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}))

jest.mock('@alien-worlds/uikit', () => ({
  Button: ({ children, onClick }: any) => (
    <button type="button" onClick={onClick}>
      {children}
    </button>
  ),
  Dropdown: ({ options, onChange, defaultValue }: any) => (
    <select
      aria-label="planet"
      defaultValue={defaultValue?.value}
      onChange={(e) => onChange(options.find((o: any) => o.value === e.target.value))}
    >
      {options.map((o: any) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  ),
  NFTCard: ({ children, title }: any) => (
    <div data-testid="land-card">
      <p>{title}</p>
      {children}
    </div>
  ),
  NFTInUseButton: ({ disable }: any) => <div data-testid="in-use" data-disabled={!!disable} />,
  NFTCardTopRightPanel: () => null,
  NFTImage: () => null,
  NFTCardDetailsPanel: () => null,
  NFTCardBottomPanel: () => null,
  NFTPlanetComission: () => null,
  NFTPlanetIndicator: () => null,
  NFTOverlayPanel: () => null,
}))

jest.mock('features/inventory/utils/NFTCardOverlayRender', () => ({
  NFTCardBottomPanelRender: () => null,
  NFTCardDetailPanelRender: () => null,
  NFTCardOverlayRender: () => null,
  NFTCardTopRightPanelRender: () => null,
}))
jest.mock('features/inventory/utils/NFTCardHelper', () => ({
  NFTCardDataPreparation: (assets: any[]) =>
    assets.map((a) => ({
      assetId: { name: a.asset_id },
      type: { name: 'Land' },
      rarity: { name: 'Common' },
      shine: { name: 'Stone' },
      nftImage: { name: 'img' },
    })),
}))

const mockFilterAssets = jest.fn()
jest.mock('features/mining/utils/landFilter', () => ({
  filterAndSortLands: (...args: any[]) => mockFilterAssets(...args),
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
jest.mock('features/mining/components/PlanetLand/Components/CardCharge', () => ({
  CardCharge: () => null,
}))
jest.mock('features/mining/components/PlanetLand/Components/CardIcons', () => ({
  CardIcons: () => null,
}))
jest.mock('features/mining/components/PlanetLand/Components/LandDescription', () => ({
  LandDescription: () => null,
}))
jest.mock('features/mining/components/PlanetLand/Components/LandImage', () => ({
  LandImage: () => <div data-testid="mining-land" />,
}))
jest.mock('features/mining/components/PlanetLand/Components/LandsFilterbar', () => ({
  LandsFilterbar: () => <div data-testid="lands-filterbar" />,
}))
jest.mock('features/mining/components/PlanetLand/Components/PlanetCoordinates', () => ({
  PlanetCoordinates: () => null,
}))
jest.mock('features/mining/components/PlanetLand/Components/PlanetDetailsButton', () => ({
  PlanetDetailsButton: () => null,
}))
jest.mock('features/mining/components/PlanetLand/Components/PlanetImage', () => ({
  PlanetImage: () => null,
}))
jest.mock('features/mining/components/RarityPoolsBarChart', () => ({
  RarityPoolsBarChart: () => null,
}))
jest.mock('features/mining/modals/PlanetDetailsDrawer', () => ({
  PlanetDetailsDrawer: () => null,
}))
jest.mock('shared/components/RingPositionHelper/RingPositionHelper', () => ({
  RingPositionHelper: ({ children }: any) => <div>{children}</div>,
  RingPositions: { CENTER: 'center' },
}))
jest.mock('features/syndicates/components/LoadingSpinner/LoadingSpinner', () => ({
  LoadingSpinner: () => <div data-testid="loading-spinner" />,
}))

const mockRefetch = jest.fn()
const mockUseRarityPools = jest.fn()
jest.mock('features/mining/hooks/useRarityPools', () => ({
  useRarityPools: (planet: string) => mockUseRarityPools(planet),
}))

let mockPlanetAssets: any[] | undefined
const mockUsePlanetAssets = jest.fn()
jest.mock('features/mining/hooks/usePlanetAssets', () => ({
  usePlanetAssets: (ids: string[]) => mockUsePlanetAssets(ids),
}))

let mockPlanets: { filteredPlanets: any[]; loading: boolean }
jest.mock('graphql/hooks/usePlanets', () => ({
  usePlanets: () => mockPlanets,
}))

const planets = [
  {
    id: 'eyeke',
    planet_details: { title: 'Eyeke' },
    land_maps: [{ asset_id: '1' }, { asset_id: '2' }],
  },
  { id: 'kavian', planet_details: { title: 'Kavian' }, land_maps: [{ asset_id: '3' }] },
]

const showLandPage = jest.fn()
const setPlanetSelectedForMiningIntent = jest.fn()

const defaultFilter = { isLoading: false, sortBy: 'Random' }

const setup = ({
  wax = {},
  atomic = {},
}: { wax?: Record<string, any>; atomic?: Record<string, any> } = {}) => {
  const store = (landAssetsFilter = defaultFilter) =>
    mockStore({
      state: {
        atomic: { landAssetsFilter, landAsset: null, ...atomic },
        wax: {
          whereToMine: 'eyeke',
          planetSelectedForMining: 'kavian',
          isOnboarded: true,
          ...wax,
        },
      },
      actions: {
        wax: { setPlanetSelectedForMiningIntent },
        main: { showLandPage },
      },
    })
  store(atomic.landAssetsFilter)
  const view = render(<Land />)
  return {
    ...view,
    setFilter: (landAssetsFilter: any) => {
      store(landAssetsFilter)
      view.rerender(<Land />)
    },
  }
}

beforeEach(() => {
  jest.clearAllMocks()
  mockUseRarityPools.mockReturnValue({ data: [], refetch: mockRefetch })
  mockFilterAssets.mockImplementation((assets: any[]) => assets)
  mockPlanetAssets = undefined
  mockUsePlanetAssets.mockImplementation(() => ({ data: mockPlanetAssets }))
  mockPlanets = { filteredPlanets: planets, loading: false }
  useSessionStore.getState().setWalletId('miner.wam')
  useModalStore.setState({ planetDetailsDrawer: { isOpen: false } })
})

const lastAssetIds = () => mockUsePlanetAssets.mock.calls.at(-1)[0]

describe('Land page', () => {
  it.each([
    ['the planets load', { filteredPlanets: planets, loading: true }],
    ['there are no planets', { filteredPlanets: [], loading: false }],
  ])('shows a spinner while %s', (_, planetsResult) => {
    mockPlanets = planetsResult

    setup()

    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument()
  })

  it('loads the lands of the planet being browsed', () => {
    setup()

    expect(lastAssetIds()).toEqual(['1', '2'])
    expect(mockUseRarityPools).toHaveBeenCalledWith('kavian.world')
  })

  it('shows a land card for each land, up to 32', () => {
    mockPlanetAssets = Array.from({ length: 40 }, (_, i) => ({ asset_id: `${i}` }))

    setup()

    expect(screen.getAllByTestId('land-card')).toHaveLength(32)
  })

  it('shows a loading message until the lands arrive', () => {
    setup()

    expect(screen.getByText('Loading Lands from eyeke, please wait..')).toBeInTheDocument()
  })

  // Current behaviour: the "no lands" message shows while the filter is loading, not after.
  it('shows the no-lands message while the filter is loading', () => {
    setup({ atomic: { landAssetsFilter: { ...defaultFilter, isLoading: true } } })

    expect(
      screen.getByText('There are no Lands matching the selected criteria.')
    ).toBeInTheDocument()
  })

  it('re-filters the lands when the land filter changes', () => {
    mockPlanetAssets = [{ asset_id: '1' }, { asset_id: '2' }]
    mockFilterAssets.mockReturnValue([{ asset_id: '2' }])
    const { setFilter } = setup()
    const filter = { ...defaultFilter, owner: 'bob' }

    setFilter(filter)

    expect(mockFilterAssets).toHaveBeenLastCalledWith(mockPlanetAssets, filter)
    expect(screen.getAllByTestId('land-card')).toHaveLength(1)
  })

  it('marks the planet being mined', () => {
    setup({
      wax: { planetSelectedForMining: 'eyeke' },
      atomic: { landAsset: { asset_id: '1', name: 'Plains on Eyeke', data: {} } },
    })

    expect(screen.getByText('currently mining')).toBeInTheDocument()
    expect(screen.getByTestId('mining-land')).toBeInTheDocument()
  })

  it('does not mark a planet that is not being mined', () => {
    setup()

    expect(screen.queryByText('currently mining')).not.toBeInTheDocument()
  })

  it('only enables the in-use marker on the land being mined', () => {
    mockPlanetAssets = [{ asset_id: '1' }, { asset_id: '2' }]

    setup({ atomic: { landAsset: { asset_id: '2', name: 'Plains on Eyeke', data: {} } } })

    expect(screen.getAllByTestId('in-use').map((x) => x.getAttribute('data-disabled'))).toEqual([
      'true',
      'false',
    ])
  })

  it('switches planet from the dropdown', async () => {
    setup()

    await userEvent.selectOptions(screen.getByLabelText('planet'), 'kavian')

    expect(mockRefetch).toHaveBeenCalledWith('kavian.world')
    expect(setPlanetSelectedForMiningIntent).toHaveBeenCalledWith('kavian')
    expect(showLandPage).toHaveBeenCalledWith({ assetIds: ['3'], planetName: 'kavian' })
  })

  it('toggles the land filters', async () => {
    setup()
    expect(screen.queryByTestId('lands-filterbar')).not.toBeInTheDocument()

    await userEvent.click(screen.getByText('Filters'))

    expect(screen.getByTestId('lands-filterbar')).toBeInTheDocument()
  })

  it('opens the rarity pool details modal', async () => {
    setup()

    await userEvent.click(screen.getByRole('button', { name: 'Pool Details' }))

    expect(useModalStore.getState().primaryModals.RarityPoolsPieChartModal).toBe(true)
  })

  it('offers a way back to onboarding for players not yet onboarded', async () => {
    const { container } = setup({ wax: { isOnboarded: false } })

    await userEvent.click(container.querySelector('svg'))

    expect(mockNavigate).toHaveBeenCalledWith('/onboarding/planet')
  })
})
