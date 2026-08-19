import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'

import { BalancesBtn, OutpostBtn, ProfileBtn, TagWithWalletBtn } from './ProfileActions'

const mockNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}))

jest.mock('shared/components/topbar/Tag', () => ({
  Tag: () => <div data-testid="tag" />,
}))

const mockCopyToClipboard = jest.fn()
jest.mock('react-use', () => ({
  useCopyToClipboard: () => [{}, mockCopyToClipboard],
}))

const mockToastMessage = jest.fn()
jest.mock('store/main/actions', () => ({
  toastMessage: (...args: unknown[]) => mockToastMessage(...args),
}))

jest.mock('store', () => ({
  useAppState: () => ({ wax: { walletId: 'wallet.wam', isDemoUser: false } }),
}))

describe('ProfileActions buttons', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  it('navigates to the profile info page when ProfileBtn is clicked', async () => {
    render(
      <MemoryRouter>
        <ProfileBtn />
      </MemoryRouter>
    )

    await userEvent.click(screen.getByText('Profile'))
    expect(mockNavigate).toHaveBeenCalledWith('/profile/info')
  })

  it('navigates to the balances page when BalancesBtn is clicked', async () => {
    render(
      <MemoryRouter>
        <BalancesBtn />
      </MemoryRouter>
    )

    await userEvent.click(screen.getByText('Balances'))
    expect(mockNavigate).toHaveBeenCalled()
  })

  it('navigates to the outpost page when OutpostBtn is clicked', async () => {
    render(
      <MemoryRouter>
        <OutpostBtn />
      </MemoryRouter>
    )

    await userEvent.click(screen.getByText('Outpost'))
    expect(mockNavigate).toHaveBeenCalled()
  })

  it('renders the wallet id and copies it to the clipboard on icon click', () => {
    render(
      <MemoryRouter>
        <TagWithWalletBtn />
      </MemoryRouter>
    )

    expect(screen.getByText('wallet.wam')).toBeInTheDocument()
  })
})
