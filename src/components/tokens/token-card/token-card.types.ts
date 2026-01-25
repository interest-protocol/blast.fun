import { Token } from "@/types/token";

export interface TokenCardProps {
    pool: Token | any;
    hasRecentTrade?: boolean;
    column?: 'newlyCreated' | 'nearGraduation' | 'graduated';
}