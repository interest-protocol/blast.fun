"use client"

type SoundEffect = 'new_token' | 'new_trade' | 'buy' | 'sell'

interface AudioSettings {
	enabled: boolean
	volume: number
}

class SimpleAudioManager {
	private static instance: SimpleAudioManager
	private settings: AudioSettings = {
		enabled: true,
		volume: 0.5
	}
	private listeners: Set<(settings: AudioSettings) => void> = new Set()
	private audioElements: Map<SoundEffect, HTMLAudioElement> = new Map()
	private soundUrls: Record<SoundEffect, string> = {
		new_token: '/sfx/new-token.mp3',
		new_trade: '/sfx/new-trade.mp3',
		buy: '/sfx/buy.mp3',
		sell: '/sfx/sell.mp3',
	}

	private constructor() {
		if (typeof window !== 'undefined') {
			this.loadSettings()
			this.initSounds()
		}
	}

	static getInstance(): SimpleAudioManager {
		if (!SimpleAudioManager.instance) {
			SimpleAudioManager.instance = new SimpleAudioManager()
		}
		return SimpleAudioManager.instance
	}

	private loadSettings() {
		try {
			const stored = localStorage.getItem('audioSettings')
			if (stored) {
				this.settings = JSON.parse(stored)
			}
		} catch (error) {
			console.warn('Failed to load audio settings:', error)
		}
	}

	private saveSettings() {
		try {
			localStorage.setItem('audioSettings', JSON.stringify(this.settings))
			this.notifyListeners()
		} catch (error) {
			console.warn('Failed to save audio settings:', error)
		}
	}

	private notifyListeners() {
		this.listeners.forEach(listener => listener(this.settings))
	}

	private initSounds() {
		// pre-create audio elements for each sound
		Object.entries(this.soundUrls).forEach(([key, url]) => {
			const audio = new Audio(url)
			audio.preload = 'auto'
			audio.volume = this.settings.volume
			this.audioElements.set(key as SoundEffect, audio)
		})
	}

	subscribe(listener: (settings: AudioSettings) => void) {
		this.listeners.add(listener)
		return () => this.listeners.delete(listener)
	}

	getSettings(): AudioSettings {
		return { ...this.settings }
	}

	setEnabled(enabled: boolean) {
		this.settings.enabled = enabled
		this.saveSettings()
	}

	setVolume(volume: number) {
		this.settings.volume = Math.max(0, Math.min(1, volume))
		this.audioElements.forEach(audio => {
			audio.volume = this.settings.volume
		})
		this.saveSettings()
	}

	play(sound: SoundEffect) {
		if (!this.settings.enabled) return

		const audio = this.audioElements.get(sound)
		if (!audio) {
			console.warn(`Sound ${sound} not found`)
			return
		}

		try {
			const clone = audio.cloneNode() as HTMLAudioElement
			clone.volume = this.settings.volume
			clone.play().catch(error => {
				console.warn(`Failed to play sound ${sound}:`, error)
			})
		} catch (error) {
			console.warn(`Error playing sound ${sound}:`, error)
		}
	}
}

export const audioManager = SimpleAudioManager.getInstance()
export type { AudioSettings, SoundEffect }