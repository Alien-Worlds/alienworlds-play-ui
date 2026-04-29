/**
 * ProfileErrorBoundary Component
 *
 * A specialized error boundary for the profile feature.
 * It provides graceful error handling and recovery options.
 */

import React, { Component, ErrorInfo, ReactNode } from 'react'

import { Box, Button, Flex, Text, VStack } from '@chakra-ui/react'
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
        <Box
          p={8}
          bg={Colors.BLACK_SOLID_90}
          borderRadius="12px"
          border="1px solid"
          borderColor={Colors.RADICAL_RED}
        >
          <VStack spacing={4} align="center">
            <Text fontSize="lg" fontWeight="bold" color={Colors.RADICAL_RED} textAlign="center">
              {ERROR_MESSAGES.PROFILE_LOAD_FAILED}
            </Text>

            <Text fontSize="sm" color={Colors.GRAY_CHATEAU} textAlign="center">
              Something went wrong while loading your profile. Please try again.
            </Text>

            <Flex gap={4}>
              <Button variant="primary" size="md" onClick={this.handleRetry}>
                Try Again
              </Button>

              <Button variant="secondary" size="md" onClick={() => window.location.reload()}>
                Refresh Page
              </Button>
            </Flex>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <Box p={4} bg={Colors.BLACK_NEUTRAL} borderRadius="8px" maxW="100%" overflow="auto">
                <Text fontSize="xs" color={Colors.RADICAL_RED} fontFamily="mono">
                  {this.state.error.message}
                </Text>
              </Box>
            )}
          </VStack>
        </Box>
      )
    }

    return this.props.children
  }
}
