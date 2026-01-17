"use client"

import  { FC } from "react"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { TokenSelectionDialog } from "@/components/shared/token-selection-dialog"
import { AirdropConfigProps } from "./airdrop-config.types"

const AirdropConfig: FC<AirdropConfigProps> = ({
  coins,
  isLoadingCoins,
  selectedCoin,
  onSelectCoin,
  csvInput,
  onChangeCsv,
  linesCount,
}) => {
  return (
    <div className="border-2 shadow-lg rounded-xl">
      <div className="p-4 border-b">
        <h3 className="font-mono text-lg uppercase tracking-wider text-foreground/80">AIRDROP CONFIGURATION</h3>
      </div>

      <div className="p-4 space-y-6">
        <div className="space-y-2">
          <Label className="font-mono text-xs uppercase tracking-wider text-muted-foreground">SELECT TOKEN</Label>
          <TokenSelectionDialog
            coins={coins}
            selectedCoin={selectedCoin}
            onSelectCoin={onSelectCoin}
            isLoading={isLoadingCoins}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="csv-input" className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
            RECIPIENTS DATA
          </Label>
          <div className="relative">
            <Textarea
              id="csv-input"
              placeholder={`0x123...abc,100\nalice.sui,200\n@bob,300`}
              className="min-h-[200px] max-h-[600px] font-mono text-sm bg-background/50 border-2 placeholder:text-muted-foreground/40 resize-none overflow-y-auto"
              value={csvInput}
              onChange={(e) => onChangeCsv(e.target.value)}
            />
            {csvInput && (
              <div className="absolute top-2 right-6 select-none">
                <span className="px-2 py-1 bg-background/80 rounded text-xs font-mono uppercase text-muted-foreground">
                  {linesCount} LINES
                </span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 pt-2">
            <div className="space-y-1">
              <p className="font-mono text-xs uppercase text-foreground/80">FORMAT</p>
              <p className="font-mono text-xs text-muted-foreground/60">ADDRESS,AMOUNT</p>
            </div>
            <div className="space-y-1">
              <p className="font-mono text-xs uppercase text-foreground/80">SUPPORTS</p>
              <p className="font-mono text-xs text-muted-foreground/60">SUINS & @HANDLES</p>
            </div>
            <div className="space-y-1">
              <p className="font-mono text-xs uppercase text-foreground/80">STATUS</p>
              <p className="font-mono text-xs text-muted-foreground/60">AWAITING INPUT</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AirdropConfig
