import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { mockStore } from 'features/mining/testUtils/mockStore'

import { PlanetImage } from './PlanetImage'

jest.mock('store', () => jest.requireActual('features/mining/testUtils/mockStore').storeMock)
jest.mock('features/mining/components/PlanetLand/Components/LandIndicator', () => ({
  LandIndicator: () => <div data-testid="land-indicator" />,
}))
jest.mock('features/syndicates/components/LoadingSpinner/LoadingSpinner', () => ({
  LoadingSpinner: () => <div data-testid="loading-spinner" />,
}))

let mockPlanetDetail: any
const mockUsePlanetDetail = jest.fn()
jest.mock('graphql/hooks/usePlanetDetail', () => ({
  usePlanetDetail: (planet: string) => {
    mockUsePlanetDetail(planet)
    return mockPlanetDetail
  },
}))

let mockRarityPools: any[]
const mockUseRarityPools = jest.fn()
jest.mock('features/mining/hooks/useRarityPools', () => ({
  useRarityPools: (planet: string) => {
    mockUseRarityPools(planet)
    return { data: mockRarityPools }
  },
}))

const planet: any = { planet_details: { planet_name: 'kavian.world', title: 'Kavian' } }

beforeEach(() => {
  jest.clearAllMocks()
  mockStore({ state: { wax: { planetSelectedForMining: 'eyeke' } } })
  mockPlanetDetail = { planetDetails: { planet_details: { planet_name: 'eyeke' } }, loading: false }
  mockRarityPools = [{ amount: '1200.5000 TLM' }, { amount: '300.0000 TLM' }]
})

describe('PlanetImage', () => {
  it('loads the mining planet and the pools of the planet shown', () => {
    render(<PlanetImage planet={planet} />)

    expect(mockUsePlanetDetail).toHaveBeenCalledWith('eyeke')
    expect(mockUseRarityPools).toHaveBeenCalledWith('kavian.world')
  })

  it('shows the planet name and total pool size in the heading', () => {
    render(<PlanetImage dacId="kavian" planet={planet} showHeading />)

    expect(screen.getByRole('heading', { name: 'Kavian' })).toBeInTheDocument()
    expect(screen.getByText('1500 TLM')).toBeInTheDocument()
  })

  it('shows the planet image', () => {
    render(<PlanetImage dacId="eyeke" planet={planet} />)

    expect(screen.getByRole('img', { name: 'Kavian' })).toHaveAttribute(
      'src',
      '/images/planets/eyeke_sm.jpg'
    )
  })

  it('shows the land on the planet when asked', () => {
    render(<PlanetImage dacId="eyeke" showLandIndicator land={{} as any} />)

    expect(screen.getByTestId('land-indicator')).toBeInTheDocument()
  })

  // Rendered as <button role="group">, so it is found by the group role.
  it('is clickable', async () => {
    const onClick = jest.fn()
    render(<PlanetImage dacId="eyeke" planet={planet} onClick={onClick} />)

    await userEvent.click(screen.getByRole('group'))

    expect(onClick).toHaveBeenCalled()
  })

  it('shows a spinner while the mining planet loads', () => {
    mockPlanetDetail = { planetDetails: null, loading: true }

    render(<PlanetImage dacId="eyeke" />)

    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument()
  })
})
