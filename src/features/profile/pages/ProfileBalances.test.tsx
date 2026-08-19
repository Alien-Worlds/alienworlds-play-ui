import { render, screen } from '@testing-library/react'

import { ProfileBalances } from './ProfileBalances'

jest.mock('features/profile/components/TokenBalances/TokenBalances', () => ({
  TokensBalances: () => <div data-testid="tokens-balances" />,
}))
jest.mock('features/profile/components/WalletsBalances/WalletsBalances', () => ({
  WalletsBalances: () => <div data-testid="wallets-balances" />,
}))

describe('ProfileBalances', () => {
  it('renders wallets balances and tokens balances sections', () => {
    render(<ProfileBalances />)

    expect(screen.getByTestId('wallets-balances')).toBeInTheDocument()
    expect(screen.getByTestId('tokens-balances')).toBeInTheDocument()
  })
})
