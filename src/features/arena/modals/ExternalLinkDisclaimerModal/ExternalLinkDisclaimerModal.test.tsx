import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { ExternalLinkDisclaimerModal } from './ExternalLinkDisclaimerModal'

const mockSetSecondaryModalActive = jest.fn()
let mockSecondaryModals: Record<string, unknown> = {}

jest.mock('store', () => ({
  useAppState: () => ({
    modal: { secondaryModals: mockSecondaryModals },
  }),
  useActions: () => ({
    modal: { setSecondaryModalActive: mockSetSecondaryModalActive },
  }),
}))

describe('ExternalLinkDisclaimerModal', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  it('renders nothing when closed', () => {
    mockSecondaryModals = { ExternalLinkDisclaimerModal: false }
    render(<ExternalLinkDisclaimerModal />)

    expect(
      screen.queryByText(/you are now leaving the alien worlds metaverse website/i)
    ).not.toBeInTheDocument()
  })

  it('calls onConfirm and closes the modal when "Go to Site" is clicked', async () => {
    const onConfirm = jest.fn()
    mockSecondaryModals = { ExternalLinkDisclaimerModal: true, onConfirm }
    render(<ExternalLinkDisclaimerModal />)

    await userEvent.click(screen.getByRole('button', { name: /go to site/i }))

    expect(onConfirm).toHaveBeenCalled()
    expect(mockSetSecondaryModalActive).toHaveBeenCalledWith({
      modalName: 'ExternalLinkDisclaimerModal',
      value: false,
    })
  })

  it('closes without calling onConfirm when "Stay Here" is clicked', async () => {
    const onConfirm = jest.fn()
    mockSecondaryModals = { ExternalLinkDisclaimerModal: true, onConfirm }
    render(<ExternalLinkDisclaimerModal />)

    await userEvent.click(screen.getByRole('button', { name: /stay here/i }))

    expect(onConfirm).not.toHaveBeenCalled()
    expect(mockSetSecondaryModalActive).toHaveBeenCalledWith({
      modalName: 'ExternalLinkDisclaimerModal',
      value: false,
    })
  })
})
