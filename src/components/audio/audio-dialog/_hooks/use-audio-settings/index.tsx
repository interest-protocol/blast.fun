"use client";

import { useEffect, useRef, useState } from "react";
import { audioManager, AudioSettings } from "@/lib/audio-manager";

export const useAudioSettings = (dialogOpen: boolean) => {
    const [settings, setSettings] = useState<AudioSettings>(audioManager.getSettings())
    const [volumeInput, setVolumeInput] = useState(Math.round(settings.volume * 100).toString())
    const [isEditingVolume, setIsEditingVolume] = useState(false)
    const [localEnabled, setLocalEnabled] = useState(settings.enabled)
    const volumeInputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        if (dialogOpen) {
            const currentSettings = audioManager.getSettings()
            setSettings(currentSettings)
            setLocalEnabled(currentSettings.enabled)
            setVolumeInput(Math.round(currentSettings.volume * 100).toString())
        }
    }, [dialogOpen])

    useEffect(() => {
        const unsubscribe = audioManager.subscribe((newSettings) => {
            setSettings(newSettings)
            setLocalEnabled(newSettings.enabled)

            if (!isEditingVolume) {
                setVolumeInput(Math.round(newSettings.volume * 100).toString())
            }
        })

        return () => {
            unsubscribe()
        }
    }, [isEditingVolume])

    const handleEnabledChange = (enabled: boolean) => {
        setLocalEnabled(enabled)
        audioManager.setEnabled(enabled)
    }

    const handleVolumeChange = (value: number[]) => {
        audioManager.setVolume(value[0])
        setVolumeInput(Math.round(value[0] * 100).toString())
    }

    const handleVolumeInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/[^0-9]/g, '')
        if (value === '' || (parseInt(value) >= 0 && parseInt(value) <= 100)) {
            setVolumeInput(value)
        }
    }

    const handleVolumeInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            volumeInputRef.current?.blur()
        }
    }

    const handleVolumeInputBlur = () => {
        setIsEditingVolume(false)
        const numValue = parseInt(volumeInput) || 0
        const clampedValue = Math.max(0, Math.min(100, numValue))
        audioManager.setVolume(clampedValue / 100)
        setVolumeInput(clampedValue.toString())
    }

    const handleVolumeInputFocus = () => {
        setIsEditingVolume(true)
        volumeInputRef.current?.select()
    }

    return {
        settings,
        volumeInput,
        localEnabled,
        volumeInputRef,
        handlers: {
            handleEnabledChange,
            handleVolumeChange,
            handleVolumeInputChange,
            handleVolumeInputKeyDown,
            handleVolumeInputBlur,
            handleVolumeInputFocus,
        },
    }
}