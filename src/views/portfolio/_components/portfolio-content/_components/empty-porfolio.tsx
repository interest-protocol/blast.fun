import { FC } from "react"
import { Logo } from "@/components/ui/logo"

const EmptyPortfolio: FC = () => (
    <div className="flex flex-col items-center justify-center py-16 border-2 border-dashed border-border/50 rounded-lg bg-background/50 backdrop-blur-sm">
        <Logo className="w-12 h-12 mx-auto mb-4 text-foreground/20" />
        <p className="font-mono text-sm uppercase tracking-wider text-muted-foreground">
            NO HOLDINGS DETECTED
        </p>
        <p className="font-mono text-xs uppercase text-muted-foreground/60 mt-2">
            START TRADING TO BUILD YOUR PORTFOLIO
        </p>
    </div>
)

export default EmptyPortfolio
