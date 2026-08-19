import { render, screen } from '@testing-library/react'

import { ProfileView } from './ProfileView'

const mockUseProfileContext = jest.fn()
jest.mock('../../context/ProfileContext', () => ({
  useProfileContext: () => mockUseProfileContext(),
}))

jest.mock('features/syndicates/components/LoadingSpinner/LoadingSpinner', () => ({
  LoadingSpinner: () => <div data-testid="loading-spinner" />,
}))

jest.mock('../sections/ProfileHeader', () => ({
  ProfileHeader: () => <div data-testid="profile-header" />,
}))
jest.mock('../sections/BalanceSection', () => ({
  BalanceSection: () => <div data-testid="balance-section" />,
}))
jest.mock('../ui/WalletSelector', () => ({
  WalletSelector: () => <div data-testid="wallet-selector" />,
}))

describe('ProfileView', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  it('renders the loading spinner while loading', () => {
    mockUseProfileContext.mockReturnValue({ state: { loading: true } })
    render(<ProfileView />)

    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument()
    expect(screen.queryByTestId('profile-header')).not.toBeInTheDocument()
  })

  it('renders the composed profile sections once loaded', () => {
    mockUseProfileContext.mockReturnValue({ state: { loading: false } })
    render(<ProfileView />)

    expect(screen.getByTestId('profile-header')).toBeInTheDocument()
    expect(screen.getByTestId('balance-section')).toBeInTheDocument()
    expect(screen.getByTestId('wallet-selector')).toBeInTheDocument()
    expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument()
  })
})
