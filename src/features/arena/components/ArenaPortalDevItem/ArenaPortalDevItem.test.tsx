import { render, screen } from '@testing-library/react'
import { ArenaPortalDevItemType } from 'features/arena/pages/Arena'

import { ArenaPortalDevItem } from './ArenaPortalDevItem'

const data: ArenaPortalDevItemType = {
  url: 'https://developer.example.com',
  image: 'https://example.com/dev-image.png',
  title: 'Dev Game',
  description: 'A community-made game.',
}

describe('ArenaPortalDevItem', () => {
  it('renders the title, description and a link to the app', () => {
    render(<ArenaPortalDevItem data={data} />)

    expect(screen.getByText('Dev Game')).toBeInTheDocument()
    expect(screen.getByText('A community-made game.')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /join now/i })).toHaveAttribute('href', data.url)
  })
})
