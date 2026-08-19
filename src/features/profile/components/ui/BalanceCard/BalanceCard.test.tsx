import { render, screen } from '@testing-library/react'

import { BalanceCard } from './BalanceCard'

describe('BalanceCard', () => {
  it('renders the label, formatted amount, and currency', () => {
    render(<BalanceCard icon={<svg />} label="WAX" amount={12.5} />)

    expect(screen.getByText('WAX')).toBeInTheDocument()
    expect(screen.getByText('12.5000')).toBeInTheDocument()
    expect(screen.getByText('TLM')).toBeInTheDocument()
  })

  it('formats a string amount to the configured decimal places', () => {
    render(<BalanceCard icon={<svg />} label="Shards" amount="7.1" />)
    expect(screen.getByText('7.1000')).toBeInTheDocument()
  })

  it('omits the currency label when currency is an empty string', () => {
    render(<BalanceCard icon={<svg />} label="Shards" amount={1} currency="" />)
    expect(screen.queryByText('TLM')).not.toBeInTheDocument()
  })

  it('does not render the icon wrapper when showIcon is false', () => {
    const { container } = render(
      <BalanceCard icon={<svg data-testid="icon" />} label="WAX" amount={1} showIcon={false} />
    )
    expect(container.querySelector('[data-testid="icon"]')).not.toBeInTheDocument()
  })
})
