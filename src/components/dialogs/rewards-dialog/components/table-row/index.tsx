"use client";

import { FC } from "react";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { TableRowProps } from "./table-row.types";
import { formatNumberWithSuffix } from "@/utils/format";

const TableRow: FC<TableRowProps> = ({ coin, isClaiming, onClaim }) => (
  <tr className="border-b border-border hover:bg-muted/30 transition-colors">
    <td className="p-4">
      <div className="flex items-center gap-3">
        {coin.iconUrl ? (
          <img
            src={coin.iconUrl}
            alt={coin.symbol}
            className="h-8 w-8 rounded-full"
            onError={(e) => ((e.target as HTMLImageElement).style.display = "none")}
          />
        ) : (
          <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
            <span className="text-xs font-mono uppercase">{coin.symbol?.slice(0, 2)}</span>
          </div>
        )}
        <div>
          <div className="font-mono text-sm font-medium">{coin.symbol}</div>
          <div className="text-xs text-muted-foreground">{coin.name}</div>
        </div>
      </div>
    </td>
    <td className="p-4 text-right">
      <span className="font-mono text-sm">
        {formatNumberWithSuffix(parseFloat(coin.balance) / Math.pow(10, coin.decimals))}
      </span>
    </td>
    <td className="p-4 text-right">
      <span className="font-mono text-sm">
        {coin.value && coin.value > 0 ? `$${formatNumberWithSuffix(coin.value)}` : "-"}
      </span>
    </td>
    <td className="p-4 text-center">
      <Button size="sm" onClick={onClaim} disabled={isClaiming} className="font-mono uppercase">
        {isClaiming ? <Loader2 className="h-4 w-4 animate-spin" /> : "Claim"}
      </Button>
    </td>
  </tr>
);

export default TableRow;