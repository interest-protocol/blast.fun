import { env } from "@/env"

export interface TurnstileResponse {
	success: boolean
	action?: string
	cdata?: string
	challenge_ts?: string
	'error-codes'?: string[]
	hostname?: string
	metadata?: {
		interactive?: boolean
	}
}

export async function verifyTurnstileToken(
	token: string, 
	remoteip?: string
): Promise<TurnstileResponse> {
	try {
		const body = `secret=${env.CF_TURNSTILE_SECRET_KEY}&response=${token}${remoteip ? `&remoteip=${remoteip}` : ""}`
		
		const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
			method: "POST",
			headers: {
				"Content-Type": "application/x-www-form-urlencoded",
			},
			body,
		})

		const data = await response.json() as TurnstileResponse
		console.log("Turnstile verification:", { data, token: token.substring(0, 20) + "...", remoteip })
		
		return data
	} catch (error) {
		console.error("Turnstile verification error:", error)
		return {
			success: false,
			'error-codes': ['internal-error']
		}
	}
}

export function isTurnstileVerificationSuccessful(response: TurnstileResponse): boolean {
	return response.success === true
}