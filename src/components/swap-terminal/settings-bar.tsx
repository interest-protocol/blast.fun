"use client";

import { FC } from "react";
import { Activity, Settings2 } from "lucide-react";

interface SettingsBarProps {
    slippage: number;
    onSettingsClick: () => void;
}

export const SettingsBar: FC<SettingsBarProps> = ({
    slippage,
    onSettingsClick,
}) => {
    return (
        <div className="flex items-center justify-between p-2 rounded-lg bg-muted/10 border border-border/50">
            <div className="flex items-center gap-3 text-[10px] font-mono uppercase">
                <div className="flex items-center gap-1">
                    <Activity className="h-3 w-3 text-yellow-500" />
                    <span>Slippage: {slippage}%</span>
                </div>
            </div>

            <button
                className="p-1 rounded border border-border hover:border-primary/50 transition-colors"
                onClick={onSettingsClick}
            >
                <Settings2 className="h-3 w-3" />
            </button>
        </div>
    );
};

