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
			className="h-8 w-8 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all"
		>
			{theme === "light" ? <Moon className="h-3.5 w-3.5" /> : <Sun className="h-3.5 w-3.5" />}
		</Button>
	)
}
