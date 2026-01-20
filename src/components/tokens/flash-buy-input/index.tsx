"use client";

import { useState, useEffect, FC } from "react";

import { useApp } from "@/context/app.context";
import { useDebouncedCallback } from "use-debounce";
import { usePresetStore } from "@/stores/preset-store";

import { FlashBuyInputProps } from "./flash-buy-input.types";

const FlashBuyInput: FC<FlashBuyInputProps> = ({ column }) => {
    const { isConnected } = useApp()
    const { flashBuyAmounts, setFlashBuyAmount } = usePresetStore()
    const [localValue, setLocalValue] = useState<number | string>(flashBuyAmounts[column])

    const debouncedSetFlashBuy = useDebouncedCallback((value: number) => {
        setFlashBuyAmount(column, value);
    }, 500)

    useEffect(() => {
        setLocalValue(flashBuyAmounts[column])
    }, [flashBuyAmounts, column])

    if (!isConnected) {
        return null;
    }

    return (
        <div className="relative flex items-center">
            <img
                src="/assets/currency/sui-fill.svg"
                alt="SUI"
                width={12}
                height={12}
                className="absolute left-1.5 pointer-events-none"
            />
            <input
                type="text"
                value={localValue}
                onChange={(e) => {
                    const inputValue = e.target.value
                    if (inputValue === '') {
                        setLocalValue('')
                        return
                    }

                    // validate input is a valid number format (including partial decimals)
                    const isValidFormat = /^\d*\.?\d*$/.test(inputValue)

                    if (isValidFormat) {
                        setLocalValue(inputValue)

                        // only update the store if it's a complete valid number
                        const numValue = parseFloat(inputValue)
                        if (!isNaN(numValue) && numValue >= 0.00001 && numValue <= 99999) {
                            debouncedSetFlashBuy(numValue)
                        }
                    }
                }}
                onBlur={() => {
                    // clean up the display value and enforce minimum
                    const numValue = parseFloat(localValue.toString())
                    if (!isNaN(numValue) && numValue >= 0.00001) {
                        setLocalValue(numValue)
                    } else {
                        setLocalValue(0.00001)
                        setFlashBuyAmount(column, 0.00001)
                    }
                }}
                className="w-16 h-7 rounded-lg border border-border bg-muted/50 pl-6 pr-1 
                text-center text-xs focus:border-primary focus:outline-none transition-all"
                placeholder="0.00001"
            />
        </div>
    );
}

export default FlashBuyInput;