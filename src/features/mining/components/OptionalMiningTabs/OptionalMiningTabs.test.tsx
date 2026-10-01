import { render, screen } from '@testing-library/react'
import { mockStore } from 'features/mining/testUtils/mockStore'

import { OptionalMiningTabs } from './OptionalMiningTabs'

jest.mock('store', () => jest.requireActual('features/mining/testUtils/mockStore').storeMock)
jest.mock('features/mining/components/MiningTabs/MiningTabs', () => ({
  MiningTabs: () => <div data-testid="mining-tabs" />,
}))

describe('OptionalMiningTabs', () => {
  it.each([
    [true, 1],
    [false, 0],
  ])('shows the mining tabs when onboarded is %s', (isOnboarded, count) => {
    mockStore({ state: { wax: { isOnboarded } } })

    render(<OptionalMiningTabs />)

    expect(screen.queryAllByTestId('mining-tabs')).toHaveLength(count)
  })
})
