import { act, render, screen } from '@testing-library/react'
import { mockStore } from 'features/mining/testUtils/mockStore'

import { NextBoostCountdown } from './NextBoostCountdown'

jest.mock('store', () => jest.requireActual('features/mining/testUtils/mockStore').storeMock)

let mockMillisLeft = 60000
jest.mock('shared/util/helpers', () => ({
  getDiffToStartOfNext25hDay: () => `${mockMillisLeft / 1000}s`,
  next25hDayDiffNow: () => ({ toMillis: () => mockMillisLeft }),
}))

const loadManagingLandDetailsAndBoostsWithDelay = jest.fn()

beforeEach(() => {
  jest.useFakeTimers()
  jest.clearAllMocks()
  mockMillisLeft = 60000
  mockStore({ actions: { wax: { loadManagingLandDetailsAndBoostsWithDelay } } })
})

afterEach(() => jest.useRealTimers())

describe('NextBoostCountdown', () => {
  it('counts down to the next boost application', () => {
    render(<NextBoostCountdown />)
    expect(screen.getByText('60s')).toBeInTheDocument()

    mockMillisLeft = 59000
    act(() => jest.advanceTimersByTime(1000))

    expect(screen.getByText('59s')).toBeInTheDocument()
    expect(loadManagingLandDetailsAndBoostsWithDelay).not.toHaveBeenCalled()
  })

  it('reloads the land boosts when the new day starts', () => {
    render(<NextBoostCountdown />)

    mockMillisLeft = 1000
    act(() => jest.advanceTimersByTime(1000))

    expect(loadManagingLandDetailsAndBoostsWithDelay).toHaveBeenCalledTimes(1)
  })
})
