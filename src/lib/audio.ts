export const playSound = (type: 'buy' | 'sell') => {
	if (typeof window === 'undefined') return

	try {
		const audio = new Audio()

		const sounds = {
			buy: '/sfx/pump.wav',
			sell: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQoGAADw8PDw8PDw8ODg4ODQwMDAwKCgoKCAYGBgYEBAQEBAICAgIAAAAAAAICAgICBAQEBAQGBgYGBoaGhoYGBgYGB',
		}

		audio.src = sounds[type]
		audio.volume = 0.5
		audio.play().catch(() => { })
	} catch (error) {
		// silent catch
	}
}