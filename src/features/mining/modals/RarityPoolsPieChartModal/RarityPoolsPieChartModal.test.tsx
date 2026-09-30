import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { mockStore, renderWithChakra } from 'features/mining/testUtils/mockStore'
import { useModalStore } from 'shared/store/modalStore'

import { RarityPoolsPieChartModal } from './RarityPoolsPieChartModal'

jest.mock('store', () => jest.requireActual('features/mining/testUtils/mockStore').storeMock)
jest.mock('features/mining/components/RarityPoolsPieChart', () => ({
  RarityPoolsPieChart: () => <div data-testid="pie-chart" />,
}))

const mockUseRarityPools = jest.fn()
jest.mock('features/mining/hooks/useRarityPools', () => ({
  useRarityPools: (planet: string) => mockUseRarityPools(planet),
}))

const setup = (wax: Record<string, any>) => {
  mockStore({ state: { wax } })
  useModalStore
    .getState()
    .setPrimaryModalActive({ modalName: 'RarityPoolsPieChartModal', value: true })
  return renderWithChakra(<RarityPoolsPieChartModal />)
}

beforeEach(() => {
  mockUseRarityPools.mockReset().mockReturnValue({ data: [] })
})

describe('RarityPoolsPieChartModal', () => {
  it('shows the pools of the planet being mined', () => {
    setup({ planetSelectedForMining: 'eyeke', whereToMineIntent: null })

    expect(mockUseRarityPools).toHaveBeenCalledWith('eyeke.world')
    expect(screen.getByTestId('pie-chart')).toBeInTheDocument()
  })

  it('prefers the planet the player is about to mine', () => {
    setup({ planetSelectedForMining: 'eyeke', whereToMineIntent: 'kavian' })

    expect(mockUseRarityPools).toHaveBeenCalledWith('kavian.world')
  })

  it('closes through the modal store', async () => {
    setup({ planetSelectedForMining: 'eyeke' })

    await userEvent.click(screen.getByRole('button', { name: 'Close' }))

    expect(useModalStore.getState().primaryModals.RarityPoolsPieChartModal).toBe(false)
  })
})
