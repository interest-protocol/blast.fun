"use client";

import Link from "next/link";
import { FC, useState } from "react";
import { Settings } from "lucide-react";

import { ThemeSwitcher } from "../../shared/theme-switcher";
import { TradeSettings } from "@/app/(root)/token/[coinType]/_components/trade-settings";
import { Button } from "../../ui/button";
import { Skeleton } from "../../ui/skeleton";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "../../ui/tooltip";
import { useBtcPrice } from "@/hooks/use-btc-price";
import { useSuiPrice } from "@/hooks/sui/use-sui-price";
import SwapTerminal from "../../swap-terminal";
import { socialLinks } from "./footer.data";
import { AudioToggle } from "@/components/audio/audio-toggle";

const Footer: FC = () => {
    const [tradeSettingsOpen, setTradeSettingsOpen] = useState(false);
    const btcPrice = useBtcPrice();
    const suiPrice = useSuiPrice();

    return (
        <>
            <div className="hidden lg:block fixed bottom-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-xl border-t">
                <div className="h-12 px-3 flex items-center justify-between">
                    <TooltipProvider>
                        <div className="flex items-center gap-2">
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <button className="text-[#F7931A] flex flex-row h-6 gap-1 items-center 
                                    hover:brightness-110 transition-all duration-125">
                                        <img
                                            src="/assets/currency/btc-fill.svg"
                                            alt="BTC"
                                            width={16}
                                            height={16}
                                            className="flex-shrink-0"
                                        />
                                        {btcPrice.loading ? (
                                            <Skeleton className="h-3 w-14" />
                                        ) : (
                                            <span className="text-xs font-mono">{`$${(
                                                btcPrice.usd / 1000
                                            ).toFixed(1)}K`}</span>
                                        )}
                                    </button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p className="font-mono uppercase">
                                        Price of Bitcoin in USD
                                    </p>
                                </TooltipContent>
                            </Tooltip>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <button className="text-[#6FBCF0] flex flex-row h-6 gap-1 items-center
                                     hover:brightness-110 transition-all duration-125">
                                        <img
                                            src="/assets/currency/sui-fill.svg"
                                            alt="SUI"
                                            width={16}
                                            height={16}
                                            className="flex-shrink-0"
                                        />
                                        {suiPrice.loading ? (
                                            <Skeleton className="h-3 w-12" />
                                        ) : (
                                            <span className="text-xs font-mono">{`$${suiPrice.usd.toFixed(
                                                2
                                            )}`}</span>
                                        )}
                                    </button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p className="font-mono uppercase">
                                        Price of SUI in USD
                                    </p>
                                </TooltipContent>
                            </Tooltip>
                        </div>
                    </TooltipProvider>

                    <div className="flex items-center gap-1">
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="size-8 rounded-lg text-muted-foreground hover:bg-destructive/10
                                     hover:text-destructive transition-all"
                                    onClick={() => setTradeSettingsOpen(true)}
                                >
                                    <Settings className="size-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p className="font-mono uppercase">
                                    Trade Settings
                                </p>
                            </TooltipContent>
                        </Tooltip>

                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div>
                                    <AudioToggle />
                                </div>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p className="font-mono uppercase">
                                    Audio Settings
                                </p>
                            </TooltipContent>
                        </Tooltip>

                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div>
                                    <ThemeSwitcher />
                                </div>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p className="font-mono uppercase">
                                    Customize Theme
                                </p>
                            </TooltipContent>
                        </Tooltip>
                        <div className="hidden md:block w-px h-5 bg-border/30 mx-1" />

                        <div className="hidden md:flex items-center gap-1">
                            {socialLinks.map((link) => (
                                <Tooltip key={link.label}>
                                    <TooltipTrigger asChild>
                                        <Link
                                            href={link.href}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center justify-center h-8 w-8 rounded-lg
                                             text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all"
                                        >
                                            <link.icon className="size-3.5" />
                                        </Link>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p className="font-mono uppercase">
                                            {link.label}
                                        </p>
                                    </TooltipContent>
                                </Tooltip>
                            ))}
                            <SwapTerminal />
                        </div>
                    </div>
                </div>
            </div>

            <TradeSettings
                open={tradeSettingsOpen}
                onOpenChange={setTradeSettingsOpen}
            />
        </>
    );
}

export default Footer;
