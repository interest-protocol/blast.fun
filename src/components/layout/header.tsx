"use client";

import Link from "next/link";
import { ThemeSwitcher } from "../shared/theme-switcher";
import { useWallet } from "@/context/wallet.context";
import { UserDropdown } from "../user/user-dropdown";
import Balance from "../balance";

export default function Header() {
    const { isConnected } = useWallet();

    return (
        <header className="flex h-14 sticky top-0 border-b border-border-primary/20 backdrop-blur-sm md:sticky">
            <div className="3xl:px-0 top-0 z-[90] mx-auto grid h-12 w-full max-w-9xl shrink-0 grid-cols-2 items-center px-3 md:h-14 md:grid-cols-2">
                <div className="flex items-center gap-2">
                    <Link href="/" className="flex items-center gap-2">
                        <span className="font-mono font-bold text-2xl hidden md:inline-block">
                            xPump
                        </span>
                    </Link>
                </div>

                <div className="flex items-center justify-end gap-2">
                    <Balance />
                    <UserDropdown />
                    <ThemeSwitcher />
                </div>
            </div>
        </header>
    );
}
