import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

const mockCopyToClipboard = jest.fn()
jest.mock('react-use', () => ({
  useCopyToClipboard: () => [{}, mockCopyToClipboard],
}))

const mockRefetchQueries = jest.fn()
jest.mock('@apollo/client', () => ({
  ...jest.requireActual('@apollo/client'),
  useApolloClient: () => ({ refetchQueries: mockRefetchQueries }),
}))

const mockToastMessage = jest.fn()
jest.mock('store/main/actions', () => ({
  toastMessage: (...args: any[]) => mockToastMessage(...args),
}))

let mockIsDemoUser = false
const mockSetPrimaryModalActive = jest.fn()
const mockTryLoreVoting = jest.fn()

jest.mock('store', () => ({
  useAppState: () => ({
    wax: { isDemoUser: mockIsDemoUser },
  }),
  useActions: () => ({
    modal: { setPrimaryModalActive: mockSetPrimaryModalActive },
    wax: { tryLoreVoting: mockTryLoreVoting },
  }),
}))

import { LoreDrawer, isAllowedStatus } from './LoreDrawer'
import { LoreStatus } from '../../types/loreTypes'

const makeLore = (overrides: any = {}) => ({
  proposal_id: 7,
  title: 'Vote on this',
  proposer: 'alice',
  expires: '2024-02-01',
  earliest_exec: '2024-01-15',
  total_yes_votes: 3,
  total_no_votes: 1,
  status: LoreStatus.OPEN,
  attributes: [
    { key: 'url', value: ['string', 'https://github.com/Alien-Worlds/example/pull/1'] },
    { key: 'description', value: ['string', 'A description'] },
  ],
  ...overrides,
})

describe('isAllowedStatus', () => {
  it('allows voting statuses', () => {
    expect(isAllowedStatus(LoreStatus.OPEN)).toBe(true)
    expect(isAllowedStatus(LoreStatus.PASSING)).toBe(true)
    expect(isAllowedStatus(LoreStatus.FAILING)).toBe(true)
    expect(isAllowedStatus(LoreStatus.QUORUM_UNMET)).toBe(true)
  })

  it('disallows terminal statuses', () => {
    expect(isAllowedStatus(LoreStatus.EXPIRED)).toBe(false)
    expect(isAllowedStatus(LoreStatus.EXECUTED)).toBe(false)
  })
})

describe('LoreDrawer', () => {
  beforeEach(() => {
    mockIsDemoUser = false
    jest.clearAllMocks()
  })

  it('renders nothing meaningful when closed', () => {
    render(<LoreDrawer isOpen={false} onClose={jest.fn()} lore={null} currentNumber={10} />)
    expect(screen.queryByText('Vote on this')).not.toBeInTheDocument()
  })

  it('renders the lore details when open', () => {
    render(<LoreDrawer isOpen onClose={jest.fn()} lore={makeLore()} currentNumber={10} />)

    expect(screen.getByText('Vote on this')).toBeInTheDocument()
    expect(screen.getByText('alice')).toBeInTheDocument()
    expect(screen.getByText('A description')).toBeInTheDocument()
  })

  it('copies the pull request url and shows a toast when the copy icon is clicked', async () => {
    render(<LoreDrawer isOpen onClose={jest.fn()} lore={makeLore()} currentNumber={10} />)

    const copyIcon = document.querySelector('svg[cursor="pointer"]') as unknown as SVGElement
    expect(copyIcon).toBeTruthy()
    await userEvent.click(copyIcon)

    expect(mockCopyToClipboard).toHaveBeenCalledWith(
      'https://github.com/Alien-Worlds/example/pull/1'
    )
    expect(mockToastMessage).toHaveBeenCalledWith('Url copied to Clipboard!')
  })

  it('shows yes/no vote options for an allowed status', () => {
    render(<LoreDrawer isOpen onClose={jest.fn()} lore={makeLore()} currentNumber={10} />)

    expect(screen.getByText('Yes')).toBeInTheDocument()
    expect(screen.getByText('No')).toBeInTheDocument()
  })

  it('hides vote options for a disallowed status', () => {
    render(
      <LoreDrawer
        isOpen
        onClose={jest.fn()}
        lore={makeLore({ status: LoreStatus.EXPIRED })}
        currentNumber={10}
      />
    )

    expect(screen.queryByText('Yes')).not.toBeInTheDocument()
    expect(screen.queryByText('No')).not.toBeInTheDocument()
  })

  it('calls onClose when the close button is clicked', async () => {
    const onClose = jest.fn()
    render(<LoreDrawer isOpen onClose={onClose} lore={makeLore()} currentNumber={10} />)

    await userEvent.click(screen.getByRole('button', { name: 'Close' }))

    expect(onClose).toHaveBeenCalled()
  })

  it('submits a vote and refetches lores when not a demo user', async () => {
    render(<LoreDrawer isOpen onClose={jest.fn()} lore={makeLore()} currentNumber={10} />)

    await userEvent.type(screen.getByPlaceholderText('Enter TLM amount 10 000 e.g.'), '5')
    await userEvent.click(screen.getByRole('button', { name: 'Vote' }))

    expect(mockTryLoreVoting).toHaveBeenCalledWith({
      proposalId: 7,
      vote: 'yes',
      votePower: 5,
    })
    expect(mockRefetchQueries).toHaveBeenCalled()
  })

  it('opens the login modal instead of voting for a demo user', async () => {
    mockIsDemoUser = true
    render(<LoreDrawer isOpen onClose={jest.fn()} lore={makeLore()} currentNumber={10} />)

    await userEvent.type(screen.getByPlaceholderText('Enter TLM amount 10 000 e.g.'), '5')
    await userEvent.click(screen.getByRole('button', { name: 'Vote' }))

    expect(mockTryLoreVoting).not.toHaveBeenCalled()
    expect(mockSetPrimaryModalActive).toHaveBeenCalledWith({ modalName: 'LoginModal', value: true })
  })
})
