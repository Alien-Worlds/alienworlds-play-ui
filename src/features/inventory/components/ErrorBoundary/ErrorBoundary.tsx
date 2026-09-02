/**
 * @fileoverview Error boundary component for inventory feature
 *
 * This component catches JavaScript errors anywhere in the inventory component tree,
 * logs those errors, and displays a fallback UI instead of crashing the entire app.
 */

import React, { Component, ErrorInfo, ReactNode } from 'react'

import { Button } from '@alien-worlds/uikit'

import { ErrorBoundaryProps } from '../../types'

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
}

/**
 * Default fallback component for error boundary
 */
const DefaultErrorFallback: React.FC<{ error: Error; resetError: () => void }> = ({
  error,
  resetError,
}) => (
  <div className="p-6 text-center">
    <div className="mb-4 rounded-md bg-red-950/60 p-4 text-left text-red-100">
      <p className="font-bold">Something went wrong!</p>
      <p className="text-sm">
        An error occurred while loading the inventory. Please try refreshing the page.
      </p>
    </div>

    <div className="flex flex-col items-center gap-4">
      <p className="font-mono text-sm text-gray-400">{error.message}</p>

      <Button variant="primary" size="sm" onClick={resetError}>
        Try Again
      </Button>
    </div>
  </div>
)

/**
 * Error boundary component for inventory
 *
 * @example
 * ```tsx
 * <InventoryErrorBoundary>
 *   <InventoryComponent />
 * </InventoryErrorBoundary>
 * ```
 */
export class InventoryErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    }
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log the error to console and any error reporting service
    console.error('Inventory Error Boundary caught an error:', error, errorInfo)

    this.setState({
      error,
      errorInfo,
    })

    // Call the onError callback if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }

    // Here you could also log to an error reporting service
    // Example: logErrorToService(error, errorInfo)
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    })
  }

  render(): ReactNode {
    if (this.state.hasError) {
      // Render custom fallback UI if provided
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback
        return <FallbackComponent error={this.state.error!} />
      }

      // Render default fallback UI
      return <DefaultErrorFallback error={this.state.error!} resetError={this.handleReset} />
    }

    return this.props.children
  }
}

/**
 * Higher-order component that wraps a component with error boundary
 *
 * @param WrappedComponent - Component to wrap
 * @param fallback - Optional custom fallback component
 * @returns Component wrapped with error boundary
 *
 * @example
 * ```tsx
 * const SafeInventoryComponent = withErrorBoundary(InventoryComponent)
 * ```
 */
export const withErrorBoundary = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
  fallback?: React.ComponentType<{ error: Error }>
) => {
  const WithErrorBoundaryComponent = (props: P) => (
    <InventoryErrorBoundary fallback={fallback}>
      <WrappedComponent {...props} />
    </InventoryErrorBoundary>
  )

  WithErrorBoundaryComponent.displayName = `withErrorBoundary(${
    WrappedComponent.displayName || WrappedComponent.name
  })`

  return WithErrorBoundaryComponent
}

/**
 * Hook for handling errors in functional components
 *
 * @returns Object with error handling functions
 *
 * @example
 * ```tsx
 * const { handleError, clearError } = useErrorHandler()
 *
 * try {
 *   // Some operation that might fail
 * } catch (error) {
 *   handleError(error)
 * }
 * ```
 */
export const useErrorHandler = () => {
  const handleError = (error: Error, context?: string) => {
    console.error(`Error in ${context || 'inventory'}:`, error)

    // Here you could dispatch to a global error state
    // or send to an error reporting service
  }

  const clearError = () => {
    // Clear any error state if needed
  }

  return {
    handleError,
    clearError,
  }
}

export default InventoryErrorBoundary
