import { FC, memo } from "react";
import { Globe, Send } from "lucide-react";

import { BsTwitterX } from "react-icons/bs";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

import { TokenSocialsProps } from "./token-socials.types"

const TokenSocials: FC<TokenSocialsProps> = memo(function TokenSocials({
    twitter,
    telegram,
    website
}) {
    const socialLinks = [
        { href: twitter, icon: BsTwitterX, tooltip: "X" },
        { href: telegram, icon: Send, tooltip: "TELEGRAM" },
        { href: website, icon: Globe, tooltip: "WEBSITE" },
    ].filter((link) => link.href)

    if (socialLinks.length === 0) return null;

    return (
        <>
            <span className="text-muted-foreground/40 hidden sm:inline">·</span>
            <div className="flex items-center gap-1">
                {socialLinks.map((link, index) => {
                    const Icon = link.icon
                    return (
                        <Tooltip key={index}>
                            <TooltipTrigger asChild>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        e.preventDefault()
                                        window.open(link.href, "_blank", "noopener,noreferrer")
                                    }}
                                    className="text-muted-foreground/60 hover:text-foreground/80 transition-all p-0.5 hover:bg-accent/20 rounded-md"
                                >
                                    <Icon className="size-3" />
                                </button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p className="text-xs font-mono uppercase">{link.tooltip}</p>
                            </TooltipContent>
                        </Tooltip>
                    )
                })}
            </div>
        </>
    );
})

export default TokenSocials;