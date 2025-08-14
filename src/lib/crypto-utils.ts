import { createHash } from "crypto"

export function generateUrlHash(url: string): string {
	return createHash("sha256").update(url).digest("hex")
}