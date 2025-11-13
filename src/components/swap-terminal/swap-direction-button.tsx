"use client";

import { FC } from "react";
import { ArrowLeftRight } from "lucide-react";

interface SwapDirectionButtonProps {
    onClick: () => void;
}

export const SwapDirectionButton: FC<SwapDirectionButtonProps> = ({
    onClick,
}) => {
    return (
        <div className="flex justify-center -my-2">
            <button
                onClick={onClick}
                className="h-10 w-10 rounded-full border border-border/50 bg-background hover:bg-muted/50 flex items-center justify-center transition-colors"
            >
                <ArrowLeftRight className="h-4 w-4" />
            </button>
        </div>
    );
};

