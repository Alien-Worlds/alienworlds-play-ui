import { render, screen } from '@testing-library/react'

import { PlanetaryTokens } from './PlanetaryTokens'

const mockUseAppState = jest.fn()
jest.mock('store', () => ({
  useAppState: () => mockUseAppState(),
}))

const mockUseWalletDaoDetails = jest.fn()
jest.mock('graphql/hooks/useWalletDaoDetails', () => ({
  useWalletDaoDetails: (...args: unknown[]) => mockUseWalletDaoDetails(...args),
}))

const mockUseUserDaoBalances = jest.fn()
jest.mock('graphql/hooks/useUserDaoBalances', () => ({
  useUserDaoBalances: (...args: unknown[]) => mockUseUserDaoBalances(...args),
}))

jest.mock('features/glossary/components/GlossaryInfoIcon/GlossaryInfoIcon', () => ({
  GlossaryInfoIcon: () => <div data-testid="glossary-info-icon" />,
}))

jest.mock('features/syndicates/components/LoadingSpinner/LoadingSpinner', () => ({
  LoadingSpinner: () => <div data-testid="loading-spinner" />,
}))

describe('PlanetaryTokens', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  it('renders a loading spinner while wallet dao details or user dao balances are loading', () => {
    mockUseAppState.mockReturnValue({ wax: { selectedDacId: 'eyeke', walletId: 'wallet.wam' } })
    mockUseWalletDaoDetails.mockReturnValue({ walletDaoDetails: null, loading: true })
    mockUseUserDaoBalances.mockReturnValue({ userDaoBalances: {}, loading: false })

    render(<PlanetaryTokens />)
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument()
  })

  it('renders a row per planet from userDaoBalances, excluding testa', () => {
    mockUseAppState.mockReturnValue({ wax: { selectedDacId: 'eyeke', walletId: 'wallet.wam' } })
    mockUseWalletDaoDetails.mockReturnValue({
      walletDaoDetails: { stake_details: { available_tlm_in_dao: '0' } },
      loading: false,
    })
    mockUseUserDaoBalances.mockReturnValue({
      userDaoBalances: {
        eyeke: { stake_details: { available_tlm_in_dao: '10.0000 TLM', staked_amount: '5.0000 TLM' } },
        testa: { stake_details: { available_tlm_in_dao: '1.0000 TLM', staked_amount: '1.0000 TLM' } },
      },
      loading: false,
    })

    render(<PlanetaryTokens />)

    expect(screen.getByText('TLM in Eyeke')).toBeInTheDocument()
    expect(screen.getByText('Staked TLM in Eyeke')).toBeInTheDocument()
    expect(screen.queryByText(/Testa/)).not.toBeInTheDocument()
  })

  it('renders the staked planetary TLM header', () => {
    mockUseAppState.mockReturnValue({ wax: { selectedDacId: 'eyeke', walletId: 'wallet.wam' } })
    mockUseWalletDaoDetails.mockReturnValue({
      walletDaoDetails: { stake_details: { available_tlm_in_dao: '0' } },
      loading: false,
    })
    mockUseUserDaoBalances.mockReturnValue({ userDaoBalances: {}, loading: false })

    render(<PlanetaryTokens />)
    expect(screen.getByText('Planetary Staked TLM')).toBeInTheDocument()
  })
})
