"use client";

import { FC } from "react";

import EmptyState from "../empty-state";
import LoadingState from "../loading-state";
import { TableProps } from "./table.types";
import TableRow from "../table-row";

const RewardsTable: FC<TableProps> = ({ coins, isLoading, claimingCoinType, onClaim }) => {
    if (isLoading) return <LoadingState />;
    if (coins.length === 0) return <EmptyState />;

    return (
        <div className="overflow-x-auto">
            <table className="w-full">
                <thead>
                    <tr className="border-b border-border bg-muted/50">
                        <th className="text-left p-4 font-mono text-sm font-medium uppercase text-muted-foreground">
                            Token
                        </th>
                        <th className="text-right p-4 font-mono text-sm font-medium uppercase text-muted-foreground">
                            Balance
                        </th>
                        <th className="text-right p-4 font-mono text-sm font-medium uppercase text-muted-foreground">
                            Value
                        </th>
                        <th className="text-center p-4 font-mono text-sm font-medium uppercase text-muted-foreground">
                            Action
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {coins.map((coin) => (
                        <TableRow
                            key={coin.coinType}
                            coin={coin}
                            isClaiming={claimingCoinType === coin.coinType}
                            onClaim={() => onClaim(coin)}
                        />
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default RewardsTable;