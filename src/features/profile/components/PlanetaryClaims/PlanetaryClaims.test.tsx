import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { PlanetaryClaims } from './PlanetaryClaims'

const mockTryClaimUnstake = jest.fn().mockResolvedValue(undefined)
const mockTryClaimMiningRewards = jest.fn().mockResolvedValue(undefined)
const mockTryClaimLandownerAllowance = jest.fn().mockResolvedValue(undefined)
const mockTryClaimLandownerCommissions = jest.fn().mockResolvedValue(undefined)
const mockUseAppState = jest.fn()

jest.mock('store', () => ({
  useAppState: () => mockUseAppState(),
  useActions: () => ({
    wax: {
      tryClaimUnstake: mockTryClaimUnstake,
      tryClaimMiningRewards: mockTryClaimMiningRewards,
      tryClaimLandownerAllowance: mockTryClaimLandownerAllowance,
      tryClaimLandownerCommissions: mockTryClaimLandownerCommissions,
    },
  }),
}))

const mockRefetchQueries = jest.fn().mockResolvedValue(undefined)
jest.mock('@apollo/client', () => ({
  useApolloClient: () => ({ refetchQueries: mockRefetchQueries }),
}))

const mockUseWalletDetails = jest.fn()
jest.mock('graphql/hooks/useWalletDetails', () => ({
  useWalletDetails: (...args: unknown[]) => mockUseWalletDetails(...args),
}))

const mockUseUserDaoBalances = jest.fn()
jest.mock('graphql/hooks/useUserDaoBalances', () => ({
  useUserDaoBalances: (...args: unknown[]) => mockUseUserDaoBalances(...args),
}))

jest.mock('graphql/queries/daoWalletDetails', () => ({ DAO_WALLET_DETAILS_QUERY: 'DAO_QUERY' }))
jest.mock('graphql/queries/userDaoBalances', () => ({ USER_DAO_BALANCES: 'USER_DAO_QUERY' }))

jest.mock('features/glossary/components/GlossaryInfoIcon/GlossaryInfoIcon', () => ({
  GlossaryInfoIcon: () => <div data-testid="glossary-info-icon" />,
}))
jest.mock('features/syndicates/components/LoadingSpinner/LoadingSpinner', () => ({
  LoadingSpinner: () => <div data-testid="loading-spinner" />,
}))

jest.mock('shared/util/helpers', () => ({
  ...jest.requireActual('shared/util/helpers'),
  getMiningRewardsTimeInHours: jest.fn(() => 0),
}))

const noUnstakesBalances = {
  eyeke: { stake_details: { unstakes: [], staked_amount: '0.0000 TLM', dao_token_balance: '0.0000 TLM' } },
}

describe('PlanetaryClaims', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  it('renders a loading spinner while wallet details or dao balances are loading', () => {
    mockUseAppState.mockReturnValue({ wax: { walletId: 'wallet.wam' } })
    mockUseWalletDetails.mockReturnValue({ walletDetails: null, loading: true })
    mockUseUserDaoBalances.mockReturnValue({ userDaoBalances: {}, loading: false })

    render(<PlanetaryClaims />)
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument()
  })

  it('claims mining rewards when the mining claim button is clicked', async () => {
    mockUseAppState.mockReturnValue({ wax: { walletId: 'wallet.wam' } })
    mockUseWalletDetails.mockReturnValue({
      walletDetails: {
        mining_claim: { amount: '5.0000 TLM', last_claim_time: null },
        land_comms: { amount: '0.0000 TLM' },
        land_ratings_payout: '0.0000 TLM',
      },
      loading: false,
    })
    mockUseUserDaoBalances.mockReturnValue({ userDaoBalances: noUnstakesBalances, loading: false })

    render(<PlanetaryClaims />)

    const claimButtons = screen.getAllByText('Claim TLM')
    await userEvent.click(claimButtons[0])

    expect(mockTryClaimMiningRewards).toHaveBeenCalledTimes(1)
  })

  it('disables the mining claim button when there are no claimable rewards', () => {
    mockUseAppState.mockReturnValue({ wax: { walletId: 'wallet.wam' } })
    mockUseWalletDetails.mockReturnValue({
      walletDetails: {
        mining_claim: { amount: '0.0000 TLM', last_claim_time: null },
        land_comms: { amount: '0.0000 TLM' },
        land_ratings_payout: '0.0000 TLM',
      },
      loading: false,
    })
    mockUseUserDaoBalances.mockReturnValue({ userDaoBalances: noUnstakesBalances, loading: false })

    render(<PlanetaryClaims />)

    const buttons = screen.getAllByRole('button')
    expect(buttons[0]).toBeDisabled()
  })

  it('claims landowner commissions when the commission claim button is clicked', async () => {
    mockUseAppState.mockReturnValue({ wax: { walletId: 'wallet.wam' } })
    mockUseWalletDetails.mockReturnValue({
      walletDetails: {
        mining_claim: { amount: '0.0000 TLM', last_claim_time: null },
        land_comms: { amount: '3.0000 TLM' },
        land_ratings_payout: '0.0000 TLM',
      },
      loading: false,
    })
    mockUseUserDaoBalances.mockReturnValue({ userDaoBalances: noUnstakesBalances, loading: false })

    render(<PlanetaryClaims />)

    const claimButtons = screen.getAllByText('Claim TLM')
    await userEvent.click(claimButtons[1])

    expect(mockTryClaimLandownerCommissions).toHaveBeenCalledTimes(1)
  })

  it('claims landowner allowance when the DTAL claim button is clicked', async () => {
    mockUseAppState.mockReturnValue({ wax: { walletId: 'wallet.wam' } })
    mockUseWalletDetails.mockReturnValue({
      walletDetails: {
        mining_claim: { amount: '0.0000 TLM', last_claim_time: null },
        land_comms: { amount: '0.0000 TLM' },
        land_ratings_payout: '2.0000 TLM',
      },
      loading: false,
    })
    mockUseUserDaoBalances.mockReturnValue({ userDaoBalances: noUnstakesBalances, loading: false })

    render(<PlanetaryClaims />)

    const claimButtons = screen.getAllByText('Claim TLM')
    await userEvent.click(claimButtons[2])

    expect(mockTryClaimLandownerAllowance).toHaveBeenCalledTimes(1)
  })

  it('renders an unstake row and claims it, refetching balances queries', async () => {
    mockUseAppState.mockReturnValue({ wax: { walletId: 'wallet.wam' } })
    mockUseWalletDetails.mockReturnValue({
      walletDetails: {
        mining_claim: { amount: '0.0000 TLM', last_claim_time: null },
        land_comms: { amount: '0.0000 TLM' },
        land_ratings_payout: '0.0000 TLM',
      },
      loading: false,
    })
    mockUseUserDaoBalances.mockReturnValue({
      userDaoBalances: {
        eyeke: {
          stake_details: {
            unstakes: [{ stake: '7.0000 TLM', release_time: '2030-01-01T12:00:00' }],
            staked_amount: '7.0000 TLM',
            dao_token_balance: '7.0000 EYEKE',
          },
        },
      },
      loading: false,
    })

    render(<PlanetaryClaims />)

    expect(screen.getByText(/Tokens in Eyeke Release Date/)).toBeInTheDocument()

    const claimButtons = screen.getAllByText('Claim TLM')
    await userEvent.click(claimButtons[claimButtons.length - 1])

    expect(mockTryClaimUnstake).toHaveBeenCalledWith('4,EYEKE')
    expect(mockRefetchQueries).toHaveBeenCalledWith({
      include: ['DAO_QUERY', 'USER_DAO_QUERY'],
    })
  })
})
