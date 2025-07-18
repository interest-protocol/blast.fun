import { ApolloClient, InMemoryCache } from '@apollo/client'
import { env } from '@/env'

export const apolloClient = new ApolloClient({
	uri: env.NEXT_PUBLIC_GRAPHQL_API_URL,
	cache: new InMemoryCache(),
});