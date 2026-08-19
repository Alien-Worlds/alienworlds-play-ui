import { render, screen } from '@testing-library/react'

import { TokensBalances } from './TokenBalances'

jest.mock('features/profile/components/PlanetaryClaims/PlanetaryClaims', () => ({
  PlanetaryClaims: () => <div data-testid="planetary-claims" />,
}))
jest.mock('features/profile/components/PlanetaryTokens/PlanetaryTokens', () => ({
  PlanetaryTokens: () => <div data-testid="planetary-tokens" />,
}))

describe('TokensBalances', () => {
  it('renders the planetary claims and planetary tokens sections', () => {
    render(<TokensBalances />)

    expect(screen.getByTestId('planetary-claims')).toBeInTheDocument()
    expect(screen.getByTestId('planetary-tokens')).toBeInTheDocument()
  })
})
