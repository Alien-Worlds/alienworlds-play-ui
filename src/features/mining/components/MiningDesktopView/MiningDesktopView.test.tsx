import { render, screen } from '@testing-library/react'
import { mockStore } from 'features/mining/testUtils/mockStore'

import { MiningDesktopView } from './MiningDesktopView'

jest.mock('store', () => jest.requireActual('features/mining/testUtils/mockStore').storeMock)

let mockIsNotDesktop = false
jest.mock('shared/util/hooks', () => ({
  useScreenSize: () => ({ isNotDesktop: mockIsNotDesktop, isMediumScreen: true }),
}))

jest.mock('features/mining/components/PlanetLand/Components/PlanetImage', () => ({
  PlanetImage: ({ dacId, land }: any) => (
    <div data-testid="planet">{`${dacId} ${land.asset_id}`}</div>
  ),
}))
jest.mock('features/mining/components/PlanetLand/Components/PlanetTitle', () => ({
  PlanetTitle: ({ land }: any) => <div data-testid="title">{land.asset_id}</div>,
}))
jest.mock('features/mining/components/PlanetLand/Components/LandCharge', () => ({
  LandCharge: ({ land }: any) => <div data-testid="charge">{land.asset_id}</div>,
}))
jest.mock('features/mining/components/PlanetLand/Components/LandCommission', () => ({
  LandCommission: ({ land }: any) => <div data-testid="commission">{land.asset_id}</div>,
}))
jest.mock('features/mining/components/PlanetLand/Components/ChargeTime', () => ({
  ChargeTime: () => <div data-testid="stat" />,
}))
jest.mock('features/mining/components/PlanetLand/Components/MiningPower', () => ({
  MiningPower: () => <div data-testid="stat" />,
}))
jest.mock('features/mining/components/PlanetLand/Components/NftLuck', () => ({
  NftLuck: () => <div data-testid="stat" />,
}))
jest.mock('features/mining/components/PlanetLand/Components/PowReduction', () => ({
  PowReduction: () => <div data-testid="stat" />,
}))
jest.mock('features/syndicates/components/PlanetaryActions/PlanetaryActions', () => ({
  ClaimMineRewardsBtn: () => <button type="button">Mine</button>,
}))

beforeEach(() => {
  mockStore({
    state: { atomic: { landAsset: { asset_id: '42' } }, wax: { planetSelectedForMining: 'eyeke' } },
  })
})

describe('MiningDesktopView', () => {
  it.each([
    ['desktop', false],
    ['smaller screens', true],
  ])('shows the mining land, stats and mine button on %s', (_, isNotDesktop) => {
    mockIsNotDesktop = isNotDesktop

    render(<MiningDesktopView />)

    expect(screen.getByTestId('planet')).toHaveTextContent('eyeke 42')
    expect(screen.getByTestId('title')).toHaveTextContent('42')
    expect(screen.getByTestId('charge')).toHaveTextContent('42')
    expect(screen.getByTestId('commission')).toHaveTextContent('42')
    expect(screen.getAllByTestId('stat')).toHaveLength(4)
    expect(screen.getByRole('button', { name: 'Mine' })).toBeInTheDocument()
  })
})
