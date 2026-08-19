import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

import { sumStakedAmount, WalletsBalances } from './WalletsBalances'

const mockUseAppState = jest.fn()
jest.mock('store', () => ({
  useAppState: () => mockUseAppState(),
}))

const mockUseWalletDetails = jest.fn()
jest.mock('graphql/hooks/useWalletDetails', () => ({
  useWalletDetails: (...args: unknown[]) => mockUseWalletDetails(...args),
}))

const mockUseUserDaoBalances = jest.fn()
jest.mock('graphql/hooks/useUserDaoBalances', () => ({
  useUserDaoBalances: (...args: unknown[]) => mockUseUserDaoBalances(...args),
}))

const mockUseWalletConnect = jest.fn()
jest.mock('features/missions/components/MissionsActions/MissionsActions', () => ({
  useWalletConnect: () => mockUseWalletConnect(),
  ConnectWalletBtn: ({ onClick }: { onClick: () => void }) => (
    <button onClick={onClick}>Connect Wallet</button>
  ),
}))

jest.mock('features/missions/components/StakedTriliumBalance/StakedTriliumBalance', () => ({
  StakedTriliumBalance: () => <div data-testid="staked-trilium-balance" />,
}))
jest.mock('features/missions/components/TriliumBSCBalance/TriliumBSCBalance', () => ({
  TriliumBSCBalance: () => <div data-testid="trilium-bsc-balance" />,
}))
jest.mock('features/syndicates/components/LoadingSpinner/LoadingSpinner', () => ({
  LoadingSpinner: () => <div data-testid="loading-spinner" />,
}))
jest.mock('features/glossary/components/GlossaryInfoIcon/GlossaryInfoIcon', () => ({
  GlossaryInfoIcon: () => <div data-testid="glossary-info-icon" />,
}))
jest.mock('shared/util/config', () => ({
  config: { BscChainId: 56 },
}))

const baseWalletDetails = {
  tlm_balance: '100.0000 TLM',
  userpoints_details: { redeemable_points: 20 },
}

describe('sumStakedAmount', () => {
  it('sums staked amounts across all planets', () => {
    const total = sumStakedAmount({
      eyeke: { stake_details: { staked_amount: '10.0000 TLM' } },
      neri: { stake_details: { staked_amount: '5.0000 TLM' } },
    } as any)
    expect(total).toBe(15)
  })
})

describe('WalletsBalances', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  it('renders a loading spinner while wallet or dao balances are loading', () => {
    mockUseAppState.mockReturnValue({ wax: { walletId: 'wallet.wam' } })
    mockUseWalletDetails.mockReturnValue({ walletDetails: baseWalletDetails, loading: true })
    mockUseUserDaoBalances.mockReturnValue({ userDaoBalances: {}, loading: false })
    mockUseWalletConnect.mockReturnValue({ connectedWallets: [], connecting: false })

    render(
      <MemoryRouter>
        <WalletsBalances />
      </MemoryRouter>
    )

    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument()
  })

  it('renders the wax trilium balance once loaded', () => {
    mockUseAppState.mockReturnValue({ wax: { walletId: 'wallet.wam' } })
    mockUseWalletDetails.mockReturnValue({ walletDetails: baseWalletDetails, loading: false })
    mockUseUserDaoBalances.mockReturnValue({ userDaoBalances: {}, loading: false })
    mockUseWalletConnect.mockReturnValue({ connectedWallets: [], connecting: false })

    render(
      <MemoryRouter>
        <WalletsBalances />
      </MemoryRouter>
    )

    expect(screen.getByText('100.0000')).toBeInTheDocument()
    expect(screen.getByText('WAX Trillium')).toBeInTheDocument()
    expect(screen.queryByText('Staked WAX Trillium')).not.toBeInTheDocument()
  })

  it('shows the staked wax trilium block when the user has staked balances', () => {
    mockUseAppState.mockReturnValue({ wax: { walletId: 'wallet.wam' } })
    mockUseWalletDetails.mockReturnValue({ walletDetails: baseWalletDetails, loading: false })
    mockUseUserDaoBalances.mockReturnValue({
      userDaoBalances: { eyeke: { stake_details: { staked_amount: '10.0000 TLM' } } },
      loading: false,
    })
    mockUseWalletConnect.mockReturnValue({ connectedWallets: [], connecting: false })

    render(
      <MemoryRouter>
        <WalletsBalances />
      </MemoryRouter>
    )

    expect(screen.getByText('Staked WAX Trillium')).toBeInTheDocument()
    expect(screen.getByText('10.0000')).toBeInTheDocument()
  })

  it('shows the connect wallet button when no bsc wallet is connected', () => {
    mockUseAppState.mockReturnValue({ wax: { walletId: 'wallet.wam' } })
    mockUseWalletDetails.mockReturnValue({ walletDetails: baseWalletDetails, loading: false })
    mockUseUserDaoBalances.mockReturnValue({ userDaoBalances: {}, loading: false })
    mockUseWalletConnect.mockReturnValue({ connectedWallets: [], connecting: false })

    render(
      <MemoryRouter>
        <WalletsBalances />
      </MemoryRouter>
    )

    expect(screen.getByText('Connect Wallet')).toBeInTheDocument()
    expect(screen.queryByTestId('trilium-bsc-balance')).not.toBeInTheDocument()
  })

  it('shows bsc balances when a matching bsc chain is connected', () => {
    mockUseAppState.mockReturnValue({ wax: { walletId: 'wallet.wam' } })
    mockUseWalletDetails.mockReturnValue({ walletDetails: baseWalletDetails, loading: false })
    mockUseUserDaoBalances.mockReturnValue({ userDaoBalances: {}, loading: false })
    mockUseWalletConnect.mockReturnValue({
      connectedWallets: ['0xabc'],
      connecting: false,
      connectedChain: { id: '0x38' },
    })

    render(
      <MemoryRouter>
        <WalletsBalances />
      </MemoryRouter>
    )

    expect(screen.getByTestId('trilium-bsc-balance')).toBeInTheDocument()
    expect(screen.getByTestId('staked-trilium-balance')).toBeInTheDocument()
    expect(screen.queryByText('Connect Wallet')).not.toBeInTheDocument()
  })
})
