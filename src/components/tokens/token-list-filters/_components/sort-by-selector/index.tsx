import { FC } from "react";

import { cn } from "@/utils"
import { Label } from "@/components/ui/label"

import { OPTIONS } from "./sort-by-selector.data";
import { SortBySelectorProps } from "./sort-by-selector.types";


const SortBySelector: FC<SortBySelectorProps> = ({ value, onChange }) => (
    <div>
        <Label className="font-mono text-xs uppercase tracking-wider text-foreground/60">
            Sort By
        </Label>
        <div className="grid grid-cols-2 gap-1 bg-muted rounded-lg border p-1 mt-2">
            {OPTIONS.map(opt => (
                <button
                    key={opt.value}
                    className={cn(
                        "py-2 px-3 rounded-md font-mono text-xs uppercase tracking-wider transition-all",
                        value === opt.value
                            ? "bg-background shadow-sm text-foreground"
                            : "hover:text-foreground text-muted-foreground"
                    )}
                    onClick={() => onChange(opt.value)}
                >
                    {opt.label}
                </button>
            ))}
        </div>
    </div>
);

export default SortBySelector;