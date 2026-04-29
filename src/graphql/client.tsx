import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client'
import { config } from 'shared/util/config'

const client = new ApolloClient({
  link: new HttpLink({
    uri: config.graphQLApiUrl, // Replace with your GraphQL endpoint
  }),
  cache: new InMemoryCache(),
})

export { client }
