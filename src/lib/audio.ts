import { audioManager } from "./audio-manager"

export const playSound = (type: "buy" | "sell") => {
	if (typeof window === "undefined") return
	
	audioManager.play(type)
}
