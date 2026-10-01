import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { mockStore } from 'features/mining/testUtils/mockStore'
import { MiningToolsActiveSlotNumber } from 'features/mining/types/MiningTypes'
import { useModalStore } from 'shared/store/modalStore'

import { Mining } from './Mining'

jest.mock('store', () => jest.requireActual('features/mining/testUtils/mockStore').storeMock)

const stub =
  (testId: string) =>
  ({ children }: any) =>
    <div data-testid={testId}>{children}</div>

jest.mock('features/mining/components/MiningSelect', () => ({ MiningSelect: () => null }))
jest.mock('features/mining/components/MiningTabs/MiningTabs', () => ({
  MiningTabs: () => null,
  MiningTabPanelMotion: ({ children }: any) => <div>{children}</div>,
}))
jest.mock('features/mining/components/BagItemChooser', () => ({
  BagItemChooser: ({ index }: any) => <div data-testid="bag-slot">{index}</div>,
}))
jest.mock('features/mining/components/MiningToolDrawer', () => ({
  MiningToolsDrawer: () => <div data-testid="mining-tools-drawer" />,
}))
jest.mock('features/mining/components/PlanetLand/Components/ChargeTime', () => ({
  ChargeTime: () => null,
}))
jest.mock('features/mining/components/PlanetLand/Components/MiningPower', () => ({
  MiningPower: () => null,
}))
jest.mock('features/mining/components/PlanetLand/Components/NftLuck', () => ({
  NftLuck: () => null,
}))
jest.mock('features/mining/components/PlanetLand/Components/PowReduction', () => ({
  PowReduction: () => null,
}))
jest.mock('features/mining/components/PlanetLand/Components/LandImage', () => ({
  LandImage: () => null,
}))
jest.mock('features/mining/components/PlanetLand/Components/PlanetImage', () => ({
  PlanetImage: ({ dacId }: any) => <div data-testid="planet-image">{dacId}</div>,
}))
jest.mock('features/mining/components/PlanetLand/Components/PlanetDetailsButton', () => ({
  PlanetDetailsButton: ({ onClick, pointerEvents }: any) => (
    <button type="button" onClick={onClick} style={{ pointerEvents }}>
      Planet details
    </button>
  ),
}))
jest.mock('features/mining/components/RarityPoolsBarChart', () => ({
  RarityPoolsBarChart: () => <div data-testid="rarity-pools-chart" />,
}))
jest.mock('features/mining/modals/PlanetDetailsDrawer', () => ({
  PlanetDetailsDrawer: ({ isOpen, planet }: any) =>
    isOpen ? <div data-testid="planet-details-drawer">{planet}</div> : null,
}))
jest.mock('features/glossary/components/GlossaryInfoIcon/GlossaryInfoIcon', () => ({
  GlossaryInfoIcon: () => null,
}))
jest.mock('shared/components/RingPositionHelper/RingPositionHelper', () => ({
  RingPositionHelper: ({ children }: any) => <div>{children}</div>,
  RingPositions: { CENTER: 'center' },
}))
jest.mock('features/syndicates/components/LoadingSpinner/LoadingSpinner', () => ({
  LoadingSpinner: stub('loading-spinner'),
}))

const mockRarityPools = jest.fn()
jest.mock('features/mining/hooks/useRarityPools', () => ({
  useRarityPools: (planet: string) => mockRarityPools(planet),
}))

let mockPlanetDetail: { planetDetails: any; loading: boolean }
jest.mock('graphql/hooks/usePlanetDetail', () => ({
  usePlanetDetail: () => mockPlanetDetail,
}))

const showMiningPage = jest.fn()

const land = {
  name: 'Mountains on Eyeke',
  data: { ease: 15, difficulty: 5, luck: 12, delay: 30, x: 4, y: 7 },
}

const setup = ({
  landAsset = land,
  planet = 'eyeke',
}: { landAsset?: any; planet?: string } = {}) => {
  mockStore({
    state: { atomic: { landAsset }, wax: { planetSelectedForMining: planet } },
    actions: { main: { showMiningPage } },
  })
  return render(<Mining />)
}

beforeEach(() => {
  showMiningPage.mockClear()
  mockRarityPools.mockReset().mockReturnValue({ data: [] })
  mockPlanetDetail = {
    planetDetails: { planet_details: { title: 'Eyeke', planet_name: 'eyeke.world' } },
    loading: false,
  }
  useModalStore.setState({
    planetDetailsDrawer: { isOpen: false },
    miningToolsDrawer: { isOpen: false, activeSlotIndex: MiningToolsActiveSlotNumber.SLOT_ONE },
  })
})

describe('Mining page', () => {
  it('registers the page on mount', () => {
    setup()

    expect(showMiningPage).toHaveBeenCalledTimes(1)
  })

  it('shows a spinner while the planet loads', () => {
    mockPlanetDetail = { planetDetails: null, loading: true }

    setup()

    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument()
    expect(screen.queryAllByTestId('bag-slot')).toHaveLength(0)
  })

  it('shows the planet and the mining land stats', () => {
    setup()

    expect(screen.getByTestId('planet-image')).toHaveTextContent('eyeke')
    expect(screen.getByText('Eyeke')).toBeInTheDocument()
    expect(screen.getByText('Mountains')).toBeInTheDocument()
    expect(screen.getByText('4:7')).toBeInTheDocument()
    // charge (delay / 10), mining power (ease / 10), pow, nft power (luck / 10)
    expect(screen.getByText('3')).toBeInTheDocument()
    expect(screen.getByText('1.5')).toBeInTheDocument()
    expect(screen.getByText('5')).toBeInTheDocument()
    expect(screen.getByText('1.2')).toBeInTheDocument()
  })

  it('loads the rarity pools for the planet', () => {
    setup()

    expect(mockRarityPools).toHaveBeenCalledWith('eyeke.world')
    expect(screen.getByTestId('rarity-pools-chart')).toBeInTheDocument()
  })

  it('hides the planet card when no planet is selected', () => {
    setup({ planet: null })

    expect(screen.queryByTestId('planet-image')).not.toBeInTheDocument()
  })

  it('renders the three bag slots', () => {
    setup()

    expect(screen.getAllByTestId('bag-slot').map((x) => x.textContent)).toEqual([
      `${MiningToolsActiveSlotNumber.SLOT_ONE}`,
      `${MiningToolsActiveSlotNumber.SLOT_TWO}`,
      `${MiningToolsActiveSlotNumber.SLOT_THREE}`,
    ])
  })

  it('opens the planet details drawer', async () => {
    setup()

    await userEvent.click(screen.getByRole('button', { name: 'Planet details' }))

    expect(screen.getByTestId('planet-details-drawer')).toHaveTextContent('eyeke')
  })

  it('opens the rarity pool details modal', async () => {
    setup()

    await userEvent.click(screen.getByRole('button', { name: 'Pool Details' }))

    expect(useModalStore.getState().primaryModals.RarityPoolsPieChartModal).toBe(true)
  })

  it('swaps the pool chart for the tools drawer while choosing a tool', () => {
    setup()

    act(() => useModalStore.getState().openMiningToolsDrawer(MiningToolsActiveSlotNumber.SLOT_TWO))

    expect(screen.getByTestId('mining-tools-drawer')).toBeInTheDocument()
    expect(screen.queryByTestId('rarity-pools-chart')).not.toBeInTheDocument()
  })
})
