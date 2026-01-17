import { FC } from "react"

import { Logo } from "@/components/ui/logo"

import { ErrorPortfolioProps } from "./error-portfolio.types"

export const ErrorPortfolio: FC<ErrorPortfolioProps> = ({ error }) => (
    <div className="container max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <Logo className="w-12 h-12 mx-auto mb-4 text-destructive/20" />
            <p className="font-mono text-sm uppercase tracking-wider text-destructive">
                ERROR LOADING PORTFOLIO
            </p>
            <p className="font-mono text-xs uppercase text-muted-foreground/60 mt-2">
                {error}
            </p>
        </div>
    </div>
)
