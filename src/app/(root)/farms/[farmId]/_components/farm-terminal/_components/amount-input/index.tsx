import { FC } from "react"

import { TokenAvatar } from "@/components/tokens/token-avatar"
import { AmountInputProps } from "./amount-input.types"

const AmountInput: FC<AmountInputProps> = ({ amount, setAmount, tokenSymbol, tokenIcon, disabled }) => (
    <div className="flex items-center gap-2">
        <input
            type="text"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="flex-1 bg-transparent text-2xl sm:text-3xl font-medium outline-none placeholder:text-muted-foreground/50 text-foreground min-w-0"
            disabled={disabled}
            inputMode="decimal"
        />
        <div className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-4 py-2 sm:py-3 bg-muted/20 rounded-md border border-border/50 shrink-0">
            <TokenAvatar
                iconUrl={tokenIcon}
                symbol={tokenSymbol}
                className="w-5 h-5 sm:w-6 sm:h-6 rounded-full"
                enableHover={false}
            />
            <span className="text-sm sm:text-base font-medium whitespace-nowrap">{tokenSymbol}</span>
        </div>
    </div>
)

export default AmountInput