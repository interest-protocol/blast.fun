import { FC } from "react"
import { ExternalLink } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { TokenInfoProps } from "./token-info.types"

const TokenInfo: FC<TokenInfoProps> = ({ metadata, coinType, refCode }) => {
    const openUrl = () => {
        const url = refCode
            ? `${window.location.origin}/token/${coinType}?ref=${refCode}`
            : `${window.location.origin}/token/${coinType}`

        window.open(url, "_blank")
    }

    return (
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
                <Avatar className="w-9 h-9 rounded-lg border-2">
                    <AvatarImage src={metadata?.icon_url || ""} alt={metadata?.symbol} />
                    <AvatarFallback className="font-mono rounded-none text-xs uppercase">
                        {metadata?.symbol?.slice(0, 2) || "??"}
                    </AvatarFallback>
                </Avatar>

                <div className="flex flex-col">
                    <h1 className="font-mono text-xs font-bold uppercase">
                        {metadata?.name || "[UNNAMED]"}
                    </h1>
                    <p className="font-mono text-[10px] text-muted-foreground">
                        {metadata?.symbol || "[???]"}
                    </p>
                </div>
            </div>

            <Button
                variant="outline"
                size="sm"
                className="font-mono text-xs h-7"
                onClick={openUrl}
            >
                <ExternalLink className="w-3 h-3 mr-1" />
                VIEW ON BLAST
            </Button>
        </div>
    )
}

export default TokenInfo