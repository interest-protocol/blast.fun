import { FC } from "react"
import { EmbedHeader } from "./embed-header"
import { Logo } from "@/components/ui/logo"

const TokenNotFound: FC = () => (
    <div className="bg-background flex flex-col">
        <EmbedHeader />
        <div className="flex-1 flex items-center justify-center p-4">
            <div className="text-center max-w-sm">
                <Logo className="w-12 h-12 mx-auto mb-4 text-foreground/20" />
                <h1 className="font-mono text-lg uppercase tracking-wider text-foreground/80 mb-2">
                    TOKEN::NOT_FOUND
                </h1>
                <p className="font-mono text-xs uppercase text-muted-foreground mb-4">
                    The token you&apos;re looking for doesn&apos;t exist or has disappeared!
                </p>
                <button
                    onClick={() => window.open(`${window.location.origin}`, "_blank")}
                    className="mt-6 px-4 py-2 font-mono text-xs uppercase tracking-wider border border-foreground/20 rounded hover:bg-foreground/10 transition-colors"
                >
                    BROWSE::TOKENS
                </button>
            </div>
        </div>
    </div>
)

export default TokenNotFound
