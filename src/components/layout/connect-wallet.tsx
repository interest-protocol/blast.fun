"use client"

import { Button } from "@/components/ui/button"
import { Logo } from "@/components/ui/logo"

interface ConnectWalletProps {
    title?: string
    subtitle?: string
    buttonText?: string
    onConnect: () => void
    className?: string
}

export default function ConnectWallet({
    title = "WALLET NOT CONNECTED",
    subtitle,
    buttonText = "CONNECT WALLET",
    onConnect,
    className = "container max-w-6xl mx-auto px-4 py-8"
}: ConnectWalletProps) {
    return (
        <div className={className}>
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <Logo className="w-12 h-12 mx-auto mb-4 text-foreground/20" />

                <p className="font-mono text-sm uppercase tracking-wider text-muted-foreground">
                    {title}
                </p>

                {subtitle && (
                    <p className="font-mono text-xs uppercase text-muted-foreground/60 mt-2">
                        {subtitle}
                    </p>
                )}

                <Button
                    variant="outline"
                    onClick={onConnect}
                    className="font-mono uppercase tracking-wider mt-6"
                >
                    {buttonText}
                </Button>
            </div>
        </div>
    )
}
