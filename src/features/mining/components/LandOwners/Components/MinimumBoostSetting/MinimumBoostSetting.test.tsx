import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { mockStore } from 'features/mining/testUtils/mockStore'
import { useSessionStore } from 'shared/store/sessionStore'

import { MinimumBoostSetting } from './MinimumBoostSetting'

jest.mock('store', () => jest.requireActual('features/mining/testUtils/mockStore').storeMock)
jest.mock('@alien-worlds/uikit', () => ({
  Dropdown: ({ options, onChange, defaultValue, isDisabled }: any) => (
    <select
      aria-label="minimum boost"
      disabled={isDisabled}
      defaultValue={defaultValue.value}
      onChange={(e) => onChange(options.find((o: any) => o.value === e.target.value))}
    >
      {options.map((o: any) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  ),
}))

const setMinBoost = jest.fn()
const loadManagingLandDetailsAndBoostsWithDelay = jest.fn()

// MinBoostAmount is stored as price * 10000.
const setup = (minBoostAmount: number | undefined, owner = 'owner.wam') => {
  mockStore({
    state: {
      wax: {
        managingLandId: '42',
        managingLandDetails: { owner, data: { MinBoostAmount: minBoostAmount } },
      },
    },
    actions: { wax: { setMinBoost, loadManagingLandDetailsAndBoostsWithDelay } },
  })
  return render(<MinimumBoostSetting />)
}

beforeEach(() => {
  jest.clearAllMocks()
  setMinBoost.mockResolvedValue(true)
  useSessionStore.getState().setWalletId('owner.wam')
})

describe('MinimumBoostSetting', () => {
  it('shows the land minimum boost', () => {
    setup(160000)

    expect(screen.getByLabelText('minimum boost')).toHaveValue('Medium Boost')
  })

  // Current behaviour: the default MinBoostAmount (0) matches no boost level, so nothing shows.
  it('renders nothing when the land has no minimum boost set', () => {
    const { container } = setup(undefined)

    expect(container).toBeEmptyDOMElement()
  })

  it('saves a new minimum boost and reloads the land', async () => {
    setup(40000)

    await userEvent.selectOptions(screen.getByLabelText('minimum boost'), 'High Boost')

    expect(setMinBoost).toHaveBeenCalledWith({ landId: '42', levelPrice: 64 })
    await waitFor(() => expect(loadManagingLandDetailsAndBoostsWithDelay).toHaveBeenCalled())
  })

  it('does not save the same level again', async () => {
    setup(40000)

    await userEvent.selectOptions(screen.getByLabelText('minimum boost'), 'Small Boost')

    expect(setMinBoost).not.toHaveBeenCalled()
  })

  it('is read-only for players who do not own the land', () => {
    setup(40000, 'someone.wam')

    expect(screen.getByLabelText('minimum boost')).toBeDisabled()
  })
})
