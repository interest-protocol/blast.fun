import { ApolloClient, InMemoryCache, ApolloLink } from "@apollo/client"
import { onError } from "@apollo/client/link/error"
import { createHttpLink } from "@apollo/client/link/http"
import { env } from "@/env"

const httpLink = createHttpLink({
	uri: env.NEXT_PUBLIC_GRAPHQL_API_URL,
	fetch: async (uri, options) => {
		const response = await fetch(uri, options)
		
		if (!response.ok) {
			const clonedResponse = response.clone()
			try {
				const errorBody = await clonedResponse.text()
				console.error(`GraphQL Error Response (${response.status}):`, {
					status: response.status,
					statusText: response.statusText,
					url: response.url,
					body: errorBody,
					parsedBody: (() => {
						try {
							return JSON.parse(errorBody)
						} catch {
							return errorBody
						}
					})()
				})
			} catch (err) {
				console.error("Failed to read error response body:", err)
			}
		}
		
		return response
	}
})

const errorLink = onError(({ graphQLErrors, networkError, operation, forward }) => {
	if (graphQLErrors) {
		graphQLErrors.forEach((err) => {
			const msg = typeof err.message === "string" ? err.message : String(err)
			const isNotFound = /not found/i.test(msg)
			if (isNotFound) {
				console.warn(`GraphQL:`, msg, { operation: operation.operationName })
			} else {
				console.error(`GraphQL error:`, msg || err, {
					operation: operation.operationName,
					variables: operation.variables,
				})
			}
		})
	}

	if (networkError) {
		console.error(`Network error:`, {
			message: networkError.message,
			name: networkError.name,
			stack: networkError.stack,
			operation: operation.operationName,
			variables: operation.variables
		})
	}

	return forward(operation)
})

export const apolloClient = new ApolloClient({
	link: ApolloLink.from([errorLink, httpLink]),
	cache: new InMemoryCache(),
})
