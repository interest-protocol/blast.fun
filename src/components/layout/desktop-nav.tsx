"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/utils";
import { navigationItems } from "@/constants/navigation";

export function DesktopNav() {
    const pathname = usePathname();

    return (
        <nav className="hidden lg:flex items-center gap-1">
            {navigationItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                            "group relative px-4 py-2 font-mono text-sm uppercase tracking-wider transition-all duration-300",
                            "hover:text-primary/80",
                            isActive ? "text-primary" : "text-muted-foreground"
                        )}
                    >
                        <span className="relative z-10 flex items-center gap-2">
                            <item.icon className="h-4 w-4" />
                            {item.label}
                        </span>

                        {/* glow effect */}
                        <div className={cn(
                            "absolute inset-0 bg-primary/10 blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300",
                            isActive && "opacity-50"
                        )} />

                        {isActive && (
                            <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary" />
                        )}
                    </Link>
                );
            })}
        </nav>
    );
}