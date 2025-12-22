import { TokenCreator } from "@/types/token";

export interface CreatorHoverCardProps {
	twitterHandle?: string;
	twitterId?: string;
	walletAddress?: string;
	children: React.ReactNode;
	className?: string;
	data?: TokenCreator;
}