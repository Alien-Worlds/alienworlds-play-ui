import { render, screen } from '@testing-library/react'

import { StakeDailyRewardBanner } from './StakeDailyRewardBanner'

describe('StakeDailyRewardBanner', () => {
  it('renders the new daily reward value in both the desktop and mobile layouts', () => {
    render(<StakeDailyRewardBanner newDailyReward="42.50" />)
    expect(screen.getAllByText('42.50')).toHaveLength(2)
  })

  it('renders the banner copy', () => {
    render(<StakeDailyRewardBanner newDailyReward="0.00" />)
    expect(screen.getAllByText('New total').length).toBeGreaterThan(0)
    expect(screen.getAllByText(/Daily VP Reward/).length).toBeGreaterThan(0)
  })
})
