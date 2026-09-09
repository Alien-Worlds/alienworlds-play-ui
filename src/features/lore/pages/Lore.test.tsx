import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

let mockLoreData: any
jest.mock('features/lore/data/LoreDataProvider', () => {
  const actual = jest.requireActual('features/lore/data/LoreDataProvider')
  return {
    ...actual,
    LoreDataProvider: ({ children }: any) => children,
    useLoreLoadingState: () => ({
      loadingLores: mockLoreData.loadingLores,
      walletDetailsLoading: mockLoreData.walletDetailsLoading,
    }),
  }
})

jest.mock('features/lore/hooks/useLiveVotePower', () => ({
  useLiveVotePower: () => ({ currentVotePower: 12 }),
}))

jest.mock('shared/util/hooks', () => ({
  useScreenSize: () => ({ isDesktop: true, isTablet: false, isMobile: false }),
}))

jest.mock('features/lore/components/Dashboard', () => ({
  Dashboard: ({ currentNumber }: any) => (
    <div data-testid="dashboard">Dashboard VP:{currentNumber}</div>
  ),
}))

jest.mock('features/lore/components/StakeLore/StakeLore', () => ({
  StakeLore: ({ currentNumber }: any) => (
    <div data-testid="stake-lore">Stake VP:{currentNumber}</div>
  ),
}))

jest.mock('features/syndicates/components/LoadingSpinner/LoadingSpinner', () => ({
  LoadingSpinner: () => <div data-testid="loading-spinner" />,
}))

const mockGetLorePullRequests = jest.fn()
const mockSetPrimaryModalActive = jest.fn()
const mockSetSecondaryModalActive = jest.fn()
let mockIsDemoUser = false

jest.mock('store', () => ({
  useAppState: () => ({
    main: { loreReadMe: '# Hello Lore', currentWallet: 'wallet.wam' },
    wax: { isDemoUser: mockIsDemoUser },
  }),
  useActions: () => ({
    modal: {
      setSecondaryModalActive: mockSetSecondaryModalActive,
      setPrimaryModalActive: mockSetPrimaryModalActive,
    },
    main: { getLorePullRequests: mockGetLorePullRequests },
  }),
}))

import { Lore } from './Lore'

describe('Lore page', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockIsDemoUser = false
    mockLoreData = { loadingLores: false, walletDetailsLoading: false }
  })

  it('shows a loading spinner while lores or wallet details are loading', () => {
    mockLoreData = { loadingLores: true, walletDetailsLoading: false }
    render(<Lore />)
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument()
  })

  it('renders the readme content in the Lore tab by default', () => {
    render(<Lore />)
    expect(screen.getByText('The Lore')).toBeInTheDocument()
    expect(screen.getByText(/Hello Lore/)).toBeInTheDocument()
  })

  it('switches to the Dashboard tab and shows the current vote power', async () => {
    render(<Lore />)

    await userEvent.click(screen.getByRole('tab', { name: 'Dashboard' }))

    expect(await screen.findByTestId('dashboard')).toHaveTextContent('Dashboard VP:12')
  })

  it('switches to the Stake tab and shows the current vote power', async () => {
    render(<Lore />)

    await userEvent.click(screen.getByRole('tab', { name: 'Stake' }))

    expect(await screen.findByTestId('stake-lore')).toHaveTextContent('Stake VP:12')
  })

  it('fetches pull requests and opens the submit modal for a logged-in user', async () => {
    render(<Lore />)

    await userEvent.click(screen.getByText('Submit Lore'))

    expect(mockGetLorePullRequests).toHaveBeenCalled()
    expect(mockSetSecondaryModalActive).toHaveBeenCalledWith({
      modalName: 'SubmitLoreModal',
      value: true,
    })
  })

  it('opens the login modal instead for a demo user', async () => {
    mockIsDemoUser = true
    render(<Lore />)

    await userEvent.click(screen.getByText('Submit Lore'))

    expect(mockSetSecondaryModalActive).not.toHaveBeenCalled()
    expect(mockSetPrimaryModalActive).toHaveBeenCalledWith({ modalName: 'LoginModal', value: true })
  })
})
