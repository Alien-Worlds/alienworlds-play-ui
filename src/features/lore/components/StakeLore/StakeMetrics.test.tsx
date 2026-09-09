import { render, screen } from '@testing-library/react'

import { StakeMetrics } from './StakeMetrics'

describe('StakeMetrics', () => {
  it('renders the wallet id, formatted balances, and vote power', () => {
    render(
      <StakeMetrics
        walletId="wallet.wam"
        walletBalance={1234.5678}
        stakedAmount={500}
        tlmPoolSize={99999}
        currentVotePower={42}
        dailyReward="3.14"
      />
    )

    expect(screen.getByText('wallet.wam')).toBeInTheDocument()
    expect(screen.getByText('1,234.5678')).toBeInTheDocument()
    expect(screen.getByText('500.0000')).toBeInTheDocument()
    expect(screen.getByText('42')).toBeInTheDocument()
    expect(screen.getByText('3.14')).toBeInTheDocument()
    expect(screen.getByText('99,999.0000')).toBeInTheDocument()
  })

  it('defaults balances to zero when they are nullish', () => {
    render(
      <StakeMetrics
        walletId="wallet.wam"
        walletBalance={null as unknown as number}
        stakedAmount={null as unknown as number}
        tlmPoolSize={null as unknown as number}
        currentVotePower={7}
        dailyReward="0.00"
      />
    )

    expect(screen.getAllByText('0')).toHaveLength(3)
    expect(screen.getByText('7')).toBeInTheDocument()
  })
})
