import { act, fireEvent, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { mockStore, renderWithChakra } from 'features/mining/testUtils/mockStore'

import { PlanetCoordinates } from './PlanetCoordinates'

jest.mock('store', () => jest.requireActual('features/mining/testUtils/mockStore').storeMock)
jest.mock('@alien-worlds/uikit', () => ({
  Button: ({ children, type }: any) => <button type={type}>{children}</button>,
  FormField: ({ name, value, onChange }: any) => (
    <input aria-label={name} value={value} onChange={onChange} />
  ),
}))

const setLandAssetsFilter = jest.fn()
const resetLandAssetsFilter = jest.fn()

const setup = (x: number | null = null, y: number | null = null) => {
  mockStore({
    state: { atomic: { landAssetsFilter: { x, y, owner: null } } },
    actions: { atomic: { setLandAssetsFilter, resetLandAssetsFilter } },
  })
  return renderWithChakra(
    <PlanetCoordinates setFilterbarIsOpen={jest.fn()} filterbarIsOpen={false} />
  )
}

beforeEach(() => {
  jest.clearAllMocks()
  jest.useFakeTimers()
})

afterEach(() => jest.useRealTimers())

describe('PlanetCoordinates', () => {
  it('shows the current coordinates', () => {
    setup(3, 7)

    expect(screen.getByLabelText('num1')).toHaveValue('3')
    expect(screen.getByLabelText('num2')).toHaveValue('7')
  })

  it('filters by x after a short pause', () => {
    setup()

    fireEvent.change(screen.getByLabelText('num1'), { target: { value: '12' } })
    expect(setLandAssetsFilter).not.toHaveBeenCalled()
    act(() => jest.advanceTimersByTime(300))

    expect(setLandAssetsFilter).toHaveBeenCalledWith({ x: 12, y: null, owner: null })
  })

  it('clears y when emptied', () => {
    setup(null, 7)

    fireEvent.change(screen.getByLabelText('num2'), { target: { value: '' } })
    act(() => jest.advanceTimersByTime(300))

    expect(setLandAssetsFilter).toHaveBeenCalledWith({ x: null, y: null, owner: null })
  })

  it('resets every land filter', async () => {
    jest.useRealTimers()
    setup(3, 7)

    await userEvent.click(screen.getByRole('button', { name: 'Reset Filters' }))

    await waitFor(() => expect(resetLandAssetsFilter).toHaveBeenCalled())
  })
})
