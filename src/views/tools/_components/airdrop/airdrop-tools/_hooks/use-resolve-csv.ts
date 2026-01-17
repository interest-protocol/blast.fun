import { useCallback, useState } from "react"
import { parseCsvLines } from "../_utils/parse-csv"
import { AirdropRecipient } from "../airdrop-tools.types"
import { resolveSuiName } from "../_utils/resolve-SuiNS"

export const useResolveCsv = () => {
    const [resolving, setResolving] = useState(false)

    const resolveCsv = useCallback(async (csvText: string): Promise<AirdropRecipient[]> => {
        const lines = parseCsvLines(csvText)
        if (!lines.length) return []

        setResolving(true)
        try {
            const parsed: AirdropRecipient[] = []

            for (const { addressInput, amount } of lines) {
                if (!addressInput || !amount) continue

                if (/^@/.test(addressInput) || addressInput.endsWith(".sui")) {
                    const placeholderIndex = parsed.push({
                        address: "",
                        amount,
                        originalInput: addressInput,
                        isResolving: true,
                    }) - 1

                    const resolved = await resolveSuiName(addressInput)
                    if (resolved) {
                        parsed[placeholderIndex] = {
                            address: resolved,
                            amount,
                            originalInput: addressInput,
                            isResolving: false,
                        }
                    } else {
                        parsed[placeholderIndex] = {
                            address: "",
                            amount,
                            originalInput: addressInput,
                            isResolving: false,
                            resolutionError: `Failed to resolve ${addressInput}`,
                        }
                    }
                } else if (addressInput.startsWith("0x") && addressInput.length >= 42) {
                    parsed.push({
                        address: addressInput,
                        amount,
                        originalInput: addressInput,
                    })
                } else {
                    parsed.push({
                        address: "",
                        amount,
                        originalInput: addressInput,
                        isResolving: false,
                        resolutionError: "Invalid address format",
                    })
                }
            }

            return parsed
        } finally {
            setResolving(false)
        }
    }, [])

    return { resolveCsv, resolving }
}
