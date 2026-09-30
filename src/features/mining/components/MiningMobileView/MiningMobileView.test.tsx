import { render, screen } from '@testing-library/react'
import { mockStore } from 'features/mining/testUtils/mockStore'

import { MiningMobileView } from './MiningMobileView'

jest.mock('store', () => jest.requireActual('features/mining/testUtils/mockStore').storeMock)
jest.mock('features/mining/components/PlanetLand/Components/PlanetImage', () => ({
  PlanetImage: ({ dacId }: any) => <div data-testid="planet">{dacId}</div>,
}))
jest.mock('features/mining/components/PlanetLand/Components/PlanetTitle', () => ({
  PlanetTitle: () => null,
}))
jest.mock('features/syndicates/components/PlanetaryActions/PlanetaryActions', () => ({
  ClaimMineRewardsBtn: () => <button type="button">Mine</button>,
}))

beforeEach(() => {
  mockStore({
    state: {
      wax: { planetSelectedForMining: 'eyeke' },
      atomic: {
        landAsset: {
          mutable_data: { commission: 1250 },
          data: { delay: 20, ease: 15, luck: 12, difficulty: 1 },
        },
        bagAssets: [
          {
            schema: { schema_name: 'tool.worlds' },
            data: { delay: 100, ease: 30, luck: 20, difficulty: 2, rarity: 'Rare' },
          },
        ],
      },
    },
  })
})

describe('MiningMobileView', () => {
  it('shows the land commission and charge multiplier', () => {
    render(<MiningMobileView />)

    expect(screen.getByTestId('planet')).toHaveTextContent('eyeke')
    expect(screen.getByText('12.5%')).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument()
  })

  it('shows the mining stats for the bag on the land', () => {
    render(<MiningMobileView />)

    expect(screen.getByText('200s')).toBeInTheDocument()
    expect(screen.getByText('4.50%')).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()
    expect(screen.getByText('2.40')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Mine' })).toBeInTheDocument()
  })
})
