import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ArenaPortalItemType } from 'features/arena/pages/Arena'
import { DateTime } from 'luxon'

import { ArenaPortalItem } from './ArenaPortalItem'

const mockSetSecondaryModalActive = jest.fn()
jest.mock('store', () => ({
  useActions: () => ({
    modal: { setSecondaryModalActive: mockSetSecondaryModalActive },
  }),
}))

const baseItem = {
  title: 'Community Racer',
  description: 'Race across the metaverse.',
  creator: 'Some Studio',
  creatorUrl: 'https://studio.example.com',
  platform: 'Web',
  url: 'https://game.example.com',
  video: 'https://video.example.com/trailer.mp4',
  version: 'V1.0.0',
  image: { data: { attributes: { url: 'https://example.com/portal.png' } } },
  socialLinks: [],
  sashlabel: '',
  action: { label: 'Play Now', style: 'primary', url: 'https://game.example.com', trackingID: '' },
} as unknown as ArenaPortalItemType

describe('ArenaPortalItem', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  it('renders title, description, creator and platform', () => {
    render(<ArenaPortalItem data={baseItem} />)

    expect(screen.getByText('Community Racer')).toBeInTheDocument()
    expect(screen.getByText('Race across the metaverse.')).toBeInTheDocument()
    expect(screen.getByText('Some Studio')).toBeInTheDocument()
    expect(screen.getByText('Web')).toBeInTheDocument()
  })

  it('shows "Coming Soon" when the release date has not occurred yet', () => {
    render(
      <ArenaPortalItem
        data={{ ...baseItem, releaseDate: DateTime.now().plus({ days: 1 }).toISO() }}
      />
    )

    const button = screen.getByRole('button', { name: /coming soon/i })
    expect(button).toBeDisabled()
  })

  it('opens the video player modal when Play Trailer is clicked', async () => {
    render(<ArenaPortalItem data={baseItem} />)

    await userEvent.click(screen.getByText('Play Trailer'))

    expect(mockSetSecondaryModalActive).toHaveBeenCalledWith(
      expect.objectContaining({ modalName: 'VideoPlayerModal', value: true })
    )
  })

  it('opens the external link disclaimer modal when the action button is clicked for a released item', async () => {
    render(
      <ArenaPortalItem
        data={{ ...baseItem, releaseDate: DateTime.now().minus({ days: 1 }).toISO() }}
      />
    )

    await userEvent.click(screen.getByRole('button', { name: /play now/i }))

    expect(mockSetSecondaryModalActive).toHaveBeenCalledWith(
      expect.objectContaining({ modalName: 'ExternalLinkDisclaimerModal', value: true })
    )
  })
})
