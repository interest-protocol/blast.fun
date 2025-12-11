import { FC } from "react"
import { TrendingUp, ChartLine } from "lucide-react"

import { cn } from "@/utils"
import { FooterTabsProps } from "./footer-tabs.types"

const FooterTabs:FC<FooterTabsProps> = ({ activeTab, setActiveTab }) =>{
    return (
        <div className="flex gap-2">
            <button
                onClick={() => setActiveTab("trade")}
                className={cn(
                    "flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg font-mono text-xs uppercase transition-all",
                    activeTab === "trade"
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
            >
                <TrendingUp className="w-3.5 h-3.5" />
                Trade
            </button>

            <button
                onClick={() => setActiveTab("chart")}
                className={cn(
                    "flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg font-mono text-xs uppercase transition-all",
                    activeTab === "chart"
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
            >
                <ChartLine className="w-3.5 h-3.5" />
                Chart
            </button>
        </div>
    )
}

export default FooterTabs
