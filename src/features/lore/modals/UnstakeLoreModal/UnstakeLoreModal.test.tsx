import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

const mockRefetchQueries = jest.fn()
jest.mock('@apollo/client', () => ({
  ...jest.requireActual('@apollo/client'),
  useApolloClient: () => ({ refetchQueries: mockRefetchQueries }),
}))

let mockSecondaryModals: any
const mockSetSecondaryModalActive = jest.fn()
const mockTryUnStakeLore = jest.fn()

jest.mock('store', () => ({
  useActions: () => ({
    wax: { tryUnStakeLore: mockTryUnStakeLore },
  }),
}))

jest.mock('shared/store/modalStore', () => ({
  useModalStore: (selector: (state: unknown) => unknown) =>
    selector({
      secondaryModals: mockSecondaryModals,
      setSecondaryModalActive: mockSetSecondaryModalActive,
    }),
}))

import { UnstakeLoreModal } from './UnstakeLoreModal'

describe('UnstakeLoreModal', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockSecondaryModals = { UnstakeAllLoreModal: true }
  })

  it('is not open when the modal flag is false', () => {
    mockSecondaryModals = { UnstakeAllLoreModal: false }
    render(<UnstakeLoreModal />)
    expect(screen.queryByText('Unstake All')).not.toBeInTheDocument()
  })

  it('renders the confirmation copy when open', () => {
    render(<UnstakeLoreModal />)
    expect(screen.getByText('Unstake All')).toBeInTheDocument()
    expect(screen.getByText(/you will lose all your vote power instantly/)).toBeInTheDocument()
  })

  it('unstakes and refetches wallet details when confirmed', async () => {
    render(<UnstakeLoreModal />)

    await userEvent.click(screen.getByText('Unstake All TLM'))

    expect(mockTryUnStakeLore).toHaveBeenCalled()
    expect(mockRefetchQueries).toHaveBeenCalled()
  })

  it('closes the modal when Cancel is clicked', async () => {
    render(<UnstakeLoreModal />)

    await userEvent.click(screen.getByText('Cancel'))

    expect(mockSetSecondaryModalActive).toHaveBeenCalledWith({
      modalName: 'UnstakeAllLoreModal',
      value: false,
    })
  })

  it('closes the modal via the close button', async () => {
    render(<UnstakeLoreModal />)

    await userEvent.click(screen.getByRole('button', { name: 'Close' }))

    expect(mockSetSecondaryModalActive).toHaveBeenCalledWith({
      modalName: 'UnstakeAllLoreModal',
      value: false,
    })
  })
})
