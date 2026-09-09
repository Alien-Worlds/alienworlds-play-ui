import { render, screen } from '@testing-library/react'

let mockUseStakeLoreResult: any
let mockIsLoading = false

jest.mock('features/lore/hooks/useStakeLore', () => ({
  useStakeLore: () => mockUseStakeLoreResult,
}))

jest.mock('shared/util/hooks', () => ({
  useScreenSize: () => ({ isMobile: false, isDesktop: true, isTablet: false }),
}))

jest.mock('features/syndicates/components/LoadingSpinner/LoadingSpinner', () => ({
  LoadingSpinner: () => <div data-testid="loading-spinner" />,
}))

import { StakeLore } from './StakeLore'

describe('StakeLore', () => {
  beforeEach(() => {
    mockIsLoading = false
    mockUseStakeLoreResult = {
      walletId: 'wallet.wam',
      walletBalance: 100,
      stakedAmount: 50,
      tlmPoolSize: 1000,
      poolShare: 5,
      pendingRewards: 2.5,
      dailyReward: '5.00',
      handlers: {
        onSubmitStake: jest.fn(),
        onUnstakeAll: jest.fn(),
        onSubmitLore: jest.fn(),
        onChangeStakeInput: jest.fn(),
        onClaimReward: jest.fn(),
      },
      state: { stakedInput: 0, newDailyReward: '5.00' },
      get isLoading() {
        return mockIsLoading
      },
    }
  })

  it('shows a loading spinner while stake data is loading', () => {
    mockIsLoading = true
    render(<StakeLore currentNumber={10} />)
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument()
  })

  it('renders the metrics, actions, and rewards sections once loaded', () => {
    render(<StakeLore currentNumber={10} />)

    expect(screen.getByText('wallet.wam')).toBeInTheDocument()
    expect(screen.getByText('Stake TLM')).toBeInTheDocument()
    expect(screen.getByText('Claim TLM Reward')).toBeInTheDocument()
  })

  it('passes the current vote power through to the metrics section', () => {
    render(<StakeLore currentNumber={77} />)
    expect(screen.getByText('77')).toBeInTheDocument()
  })
})
