"use client";

import { FC } from "react";
import { Dialog, DialogContent } from "../ui/dialog";
import { Button } from "../ui/button";

interface SlippageSettingsDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    slippage: number;
    onSlippageChange: (slippage: number) => void;
}

export const SlippageSettingsDialog: FC<SlippageSettingsDialogProps> = ({
    open,
    onOpenChange,
    slippage,
    onSlippageChange,
}) => {
    const handleSlippageSelect = (value: number) => {
        onSlippageChange(value);
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-sm">
                <div className="space-y-4">
                    <h3 className="font-mono text-sm uppercase tracking-wider">
                        Slippage Tolerance
                    </h3>
                    <div className="flex gap-2">
                        {[0.1, 0.5, 1, 3].map((value) => (
                            <Button
                                key={value}
                                variant={
                                    slippage === value ? "default" : "outline"
                                }
                                size="sm"
                                onClick={() => handleSlippageSelect(value)}
                                className="flex-1"
                            >
                                {value}%
                            </Button>
                        ))}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

