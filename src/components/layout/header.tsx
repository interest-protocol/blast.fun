"use client";

import Link from "next/link";
import { ThemeSwitcher } from "../shared/theme-switcher";
import { UserDropdown } from "../user/user-dropdown";
import Balance from "../balance";
import { Skull } from "lucide-react";

export default function Header() {

    return (
        <header className="flex h-14 sticky top-0 border-b-2 bg-background/80 backdrop-blur-md z-50">
            <div className="3xl:px-0 top-0 z-[90] mx-auto grid h-12 w-full max-w-9xl shrink-0 grid-cols-2 items-center px-3 md:h-14 md:grid-cols-2">
                <div className="flex items-center gap-2">
                    <Link href="/" className="group flex items-center gap-2">
                        <div className="relative">
                            <Skull className="h-6 w-6 text-muted-foreground group-hover:text-muted-foreground/80 transition-colors duration-300" />
                            <div className="absolute inset-0 bg-primary/15 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        </div>
                        <span className="font-mono font-bold text-xl uppercase tracking-wider group-hover:text-primary/80 transition-colors duration-300 hidden md:inline-block">
                            X::PUMP
                        </span>
                    </Link>
                </div>

                <div className="flex items-center justify-end gap-3">
                    <Balance />
                    <div className="h-6 w-[1px] bg-foreground/20" />
                    <UserDropdown />
                    <div className="h-6 w-[1px] bg-foreground/20" />
                    <ThemeSwitcher />
                </div>
            </div>
        </header>
    );
}