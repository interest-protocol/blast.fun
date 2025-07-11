"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "../ui/button";
import { useMounted } from "@/hooks/use-mounted";

export const ThemeSwitcher = () => {
    const { theme, setTheme } = useTheme();

    const isMounted = useMounted();
    if (!isMounted) return null;

    return (
        <Button
            size="icon"
            variant="outline"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="rounded-xl ease-in-out duration-300 transition-all"
        >
            {theme === "light" ? (
                <Moon className="h-6 w-6" />
            ) : (
                <Sun className="h-6 w-6" />
            )}
        </Button>
    );
};