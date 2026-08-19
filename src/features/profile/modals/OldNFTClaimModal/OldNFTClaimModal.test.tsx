import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { OldNFTClaimModal } from './OldNFTClaimModal'

const mockClaimNftPts = jest.fn()
const mockSetSecondaryModalActive = jest.fn()
const mockUseAppState = jest.fn()

jest.mock('store', () => ({
  useAppState: () => mockUseAppState(),
  useActions: () => ({
    wax: { claimNftPts: mockClaimNftPts },
    modal: { setSecondaryModalActive: mockSetSecondaryModalActive },
  }),
}))

jest.mock('shared/util/helpers', () => ({
  formatUserPointsWithDecimal: () => '1,234.5',
}))

describe('OldNFTClaimModal', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  it('renders nothing visible when the modal is not open', () => {
    mockUseAppState.mockReturnValue({
      wax: { nftsToClaimTemplates: [] },
      modal: { secondaryModals: { OldNFTClaimModal: false } },
    })

    render(<OldNFTClaimModal />)
    expect(screen.queryByText('Hello Explorer!')).not.toBeInTheDocument()
  })

  it('renders the claim summary when the modal is open', () => {
    mockUseAppState.mockReturnValue({
      wax: { nftsToClaimTemplates: [1, 2, 3] },
      modal: { secondaryModals: { OldNFTClaimModal: true } },
    })

    render(<OldNFTClaimModal />)

    expect(screen.getByText('Hello Explorer!')).toBeInTheDocument()
    expect(screen.getByText('3 NFT claims')).toBeInTheDocument()
    expect(screen.getAllByText('1,234.5 Shards').length).toBeGreaterThan(0)
  })

  it('calls claimNftPts and closes the modal when Get Shards is clicked', async () => {
    mockUseAppState.mockReturnValue({
      wax: { nftsToClaimTemplates: [] },
      modal: { secondaryModals: { OldNFTClaimModal: true } },
    })

    render(<OldNFTClaimModal />)

    await userEvent.click(screen.getByText('Get Shards'))

    expect(mockClaimNftPts).toHaveBeenCalledTimes(1)
    expect(mockSetSecondaryModalActive).toHaveBeenCalledWith({
      modalName: 'OldNFTClaimModal',
      value: false,
    })
  })

  it('closes the modal when the close button is clicked', async () => {
    mockUseAppState.mockReturnValue({
      wax: { nftsToClaimTemplates: [] },
      modal: { secondaryModals: { OldNFTClaimModal: true } },
    })

    render(<OldNFTClaimModal />)

    await userEvent.click(screen.getByLabelText('Close'))

    expect(mockSetSecondaryModalActive).toHaveBeenCalledWith({
      modalName: 'OldNFTClaimModal',
      value: false,
    })
  })
})
