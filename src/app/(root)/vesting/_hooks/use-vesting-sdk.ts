"use client"

import { useMemo } from "react"
import { MemezVestingSDK } from "@interest-protocol/memez-fun-sdk"
import { Network } from "@interest-protocol/sui-core-sdk"
import { getFullnodeUrl } from "@mysten/sui/client"

export function useVestingSDK() {
	const vestingSdk = useMemo(() => {
		// @dev: Use mainnet as required by Memez SDK 8.0.0
		const network = Network.MAINNET
		
		return new MemezVestingSDK({
			network,
			fullNodeUrl: getFullnodeUrl(network),
		})
	}, [])

	return vestingSdk
}