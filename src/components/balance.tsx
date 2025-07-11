import useBalance from "@/hooks/use-balance";
import { Badge } from "./ui/badge";

const Balance = () => {
    const { balance } = useBalance({ autoRefetch: true });

    if (balance == null) {
        return <></>;
    }

    return (
        <Badge variant="default" className="rounded-sm text-sm font-semibold">
            {balance} SUI
        </Badge>
    );
};

export default Balance;
