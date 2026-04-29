import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client'
import { setContext } from '@apollo/client/link/context'

const httpLink = createHttpLink({
  uri: process.env.REACT_APP_API_URL,
})

const authLink = setContext((_, { headers }) => {
  // Get the authentication token from local storage if it exists
  const token = localStorage.getItem('auth_token')

  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    },
  }
})

export const createApolloClient = () => {
  return new ApolloClient({
    link: authLink.concat(httpLink),
    cache: new InMemoryCache({
      typePolicies: {
        Query: {
          fields: {
            // Add field policies here
          },
        },
      },
    }),
    defaultOptions: {
      watchQuery: {
        fetchPolicy: 'cache-and-network',
      },
    },
  })
}

// Error handling middleware
export const handleApiError = (error: any): string => {
  if (error.networkError) {
    return 'Network error occurred. Please check your connection.'
  }

  if (error.graphQLErrors) {
    return error.graphQLErrors.map((err: any) => err.message).join(', ')
  }

  return 'An unexpected error occurred.'
}
