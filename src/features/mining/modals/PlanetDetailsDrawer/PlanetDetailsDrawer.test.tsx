import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { mockStore, renderWithChakra } from 'features/mining/testUtils/mockStore'
import { MemoryRouter } from 'react-router-dom'

import { PlanetDetailsDrawer } from './PlanetDetailsDrawer'

jest.mock('store', () => jest.requireActual('features/mining/testUtils/mockStore').storeMock)
jest.mock('@alien-worlds/uikit', () => ({
  Button: ({ children, onClick }: any) => (
    <button type="button" onClick={onClick}>
      {children}
    </button>
  ),
}))
jest.mock('features/mining/components/PlanetLand/Components/CardCharge', () => ({
  CardCharge: () => null,
}))
jest.mock('features/mining/components/PlanetLand/Components/CardIcons', () => ({
  CardIcons: () => null,
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
jest.mock('features/mining/components/PlanetLand/Components/PlanetImage', () => ({
  PlanetImage: () => null,
}))
jest.mock('features/mining/components/PlanetLand/Components/LandImage', () => ({
  LandImage: () => <div data-testid="mining-land" />,
}))
jest.mock('features/mining/components/RarityPoolsGrid', () => ({
  RarityPoolsGrid: ({ planetName }: any) => <div data-testid="pools">{planetName}</div>,
}))
jest.mock('features/syndicates/components/LoadingSpinner/LoadingSpinner', () => ({
  LoadingSpinner: () => <div data-testid="loading-spinner" />,
}))

let mockPlanetDetail: any
jest.mock('graphql/hooks/usePlanetDetail', () => ({
  usePlanetDetail: () => mockPlanetDetail,
}))

const setPlanetSelectedForMiningIntent = jest.fn()
const onClose = jest.fn()

const setup = ({ mining = 'eyeke', path = '/mining/planet' } = {}) => {
  mockStore({
    state: {
      wax: { planetSelectedForMining: mining },
      atomic: { landAsset: { name: 'Mountains on Kavian', data: { x: 1, y: 2 } } },
    },
    actions: { wax: { setPlanetSelectedForMiningIntent } },
  })
  return renderWithChakra(
    <MemoryRouter initialEntries={[path]}>
      <PlanetDetailsDrawer planet="kavian" isOpen onClose={onClose} />
    </MemoryRouter>
  )
}

beforeEach(() => {
  jest.clearAllMocks()
  mockPlanetDetail = {
    planetDetails: {
      dac_id: 'kavian',
      planet_details: {
        title: 'Kavian',
        planet_name: 'kavian.world',
        metadata: { description: 'A red planet.' },
      },
    },
    loading: false,
  }
})

describe('PlanetDetailsDrawer', () => {
  it('shows the planet', () => {
    setup()

    expect(screen.getByText('Kavian')).toBeInTheDocument()
    expect(screen.getByText('A red planet.')).toBeInTheDocument()
    expect(screen.getByTestId('pools')).toHaveTextContent('kavian.world')
    expect(screen.queryByText('currently mining')).not.toBeInTheDocument()
  })

  it('shows the mining land when it is the planet being mined', () => {
    setup({ mining: 'kavian' })

    expect(screen.getByText('currently mining')).toBeInTheDocument()
    expect(screen.getByTestId('mining-land')).toBeInTheDocument()
    expect(screen.getByText('Mountains')).toBeInTheDocument()
  })

  it('explores the planet', async () => {
    setup()

    await userEvent.click(screen.getByRole('button', { name: 'Explore' }))

    expect(onClose).toHaveBeenCalled()
    expect(setPlanetSelectedForMiningIntent).toHaveBeenCalledWith('kavian')
  })

  it('hides Explore on the land page', () => {
    setup({ path: '/mining/land' })

    expect(screen.queryByRole('button', { name: 'Explore' })).not.toBeInTheDocument()
  })

  it('shows a spinner while the planet loads', () => {
    mockPlanetDetail = { planetDetails: null, loading: true }

    setup()

    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument()
  })
})
