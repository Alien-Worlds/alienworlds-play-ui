import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { StakeRewardsLore } from './StakeRewardsLore'

describe('StakeRewardsLore', () => {
  it('renders the formatted pool share, pending rewards and daily reward', () => {
    render(
      <StakeRewardsLore
        poolShare={12.3456}
        pendingRewards={7.891}
        dailyReward="4.20"
        onClaimReward={jest.fn()}
      />
    )

    expect(screen.getByText('12.3456%')).toBeInTheDocument()
    expect(screen.getByText('7.8910')).toBeInTheDocument()
    expect(screen.getByText('4.20')).toBeInTheDocument()
  })

  it('renders the four explainer steps', () => {
    render(
      <StakeRewardsLore
        poolShare={0}
        pendingRewards={0}
        dailyReward="0.00"
        onClaimReward={jest.fn()}
      />
    )

    expect(screen.getByText('1. Stake TLM')).toBeInTheDocument()
    expect(screen.getByText('2. Generate VP')).toBeInTheDocument()
    expect(screen.getByText('3. Vote on Proposals')).toBeInTheDocument()
    expect(screen.getByText('4. Earn TLM Rewards')).toBeInTheDocument()
  })

  it('calls onClaimReward when the claim button is clicked', async () => {
    const onClaimReward = jest.fn()
    render(
      <StakeRewardsLore
        poolShare={1}
        pendingRewards={1}
        dailyReward="1.00"
        onClaimReward={onClaimReward}
      />
    )

    await userEvent.click(screen.getByText('Claim TLM Reward'))
    expect(onClaimReward).toHaveBeenCalled()
  })
})
