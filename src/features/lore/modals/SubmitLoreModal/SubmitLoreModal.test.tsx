import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

const mockRefetchQueries = jest.fn()
jest.mock('@apollo/client', () => ({
  ...jest.requireActual('@apollo/client'),
  useApolloClient: () => ({ refetchQueries: mockRefetchQueries }),
}))

let mockLoresResult: any
jest.mock('graphql/hooks/useLoreProposals', () => ({
  useLores: () => mockLoresResult,
}))

jest.mock('features/syndicates/components/LoadingSpinner', () => ({
  LoadingSpinner: () => <div data-testid="loading-spinner" />,
}))

jest.mock('shared/components/FormCheckbox', () => ({
  FormCheckbox: ({ checked, onChange, children }: any) => (
    <label>
      <input type="checkbox" checked={checked} onChange={onChange} />
      {children}
    </label>
  ),
}))

let mockSecondaryModals: any
let mockLorePullRequests: any[]
const mockSetSecondaryModalActive = jest.fn()
const mockGetLorePullRequestCommit = jest.fn()
const mockTrySubmitLore = jest.fn()

jest.mock('store', () => ({
  useAppState: () => ({
    modal: { secondaryModals: mockSecondaryModals },
    main: { lorePullRequests: mockLorePullRequests },
  }),
  useActions: () => ({
    modal: { setSecondaryModalActive: mockSetSecondaryModalActive },
    main: { getLorePullRequestCommit: mockGetLorePullRequestCommit },
    wax: { trySubmitLore: mockTrySubmitLore },
  }),
}))

import { SubmitLoreModal } from './SubmitLoreModal'

describe('SubmitLoreModal', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockSecondaryModals = { SubmitLoreModal: true }
    mockLorePullRequests = [
      { html_url: 'https://github.com/example/pr/1', number: 1, title: 'Fix bug' },
    ]
    mockLoresResult = { lores: { globals: { fee: '200.0000 TLM' } }, loading: false }
    mockGetLorePullRequestCommit.mockResolvedValue('Auto-filled description')
  })

  it('shows a loading spinner while lores are loading', () => {
    mockLoresResult = { lores: null, loading: true }
    render(<SubmitLoreModal />)
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument()
  })

  it('is not rendered when the modal flag is false', () => {
    mockSecondaryModals = { SubmitLoreModal: false }
    render(<SubmitLoreModal />)
    expect(screen.queryByText('Submit LORE')).not.toBeInTheDocument()
  })

  it('renders the fee notice and form fields when open', () => {
    render(<SubmitLoreModal />)
    expect(screen.getByText('Submit LORE')).toBeInTheDocument()
    expect(screen.getByText(/200 TLM fee/)).toBeInTheDocument()
    expect(screen.getByText('GitHub Pull Request URL')).toBeInTheDocument()
  })

  it('disables the submit button until the required fields are filled', () => {
    render(<SubmitLoreModal />)
    expect(screen.getByRole('button', { name: 'Submit Lore' })).toBeDisabled()
  })

  it('closes the modal via the close button', async () => {
    render(<SubmitLoreModal />)

    await userEvent.click(screen.getByRole('button', { name: 'Close' }))

    expect(mockSetSecondaryModalActive).toHaveBeenCalledWith({
      modalName: 'SubmitLoreModal',
      value: false,
    })
  })

  it('fills the title from the selected pull request and fetches its description', async () => {
    render(<SubmitLoreModal />)

    await userEvent.click(screen.getByText('Github Pull Request URL'))
    await userEvent.click(await screen.findByText('https://github.com/example/pr/1'))

    expect(mockGetLorePullRequestCommit).toHaveBeenCalledWith(1)
    await waitFor(() => {
      expect(screen.getByDisplayValue('Fix bug')).toBeInTheDocument()
    })
  })

  it('submits the lore proposal once all fields are filled and accepted', async () => {
    render(<SubmitLoreModal />)

    await userEvent.click(screen.getByText('Github Pull Request URL'))
    await userEvent.click(await screen.findByText('https://github.com/example/pr/1'))
    await waitFor(() => {
      expect(screen.getByDisplayValue('Fix bug')).toBeInTheDocument()
    })

    await userEvent.click(screen.getByRole('checkbox'))
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Submit Lore' })).not.toBeDisabled()
    })
    await userEvent.click(screen.getByRole('button', { name: 'Submit Lore' }))

    await waitFor(() => {
      expect(mockTrySubmitLore).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Fix bug',
          url: 'https://github.com/example/pr/1',
          fee: '200.0000 TLM',
        })
      )
    })
    expect(mockRefetchQueries).toHaveBeenCalled()
  })
})
