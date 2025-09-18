"use client"

import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { useMounted } from "@/hooks/use-mounted"
import { Button } from "../ui/button"

export const ThemeSwitcher = () => {
	const { theme, setTheme } = useTheme()

	const isMounted = useMounted()
	if (!isMounted) return null

	return (
		<Button
			size="icon"
			variant="ghost"
			onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
			className="size-8 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all"
		>
			{theme === "light" ? <Moon className="size-4" /> : <Sun className="size-4" />}
		</Button>
	)
}
