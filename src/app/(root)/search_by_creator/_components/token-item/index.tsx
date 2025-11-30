import { FC } from "react";
import Link from "next/link";

import { TokenItemProps } from "./token-item.types";

const TokenItem: FC<TokenItemProps> = ({ token }) => {
  return (
    <Link
      href={`/token/${token.coinType}`}
      className="block p-4 hover:bg-muted/5 transition-colors"
      target="_blank"
    >
      <div className="flex items-center gap-4">

        {token.iconUrl ? (
          <img
            src={token.iconUrl}
            alt={token.name || token.symbol || ""}
            className="w-12 h-12 rounded-full"
            onError={(e) => (e.currentTarget.src = "/placeholder-token.png")}
          />
        ) : (
          <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center">
            <span className="text-xs font-mono text-muted-foreground">
              {token.symbol?.slice(0, 2) ?? "??"}
            </span>
          </div>
        )}

        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-mono font-bold text-sm">{token.name ?? "Unknown Token"}</h3>
            <span className="font-mono text-xs text-muted-foreground">
              ${token.symbol ?? "???"}
            </span>
          </div>

          {token.description && (
            <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
              {token.description}
            </p>
          )}

          <p className="font-mono text-xs text-muted-foreground/60 mt-1">
            Pool: {token.poolObjectId.slice(0, 10)}...
          </p>
        </div>
      </div>
    </Link>
  );
}

export default TokenItem;