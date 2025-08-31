"use client"

import { createContext, useContext } from "react"

const TokenContext = createContext<string>("")

export function useAuthToken() {
	return useContext(TokenContext)
}

export { TokenContext }