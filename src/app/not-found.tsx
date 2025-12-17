import { FC } from "react"
import Link from "next/link"

import { cn } from "@/utils"
import { buttonVariants } from "@/components/ui/button"

const NotFound: FC = () => {
	return (
		<div className="h-screen mx-auto flex flex-col items-center justify-center space-y-8 p-6">
			<div className="flex flex-col items-center">
				<h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">404</h1>
				<p className="max-w-[600px] text-center text-muted-foreground md:text-xl">
					Oops! The page you&apos;re looking for doesn&apos;t exist or has been moved.
				</p>
			</div>

			<Link href="/" className={cn(buttonVariants({ variant: "default" }), "w-fit justify-start")}>
				<div className="flex items-center">Go Home</div>
			</Link>
		</div>
	);
}

export default NotFound;