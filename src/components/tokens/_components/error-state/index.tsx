import { FC, memo } from "react";

import { Logo } from "@/components/ui/logo";
import { ErrorStateProps } from "./error-state.types";

export const ErrorState: FC<ErrorStateProps> = memo(({ message }) => (
    <div className="p-8 text-center">
        <Logo className="w-8 h-8 mx-auto text-destructive mb-2" />
        <p className="font-mono text-xs uppercase text-destructive">
            {message || "ERROR::LOADING::GRADUATED"}
        </p>
    </div>
));
ErrorState.displayName = "ErrorState";