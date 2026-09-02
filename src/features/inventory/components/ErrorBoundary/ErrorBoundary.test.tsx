import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { InventoryErrorBoundary, withErrorBoundary } from './ErrorBoundary'

const Bomb = () => {
  throw new Error('kaboom')
}

describe('InventoryErrorBoundary', () => {
  const originalError = console.error
  beforeEach(() => {
    console.error = jest.fn()
  })
  afterEach(() => {
    console.error = originalError
  })

  it('renders children when there is no error', () => {
    render(
      <InventoryErrorBoundary>
        <div>safe content</div>
      </InventoryErrorBoundary>
    )
    expect(screen.getByText('safe content')).toBeInTheDocument()
  })

  it('renders the default fallback UI when a child throws', () => {
    render(
      <InventoryErrorBoundary>
        <Bomb />
      </InventoryErrorBoundary>
    )

    expect(screen.getByText('Something went wrong!')).toBeInTheDocument()
    expect(screen.getByText('kaboom')).toBeInTheDocument()
    expect(screen.getByText('Try Again')).toBeInTheDocument()
  })

  it('renders a custom fallback component when provided', () => {
    const CustomFallback = ({ error }: { error: Error }) => (
      <div>custom fallback: {error.message}</div>
    )

    render(
      <InventoryErrorBoundary fallback={CustomFallback}>
        <Bomb />
      </InventoryErrorBoundary>
    )

    expect(screen.getByText('custom fallback: kaboom')).toBeInTheDocument()
  })

  it('calls the onError handler when a child throws', () => {
    const onError = jest.fn()
    render(
      <InventoryErrorBoundary onError={onError}>
        <Bomb />
      </InventoryErrorBoundary>
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
      <InventoryErrorBoundary>
        <Toggle />
      </InventoryErrorBoundary>
    )

    expect(screen.getByText('Something went wrong!')).toBeInTheDocument()

    shouldThrow = false
    await userEvent.click(screen.getByText('Try Again'))

    expect(screen.getByText('recovered')).toBeInTheDocument()
  })
})

describe('withErrorBoundary', () => {
  const originalError = console.error
  beforeEach(() => {
    console.error = jest.fn()
  })
  afterEach(() => {
    console.error = originalError
  })

  it('wraps a component with the error boundary', () => {
    const Safe = () => <div>safe content</div>
    const Wrapped = withErrorBoundary(Safe)

    render(<Wrapped />)
    expect(screen.getByText('safe content')).toBeInTheDocument()
  })

  it('catches errors thrown by the wrapped component', () => {
    const Wrapped = withErrorBoundary(Bomb)

    render(<Wrapped />)
    expect(screen.getByText('Something went wrong!')).toBeInTheDocument()
  })
})
