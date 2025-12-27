import { FC } from "react";

const EmptyState: FC = () => (
    <div className="flex flex-col items-center justify-center py-16">
        <p className="text-sm font-mono text-muted-foreground uppercase">No rewards available</p>
    </div>
);

export default EmptyState;