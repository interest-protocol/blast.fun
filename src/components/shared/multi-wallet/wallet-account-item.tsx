import { FC } from "react"
import { WalletAccountItemProps } from "./multi-wallet.types"
import { useResolveSuiNSName } from "@mysten/dapp-kit"
import { useClipboard } from "@/hooks/use-clipboard"
import { formatAddress } from "@mysten/sui/utils"
import { Button } from "@/components/ui/button"
import { Check, CheckCircle2, Copy, Wallet } from "lucide-react"
import { cn } from "@/utils"

const WalletAccountItem: FC<WalletAccountItemProps> = ({ account, isActive, onSelect }) => {
    const { data: domain } = useResolveSuiNSName(account.address)
    const { copy, copied } = useClipboard()

    const displayAddress = domain || formatAddress(account.address)

    const handleCopy = (e: React.MouseEvent) => {
        e.stopPropagation()
        copy(account.address)
    }

    return (
        <Button
            variant="ghost"
            onClick={onSelect}
            className={cn(
                "w-full justify-start h-auto py-2",
                isActive && "bg-background/60"
            )}
        >
            <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                    <Wallet className="size-4 text-muted-foreground" />
                    <span className="text-sm font-normal">
                        {displayAddress}
                    </span>
                </div>

                <div className="flex items-center gap-1">
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={handleCopy}
                        className="size-5"
                    >
                        {copied ? (
                            <CheckCircle2 className="size-4 text-muted-foreground" />
                        ) : (
                            <Copy className="size-4 text-muted-foreground" />
                        )}
                    </Button>

                    {isActive && (
                        <Check className="size-4 text-green-400" />
                    )}
                </div>
            </div>
        </Button>
    );
}

export default WalletAccountItem;