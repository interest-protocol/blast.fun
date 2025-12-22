'use client';

import { useMemo } from "react";

import { formatAddress } from "@mysten/sui/utils";
import { useResolveSuiNSName } from "@mysten/dapp-kit";
import { DisplayData } from "../../creator-display.types";

interface UseCreatorDisplayDataProps {
	twitterHandle?: string
	twitterId?: string
	walletAddress?: string
}

export const useCreatorDisplayData = ({
	twitterHandle,
	twitterId,
	walletAddress,
}: UseCreatorDisplayDataProps): DisplayData => {
	const { data: resolvedDomain } = useResolveSuiNSName(
		!twitterHandle && walletAddress ? walletAddress : null
	)

	return useMemo(() => {
		// Priority: handle > resolved domain > wallet address
		if (twitterHandle) {
			const href = twitterId
				? `https://x.com/i/user/${twitterId}`
				: `https://x.com/${twitterHandle}`
			return {
				display: `@${twitterHandle}`,
				href,
				type: 'twitter' as const,
			}
		}

		if (resolvedDomain) {
			return {
				display: resolvedDomain,
				href: null,
				type: 'domain' as const,
			}
		}

		return {
			display: formatAddress(walletAddress || ""),
			href: null,
			type: 'wallet' as const,
		}
	}, [twitterHandle, twitterId, resolvedDomain, walletAddress]);
}
