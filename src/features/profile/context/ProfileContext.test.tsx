import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { ProfileProvider, useProfileContext } from './ProfileContext'

const mockRefreshProfile = jest.fn().mockResolvedValue(undefined)
const mockRefreshBalance = jest.fn().mockResolvedValue(undefined)
const mockClaimReward = jest.fn().mockResolvedValue(undefined)

jest.mock('../hooks/useProfileData', () => ({
  useProfileData: () => ({
    profileData: { walletId: 'wallet.wam', isDemoUser: false, currentLevel: 2, userPoints: 10 },
    loading: false,
    error: null,
    refresh: mockRefreshProfile,
  }),
}))

jest.mock('../hooks/useBalanceData', () => ({
  useBalanceData: () => ({
    balanceData: { tlmBalance: 1, stakedAmount: 0, shards: 0 },
    loading: false,
    error: null,
    refresh: mockRefreshBalance,
  }),
}))

jest.mock('../hooks/useClaimsData', () => ({
  useClaimsData: () => ({
    claims: [],
    loading: false,
    error: null,
    claimReward: mockClaimReward,
  }),
}))

const Consumer = () => {
  const { state, actions } = useProfileContext()
  return (
    <div>
      <span data-testid="wallet-id">{state.profileData?.walletId}</span>
      <span data-testid="loading">{String(state.loading)}</span>
      <button onClick={() => actions.refreshProfile()}>refresh</button>
      <button onClick={() => actions.claimReward('mining')}>claim</button>
    </div>
  )
}

describe('ProfileContext', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  it('throws when useProfileContext is used outside a provider', () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => undefined)
    expect(() => render(<Consumer />)).toThrow(
      'useProfileContext must be used within a ProfileProvider'
    )
    consoleError.mockRestore()
  })

  it('combines the three data hooks into a single state object', () => {
    render(
      <ProfileProvider>
        <Consumer />
      </ProfileProvider>
    )

    expect(screen.getByTestId('wallet-id')).toHaveTextContent('wallet.wam')
    expect(screen.getByTestId('loading')).toHaveTextContent('false')
  })

  it('refreshProfile calls both profile and balance refresh functions', async () => {
    render(
      <ProfileProvider>
        <Consumer />
      </ProfileProvider>
    )

    await userEvent.click(screen.getByText('refresh'))

    expect(mockRefreshProfile).toHaveBeenCalledTimes(1)
    expect(mockRefreshBalance).toHaveBeenCalledTimes(1)
  })

  it('claimReward delegates to the claims hook', async () => {
    render(
      <ProfileProvider>
        <Consumer />
      </ProfileProvider>
    )

    await userEvent.click(screen.getByText('claim'))

    expect(mockClaimReward).toHaveBeenCalledWith('mining', undefined)
  })
})
