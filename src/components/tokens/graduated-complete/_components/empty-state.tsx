import { memo } from "react";
import { Logo } from "@/components/ui/logo";

const EmptyState = memo(() => (
    <div className="p-8 text-center">
        <Logo className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
        <p className="font-mono text-xs uppercase text-muted-foreground">
            NO::GRADUATED::TOKENS
        </p>
    </div>
));
EmptyState.displayName = "EmptyState";