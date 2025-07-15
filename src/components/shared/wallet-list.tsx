"use client";

import Image from "next/image";
import type { WalletWithRequiredFeatures } from "@mysten/wallet-standard";
import { useWallets } from "@mysten/dapp-kit";
import { ChevronRight } from "lucide-react";
import { Button } from "../ui/button";
import { Skeleton } from "../ui/skeleton";
import { getWalletUniqueIdentifier } from "@/utils/wallet";
import { useMounted } from "@/hooks/use-mounted";

type WalletListProps = {
    onSelect: (wallet: WalletWithRequiredFeatures) => Promise<void>;
    isConnecting?: boolean;
};

export function WalletList({
    onSelect,
    isConnecting = false,
}: WalletListProps) {
    const wallets = useWallets();
    const isMounted = useMounted();

    if (!isMounted) {
        return (
            <div className="flex flex-col gap-2">
                {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="h-16 w-full rounded-lg border border-border p-5 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Skeleton className="h-10 w-10 rounded-lg" />
                            <Skeleton className="h-4 w-24" />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="w-full flex flex-col gap-2">
            {wallets.length > 0 &&
                wallets.map((wallet) => (
                    <Button
                        key={getWalletUniqueIdentifier(wallet)}
                        onClick={() => onSelect(wallet)}
                        variant="outline"
                        disabled={isConnecting}
                        className="h-16 w-full justify-between px-5 ease-in-out duration-300 rounded-lg text-base"
                    >
                        <div className="flex items-center gap-3">
                            {wallet.icon && typeof wallet.icon === "string" ? (
                                <div className="h-10 w-10 rounded-lg overflow-hidden bg-background flex items-center justify-center shadow-sm border border-border/50">
                                    <Image
                                        src={wallet.icon}
                                        alt={wallet.name}
                                        width={32}
                                        height={32}
                                        className="rounded-md"
                                    />
                                </div>
                            ) : (
                                wallet.icon
                            )}

                            <div className="flex flex-col items-start">
                                <span className="font-semibold text-base">
                                    {wallet.name}
                                </span>
                            </div>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-accent transition-colors" />
                    </Button>
                ))}
        </div>
    );
}
