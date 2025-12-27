"use client"

import { FC } from "react";
import { Loader2 } from "lucide-react";

const LoadingState: FC = () => (
    <div className="flex flex-col items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <p className="mt-3 text-sm font-mono text-muted-foreground">Loading wallet rewards...</p>
    </div>
);

export default LoadingState;