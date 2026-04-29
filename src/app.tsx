import { ApolloProvider } from '@apollo/client'
import { ChakraProvider } from '@chakra-ui/react'
import { Web3OnboardProvider } from '@web3-onboard/react'
import { client } from 'graphql/client'
import { RouterProvider } from 'react-router-dom'
import { router } from 'routes'
import { StyledToaster } from 'shared/components/StyledToast'
import { theme } from 'shared/styles/theme'
import { initWeb3Onboard } from 'shared/util/service'

export const App = () => {
  return (
    <Web3OnboardProvider web3Onboard={initWeb3Onboard}>
      <ChakraProvider theme={theme}>
        <ApolloProvider client={client}>
          <link rel="preconnect" href="https://fonts.gstatic.com" />
          <StyledToaster />
          <RouterProvider router={router} />
        </ApolloProvider>
      </ChakraProvider>
    </Web3OnboardProvider>
  )
}
