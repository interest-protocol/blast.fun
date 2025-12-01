import { FC } from "react"
import { Loader2 } from "lucide-react"

const LoadingPortfolio: FC = () => (
    <div className="container max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <p className="mt-4 font-mono text-sm uppercase tracking-wider text-muted-foreground">
                LOADING PORTFOLIO
            </p>
            <p className="font-mono text-xs uppercase text-muted-foreground/60 mt-2">
                FETCHING YOUR HOLDINGS
            </p>
        </div>
    </div>
)

export default LoadingPortfolio
