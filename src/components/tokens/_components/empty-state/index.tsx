import { FC, memo } from "react";

import { Logo } from "@/components/ui/logo";
import { EmptyStateProps } from "./empty-state.types";

export const EmptyState:FC<EmptyStateProps> = memo(({message}) => (
    <div className="p-8 text-center">
        <Logo className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
        <p className="font-mono text-xs uppercase text-muted-foreground">
            {message}
        </p>
    </div>
));
EmptyState.displayName = "EmptyState";