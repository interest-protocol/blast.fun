import { FC } from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { BondingProgressInputsProps } from "./bonding-progress-inputs.types";

const BondingProgressInputs: FC<BondingProgressInputsProps> = ({ min, max, onChangeMin, onChangeMax }) => (
    <div>
        <Label className="font-mono text-xs uppercase tracking-wider text-foreground/60">
            BONDING PROGRESS <span className="text-muted-foreground/40">(%)</span>
        </Label>
        <div className="flex gap-2 mt-2">
            <Input
                type="number"
                placeholder="[MIN]"
                value={min ?? ''}
                onChange={e => onChangeMin(e.target.value ? Number(e.target.value) : undefined)}
                className="font-mono focus:border-primary/50"
            />
            <Input
                type="number"
                placeholder="[MAX]"
                value={max ?? ''}
                onChange={e => onChangeMax(e.target.value ? Number(e.target.value) : undefined)}
                className="font-mono focus:border-primary/50"
            />
        </div>
    </div>
);

export default BondingProgressInputs;