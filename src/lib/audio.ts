import { audioManager } from "./audio-manager"

export const playSound = (type: "buy" | "sell" | "new_trade" | "new_token") => {
	if (typeof window === "undefined") return

	audioManager.play(type)
}
