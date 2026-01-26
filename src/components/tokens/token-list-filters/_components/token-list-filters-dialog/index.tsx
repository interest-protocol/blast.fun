import { FC } from "react"

import {
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { TokenListFiltersDialogProps } from "./token-list-filters-dialog.types"
import TabTypeSelector from "../tab-type-selector";
import SortBySelector from "../sort-by-selector";
import BondingProgressInputs from "../bonding-progress-inputs";
import FilterModeToggle from "../filter-mode-toggle";
import { AuditFilters } from "@/components/tokens/filter-components/audit-filters";
import { MetricsFilters } from "@/components/tokens/filter-components/metrics-filters";
import FilterActions from "../filter-actions";

const TokenListFiltersDialog: FC<TokenListFiltersDialogProps> = ({
    tabType, setTabType,
    sortBy, setSortBy,
    filters, setFilters,
    selectedSubMenu, setSelectedSubMenu,
    onApply, onReset,
    defaultTab
}) => {
    return (
        <DialogContent className="sm:max-w-[450px] max-h-[80vh] p-0 rounded-xl border-2 bg-background shadow-2xl overflow-hidden flex flex-col">
            <DialogHeader className="pb-4 px-6 pt-6 flex-shrink-0">
                <DialogTitle className="font-mono text-base uppercase tracking-wider text-foreground/80">
                    Token Filters
                </DialogTitle>
            </DialogHeader>

            <div className="space-y-5 px-6 pb-6 overflow-y-auto flex-1">
                <TabTypeSelector value={tabType} onChange={setTabType} />

                <SortBySelector value={sortBy} onChange={setSortBy} />

                {tabType !== 'bonded' && (
                    <BondingProgressInputs
                        min={filters.bondingProgressMin}
                        max={filters.bondingProgressMax}
                        onChangeMin={(v) => setFilters(p => ({ ...p, bondingProgressMin: v }))}
                        onChangeMax={(v) => setFilters(p => ({ ...p, bondingProgressMax: v }))}
                    />
                )}

                <div>
                    <FilterModeToggle
                        value={selectedSubMenu}
                        onChange={setSelectedSubMenu}
                    />

                    <div className="rounded-lg p-4 border-2 border-dashed mt-4">
                        {selectedSubMenu === 'audit' ? (
                            <AuditFilters
                                createdAtMin={filters.ageMin}
                                createdAtMax={filters.ageMax}
                                setCreatedAtMin={(v) => setFilters(p => ({ ...p, ageMin: v }))}
                                setCreatedAtMax={(v) => setFilters(p => ({ ...p, ageMax: v }))}
                                top10HoldingsMin={filters.top10HoldingsMin}
                                top10HoldingsMax={filters.top10HoldingsMax}
                                setTop10HoldingsMin={(v) => setFilters(p => ({ ...p, top10HoldingsMin: v }))}
                                setTop10HoldingsMax={(v) => setFilters(p => ({ ...p, top10HoldingsMax: v }))}
                                devHoldingsMin={filters.devHoldingsMin}
                                devHoldingsMax={filters.devHoldingsMax}
                                setDevHoldingsMin={(v) => setFilters(p => ({ ...p, devHoldingsMin: v }))}
                                setDevHoldingsMax={(v) => setFilters(p => ({ ...p, devHoldingsMax: v }))}
                                holdersCountMin={filters.holdersCountMin}
                                holdersCountMax={filters.holdersCountMax}
                                setHoldersCountMin={(v) => setFilters(p => ({ ...p, holdersCountMin: v }))}
                                setHoldersCountMax={(v) => setFilters(p => ({ ...p, holdersCountMax: v }))}
                            />
                        ) : (
                            <MetricsFilters
                                marketCapMin={filters.marketCapMin}
                                marketCapMax={filters.marketCapMax}
                                setMarketCapMin={(v) => setFilters(p => ({ ...p, marketCapMin: v }))}
                                setMarketCapMax={(v) => setFilters(p => ({ ...p, marketCapMax: v }))}
                                volumeMin={filters.volumeMin}
                                volumeMax={filters.volumeMax}
                                setVolumeMin={(v) => setFilters(p => ({ ...p, volumeMin: v }))}
                                setVolumeMax={(v) => setFilters(p => ({ ...p, volumeMax: v }))}
                                liquidityMin={filters.liquidityMin}
                                liquidityMax={filters.liquidityMax}
                                setLiquidityMin={(v) => setFilters(p => ({ ...p, liquidityMin: v }))}
                                setLiquidityMax={(v) => setFilters(p => ({ ...p, liquidityMax: v }))}
                                tradeCountMin={filters.tradeCountMin}
                                tradeCountMax={filters.tradeCountMax}
                                setTradeCountMin={(v) => setFilters(p => ({ ...p, tradeCountMin: v }))}
                                setTradeCountMax={(v) => setFilters(p => ({ ...p, tradeCountMax: v }))}
                            />
                        )}
                    </div>
                </div>
            </div>

            <FilterActions onReset={onReset} onApply={onApply} />
        </DialogContent>
    );
}

export default TokenListFiltersDialog;