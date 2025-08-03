"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Search } from "lucide-react"
import {
	CommandDialog,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "@/components/ui/command"
import { Button } from "@/components/ui/button"

export function SearchToken() {
	const [open, setOpen] = useState(false)
	const router = useRouter()

	useEffect(() => {
		const down = (e: KeyboardEvent) => {
			if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
				e.preventDefault()
				setOpen((open) => !open)
			}
		}

		document.addEventListener("keydown", down)
		return () => document.removeEventListener("keydown", down)
	}, [])

	return (
		<>
			<Button
				variant="outline"
				className="rounded-xl px-2 h-9 hover:bg-accent/50 transition-all duration-300"
				onClick={() => setOpen(true)}
			>
				<Search className="h-4 w-4 text-muted-foreground" />
				<span className="text-muted-foreground font-semibold text-sm hidden sm:inline-block">
					Search for tokens...
				</span>
				<kbd className="ml-2 hidden lg:inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
					F
				</kbd>
			</Button>

			<CommandDialog
				open={open}
				onOpenChange={setOpen}
				title="Search XCTASY.FUN"
				description="Quickly navigate or search for tokens"
				className="flex max-w-md flex-col gap-0 overflow-hidden p-0 rounded-xl shadow-xl"
				showCloseButton={false}
			>
				<CommandInput
					placeholder="Search tokens, navigate, or run commands..."
					className="h-14 text-sm px-4"
				/>
			</CommandDialog>
		</>
	)
}