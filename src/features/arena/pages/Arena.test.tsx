import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'

import { Arena } from './Arena'

const mockShowArenaPortalPage = jest.fn()
const mockSetSecondaryModalActive = jest.fn()
jest.mock('store', () => ({
  useActions: () => ({
    arena: { showArenaPortalPage: mockShowArenaPortalPage },
    modal: { setSecondaryModalActive: mockSetSecondaryModalActive },
  }),
}))

const arenaItems = [
  {
    id: 1,
    attributes: {
      title: 'Racer',
      image: { data: { attributes: { url: 'https://example.com/racer.png' } } },
      categories: { data: [{ attributes: { name: 'Racing' } }] },
    },
  },
  {
    id: 2,
    attributes: {
      title: 'Puzzle',
      image: { data: { attributes: { url: 'https://example.com/puzzle.png' } } },
      categories: { data: [{ attributes: { name: 'Puzzle' } }] },
    },
  },
]

const arenaCategories = [
  { id: 1, attributes: { name: 'Racing' } },
  { id: 2, attributes: { name: 'Puzzle' } },
]

jest.mock('features/arena/hooks/useArenaPortal', () => ({
  useArenaPortal: () => ({ data: arenaItems }),
  useArenaCategories: () => ({ data: arenaCategories }),
}))

describe('Arena page', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  it('tracks the page visit on mount', () => {
    render(<Arena />, { wrapper: MemoryRouter })

    expect(mockShowArenaPortalPage).toHaveBeenCalled()
  })

  it('renders a tab per category plus "All"', () => {
    render(<Arena />, { wrapper: MemoryRouter })

    expect(screen.getAllByText('All').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Racing').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Puzzle').length).toBeGreaterThan(0)
  })

  it('filters arena items when switching to a category tab', async () => {
    render(<Arena />, { wrapper: MemoryRouter })

    const racingTab = screen.getAllByRole('tab', { name: 'Racing' })[0]
    await userEvent.click(racingTab)

    expect(screen.getAllByText('Racer').length).toBeGreaterThan(0)
  })
})
