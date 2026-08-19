import { render, screen } from '@testing-library/react'

import { BadgeDisplay } from './BadgeDisplay'

jest.mock('shared/components/UserLevelsBadges/UserLevelsBadges', () => ({
  BadgesMap: ({ level, width, height }: { level: number; width: string; height: string }) => (
    <div data-testid="badges-map" data-level={level} data-width={width} data-height={height} />
  ),
}))

describe('BadgeDisplay', () => {
  it('renders the badge map when a level is provided and showMap is true', () => {
    render(<BadgeDisplay level={5} />)

    const badge = screen.getByTestId('badges-map')
    expect(badge).toHaveAttribute('data-level', '5')
    expect(badge).toHaveAttribute('data-width', '40px')
    expect(badge).toHaveAttribute('data-height', '40px')
  })

  it('does not render the badge map when no level is provided', () => {
    render(<BadgeDisplay />)
    expect(screen.queryByTestId('badges-map')).not.toBeInTheDocument()
  })

  it('does not render the badge map when showMap is false', () => {
    render(<BadgeDisplay level={5} showMap={false} />)
    expect(screen.queryByTestId('badges-map')).not.toBeInTheDocument()
  })

  it('resolves the size prop to width/height pixel values', () => {
    const { rerender } = render(<BadgeDisplay level={1} size="small" />)
    expect(screen.getByTestId('badges-map')).toHaveAttribute('data-width', '30px')

    rerender(<BadgeDisplay level={1} size="large" />)
    expect(screen.getByTestId('badges-map')).toHaveAttribute('data-width', '50px')
  })
})
