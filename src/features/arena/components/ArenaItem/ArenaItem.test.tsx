import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ArenaPortalItemType } from 'features/arena/pages/Arena'
import { MemoryRouter } from 'react-router-dom'

import { ArenaItem } from './ArenaItem'

const mockNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}))

const mockSetSecondaryModalActive = jest.fn()
jest.mock('store', () => ({
  useActions: () => ({
    modal: { setSecondaryModalActive: mockSetSecondaryModalActive },
  }),
}))

const baseItem = {
  url: '/some-app',
  title: 'Test Game',
  creatorUrl: 'https://creator.example.com',
  image: { data: { attributes: { url: 'https://example.com/image.png' } } },
} as unknown as ArenaPortalItemType

describe('ArenaItem', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  it('renders the item title and image', () => {
    render(
      <MemoryRouter>
        <ArenaItem data={baseItem} />
      </MemoryRouter>
    )

    expect(screen.getByText('Test Game')).toBeInTheDocument()
    expect(screen.getByAltText('Test Game')).toHaveAttribute(
      'src',
      baseItem.image.data.attributes.url
    )
  })

  it('navigates in-app when the item is an Alien Worlds app', async () => {
    render(
      <MemoryRouter>
        <ArenaItem data={{ ...baseItem, isAlienWorldsApp: true }} />
      </MemoryRouter>
    )

    await userEvent.click(screen.getByText('Test Game'))

    expect(mockNavigate).toHaveBeenCalledWith(baseItem.url)
    expect(mockSetSecondaryModalActive).not.toHaveBeenCalled()
  })

  it('opens the external link disclaimer modal for third-party apps', async () => {
    render(
      <MemoryRouter>
        <ArenaItem data={{ ...baseItem, isAlienWorldsApp: false }} />
      </MemoryRouter>
    )

    await userEvent.click(screen.getByText('Test Game'))

    expect(mockSetSecondaryModalActive).toHaveBeenCalledWith(
      expect.objectContaining({ modalName: 'ExternalLinkDisclaimerModal', value: true })
    )
    expect(mockNavigate).not.toHaveBeenCalled()
  })
})
