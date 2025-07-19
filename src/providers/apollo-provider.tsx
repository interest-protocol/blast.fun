"use client"

import { ApolloProvider as ApolloClientProvider } from "@apollo/client"
import { apolloClient } from "@/lib/apollo-client"

export function ApolloProvider({ children }: { children: React.ReactNode }) {
	return <ApolloClientProvider client={apolloClient}>{children}</ApolloClientProvider>
}
