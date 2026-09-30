import { render, screen } from '@testing-library/react'
import { mockStore } from 'features/mining/testUtils/mockStore'

import { PlanetTitle } from './PlanetTitle'

jest.mock('store', () => jest.requireActual('features/mining/testUtils/mockStore').storeMock)
jest.mock('features/syndicates/components/LoadingSpinner/LoadingSpinner', () => ({
  LoadingSpinner: () => <div data-testid="loading-spinner" />,
}))

let mockPlanetDetail: any
const mockUsePlanetDetail = jest.fn()
jest.mock('graphql/hooks/usePlanetDetail', () => ({
  usePlanetDetail: (planet: string) => mockUsePlanetDetail(planet) ?? mockPlanetDetail,
}))

const land: any = { name: 'Mountains on Eyeke', data: { x: 4, y: 7 } }

const setup = (planetSelectedForMining: string | null) => {
  mockStore({ state: { wax: { planetSelectedForMining } } })
  return render(<PlanetTitle land={land} />)
}

beforeEach(() => {
  mockPlanetDetail = { planetDetails: { planet_details: { title: 'Eyeke' } }, loading: false }
})

describe('PlanetTitle', () => {
  it('shows the mining planet, coordinates and terrain', () => {
    setup('eyeke')

    expect(mockUsePlanetDetail).toHaveBeenCalledWith('eyeke')
    expect(screen.getByText('Eyeke')).toBeInTheDocument()
    expect(screen.getByText('(4:7)')).toBeInTheDocument()
    expect(screen.getByText('Mountains')).toBeInTheDocument()
  })

  it('renders nothing without a mining planet', () => {
    const { container } = setup(null)

    expect(container).toBeEmptyDOMElement()
  })

  it('shows a spinner while loading', () => {
    mockPlanetDetail = { planetDetails: null, loading: true }

    setup('eyeke')

    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument()
  })
})
