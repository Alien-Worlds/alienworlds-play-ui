import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { ProfileErrorBoundary } from './ProfileErrorBoundary'

const Bomb = () => {
  throw new Error('kaboom')
}

describe('ProfileErrorBoundary', () => {
  const originalError = console.error
  beforeEach(() => {
    console.error = jest.fn()
  })
  afterEach(() => {
    console.error = originalError
  })

  it('renders children when there is no error', () => {
    render(
      <ProfileErrorBoundary>
        <div>safe content</div>
      </ProfileErrorBoundary>
    )
    expect(screen.getByText('safe content')).toBeInTheDocument()
  })

  it('renders the default fallback UI when a child throws', () => {
    render(
      <ProfileErrorBoundary>
        <Bomb />
      </ProfileErrorBoundary>
    )

    expect(screen.getByText('Failed to load profile data')).toBeInTheDocument()
    expect(screen.getByText('Try Again')).toBeInTheDocument()
    expect(screen.getByText('Refresh Page')).toBeInTheDocument()
  })

  it('renders a custom fallback when provided', () => {
    render(
      <ProfileErrorBoundary fallback={<div>custom fallback</div>}>
        <Bomb />
      </ProfileErrorBoundary>
    )
    expect(screen.getByText('custom fallback')).toBeInTheDocument()
  })

  it('calls the onError handler when a child throws', () => {
    const onError = jest.fn()
    render(
      <ProfileErrorBoundary onError={onError}>
        <Bomb />
      </ProfileErrorBoundary>
    )
    expect(onError).toHaveBeenCalledWith(expect.any(Error), expect.anything())
  })

  it('resets to render children again after clicking Try Again', async () => {
    let shouldThrow = true
    const Toggle = () => {
      if (shouldThrow) throw new Error('kaboom')
      return <div>recovered</div>
    }

    render(
      <ProfileErrorBoundary>
        <Toggle />
      </ProfileErrorBoundary>
    )

    expect(screen.getByText('Failed to load profile data')).toBeInTheDocument()

    shouldThrow = false
    await userEvent.click(screen.getByText('Try Again'))

    expect(screen.getByText('recovered')).toBeInTheDocument()
  })
})
