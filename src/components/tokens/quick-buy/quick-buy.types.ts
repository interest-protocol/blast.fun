import { Token } from "@/types/token"

export interface QuickBuyProps {
    pool: Token;
    className?: string;
    column?: 'newlyCreated' | 'nearGraduation' | 'graduated';
}