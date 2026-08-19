/**
 * ProfileErrorBoundary Component
 *
 * A specialized error boundary for the profile feature.
 * It provides graceful error handling and recovery options.
 */

import React, { Component, ErrorInfo, ReactNode } from 'react'

import { Button } from '@alien-worlds/uikit'
import { Colors } from 'shared/util/colors'

import { ERROR_MESSAGES } from '../../constants/profile.constants'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
}

interface State {
  hasError: boolean
  error?: Error
}

export class ProfileErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Profile Error Boundary caught an error:', error, errorInfo)

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }

    // Log to monitoring service
    // TODO: Add error reporting service integration
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined })
  }

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback
      }

      // Default error UI
      return (
        <div
          className="rounded-[12px] border border-solid p-8"
          style={{ background: Colors.BLACK_SOLID_90, borderColor: Colors.RADICAL_RED }}
        >
          <div className="flex flex-col items-center gap-4">
            <p className="text-center text-lg font-bold" style={{ color: Colors.RADICAL_RED }}>
              {ERROR_MESSAGES.PROFILE_LOAD_FAILED}
            </p>

            <p className="text-center text-sm" style={{ color: Colors.GRAY_CHATEAU }}>
              Something went wrong while loading your profile. Please try again.
            </p>

            <div className="flex gap-4">
              <Button variant="primary" size="md" onClick={this.handleRetry}>
                Try Again
              </Button>

              <Button variant="secondary" size="md" onClick={() => window.location.reload()}>
                Refresh Page
              </Button>
            </div>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div
                className="max-w-full overflow-auto rounded-[8px] p-4"
                style={{ background: Colors.BLACK_NEUTRAL }}
              >
                <p className="font-mono text-xs" style={{ color: Colors.RADICAL_RED }}>
                  {this.state.error.message}
                </p>
              </div>
            )}
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
