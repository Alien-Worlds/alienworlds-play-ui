import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { StakeActions } from './StakeActions'

const baseProps = {
  onSubmitStake: jest.fn(),
  onUnstakeAll: jest.fn(),
  onSubmitLore: jest.fn(),
  onStakeInputChange: jest.fn(),
  isMobile: false,
  isDesktop: true,
  isFullWidth: false,
  walletBalance: 100,
  newDailyReward: '5.00',
}

describe('StakeActions', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  it('renders the stake amount input and action buttons', () => {
    render(<StakeActions {...baseProps} />)

    expect(screen.getByPlaceholderText('Enter TLM amount 10 000 e.g.')).toBeInTheDocument()
    expect(screen.getByText('Stake TLM')).toBeInTheDocument()
    expect(screen.getByText('Unstake All TLM')).toBeInTheDocument()
  })

  it('calls onStakeInputChange as the amount is typed', async () => {
    render(<StakeActions {...baseProps} />)

    await userEvent.type(screen.getByPlaceholderText('Enter TLM amount 10 000 e.g.'), '5')

    expect(baseProps.onStakeInputChange).toHaveBeenCalledWith(5)
  })

  it('submits the typed amount through onSubmitStake', async () => {
    render(<StakeActions {...baseProps} />)

    await userEvent.type(screen.getByPlaceholderText('Enter TLM amount 10 000 e.g.'), '25')
    await userEvent.click(screen.getByText('Stake TLM'))

    expect(baseProps.onSubmitStake).toHaveBeenCalledWith('25')
  })

  it('calls onUnstakeAll when the unstake button is clicked', async () => {
    render(<StakeActions {...baseProps} />)

    await userEvent.click(screen.getByText('Unstake All TLM'))

    expect(baseProps.onUnstakeAll).toHaveBeenCalled()
  })

  it('shows the Submit Lore button when not on desktop', async () => {
    render(<StakeActions {...baseProps} isDesktop={false} />)

    const submitLoreButton = screen.getByText('Submit Lore')
    expect(submitLoreButton).toBeInTheDocument()

    await userEvent.click(submitLoreButton)
    expect(baseProps.onSubmitLore).toHaveBeenCalled()
  })

  it('applies the "hidden" class to the Submit Lore wrapper on desktop', () => {
    render(<StakeActions {...baseProps} isDesktop />)
    const submitLoreButton = screen.getByText('Submit Lore')
    expect(submitLoreButton.closest('div')?.className).toContain('hidden')
  })

  it('renders the daily reward banner with the new daily reward', () => {
    render(<StakeActions {...baseProps} newDailyReward="12.34" />)
    expect(screen.getAllByText('12.34').length).toBeGreaterThan(0)
  })
})
