import { FC } from "react"
import { Loader2 } from "lucide-react"

const LoadingState: FC = () => (
    <div className="flex items-center justify-center py-32">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
)

export default LoadingState