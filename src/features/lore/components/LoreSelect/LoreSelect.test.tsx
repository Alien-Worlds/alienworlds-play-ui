import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

let mockIsDemoUser = false
jest.mock('store', () => ({
  useAppState: () => ({
    wax: { isDemoUser: mockIsDemoUser },
  }),
}))

import { LoreSelect } from './LoreSelect'

describe('LoreSelect', () => {
  beforeEach(() => {
    mockIsDemoUser = false
  })

  it('renders the option matching the current value', () => {
    render(<LoreSelect value={1} onChange={jest.fn()} />)
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
  })

  it('defaults to the first option when value is out of range', () => {
    render(<LoreSelect value={99} onChange={jest.fn()} />)
    expect(screen.getByText('Lore')).toBeInTheDocument()
  })

  it('calls onChange with the selected option value', async () => {
    const onChange = jest.fn()
    render(<LoreSelect value={0} onChange={onChange} />)

    await userEvent.click(screen.getByText('Lore'))
    const stakeOption = await screen.findByText('Stake')
    await userEvent.click(stakeOption)

    expect(onChange).toHaveBeenCalledWith(2)
  })
})
