import { FC, memo } from "react";

import { cn } from "@/utils";
import { ScrollArea } from "@/components/ui/scroll-area";

import { TokenListLayoutProps } from "./token-list-layout.types";
import { textGlowStyles } from "./token-list-layout.data";

const TokenListLayout:FC<TokenListLayoutProps> = memo(function TokenListLayout({
	title,
	children,
	className,
	headerClassName,
	scrollClassName,
	glowColor = "blue",
	headerAction
}) {

	return (
		<div className={cn("bg-card/20 border border-border/50 rounded-xl flex flex-col min-h-0 overflow-hidden", className)}>
			<div className={cn("px-4 py-3 border-b border-border/50 flex-shrink-0 flex items-center justify-between", headerClassName)}>
				<h2 className={cn(
					"font-mono text-xs uppercase tracking-wider font-bold",
					textGlowStyles[glowColor]
				)}>
					{title}
				</h2>
				{headerAction && (
					<div className="ml-auto">
						{headerAction}
					</div>
				)}
			</div>
			<ScrollArea className={cn("flex-1 overflow-hidden", scrollClassName)}>
				<div className="divide-y divide-border/30">
					{children}
				</div>
			</ScrollArea>
		</div>
	);
})

export default TokenListLayout;