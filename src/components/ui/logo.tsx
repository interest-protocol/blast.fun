import { cn } from "@/utils"

interface LogoProps {
	className?: string
}

export function Logo({ className }: LogoProps) {
	return (
		<svg
			className={cn("text-foreground/80 transition-all duration-300 fill-current", className)}
			xmlns="http://www.w3.org/2000/svg"
			viewBox="150 150 500 500"
		>
			<path d="M500.85,318.96v-41.22h-201.03v41.22h-40.66v162.64h41.79v81.88h38.4v-41.22h40.66v41.22h40.65v-40.66h41.23v40.66h37.27v-81.88h41.22v-162.64h-39.53ZM380.57,439.24h-78.49v-78.49h78.49v78.49ZM499.72,439.24h-79.62v-78.49h79.62v78.49Z" />
			<rect fill="#df0e27" x="341.32" y="400" width="21.18" height="20.61" />
			<rect fill="#df0e27" x="440.99" y="400" width="21.46" height="20.61" />
			<polygon points="217.81 195.29 260.16 195.29 260.16 277.74 177.71 277.74 177.71 236.52 218.94 236.52 217.81 195.29" />
			<polygon points="216.81 603.48 259.16 603.48 259.16 521.04 176.71 521.04 176.71 562.26 217.94 562.26 216.81 603.48" />
			<polygon points="582.26 604.71 539.91 604.71 539.91 522.26 622.36 522.26 622.36 563.48 581.13 563.48 582.26 604.71" />
			<polygon points="583.19 195.29 540.84 195.29 540.84 277.74 623.29 277.74 623.29 236.52 582.06 236.52 583.19 195.29" />
		</svg>
	)
}