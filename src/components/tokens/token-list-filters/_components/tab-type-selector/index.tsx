import { FC } from "react"

import { cn } from "@/utils"
import { Label } from "@/components/ui/label"
import { TabTypeSelectorProps } from "./tab-type-selector.types"

const TabTypeSelector: FC<TabTypeSelectorProps> = ({ value, onChange }) => (
    <div>
        <Label className="font-mono text-xs uppercase tracking-wider text-foreground/60">
            Token Status
        </Label>
        <div className="flex bg-muted rounded-lg border p-1 mt-2">
            {(['newly-created', 'about-to-bond', 'bonded'] as const).map((opt) => (
                <button
                    key={opt}
                    className={cn(
                        "flex-1 py-2 px-3 rounded-md font-mono text-xs uppercase tracking-wider transition-all",
                        value === opt
                            ? "bg-background shadow-sm text-foreground"
                            : "hover:text-foreground text-muted-foreground"
                    )}
                    onClick={() => onChange(opt)}
                >
                    {opt === 'newly-created' ? 'NEW' :
                        opt === 'about-to-bond' ? 'BONDING' : 'BONDED'}
                </button>
            ))}
        </div>
    </div>
);

export default TabTypeSelector;