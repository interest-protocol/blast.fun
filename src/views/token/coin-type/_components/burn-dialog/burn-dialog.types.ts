import { Token } from "@/types/token";

export interface BurnDialogProps {
    pool: Token;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}