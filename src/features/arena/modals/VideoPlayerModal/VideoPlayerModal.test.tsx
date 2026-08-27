import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { VideoPlayerModal } from './VideoPlayerModal'

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

jest.mock('react-player', () => ({
  __esModule: true,
  default: ({ url }: { url: string }) => <div data-testid="react-player">{url}</div>,
}))

describe('VideoPlayerModal', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  it('renders nothing when closed', () => {
    mockSecondaryModals = { VideoPlayerModal: false }
    render(<VideoPlayerModal />)

    expect(screen.queryByTestId('react-player')).not.toBeInTheDocument()
  })

  it('renders the video when open and closes on close click', async () => {
    mockSecondaryModals = {
      VideoPlayerModal: true,
      onConfirm: () => 'https://example.com/video.mp4',
    }
    render(<VideoPlayerModal />)

    expect(screen.getByTestId('react-player')).toHaveTextContent('https://example.com/video.mp4')

    await userEvent.click(screen.getByRole('button', { name: /close/i }))

    expect(mockSetSecondaryModalActive).toHaveBeenCalledWith({
      modalName: 'VideoPlayerModal',
      value: false,
    })
  })

  it('appends autoplay for youtube URLs', () => {
    mockSecondaryModals = {
      VideoPlayerModal: true,
      onConfirm: () => 'https://youtube.com/watch?v=abc',
    }
    render(<VideoPlayerModal />)

    expect(screen.getByTestId('react-player')).toHaveTextContent(
      'https://youtube.com/watch?v=abc?autoplay=1'
    )
  })
})
