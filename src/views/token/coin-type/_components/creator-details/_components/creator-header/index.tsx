import { FC } from "react"

import { BsTwitterX } from "react-icons/bs"
import { ExternalLink } from "lucide-react"
import { CreatorHeaderProps } from "./creator-header.types"

const CreatorHeader: FC<CreatorHeaderProps> = ({
  creatorTwitterHandle,
  creatorTwitterId,
  creatorWallet,
  showTwitterCreator,
  displayName,
}) => (
  <div className="flex items-center justify-between mb-3">
    <div className="flex flex-col gap-0.5">
      <p className="font-mono font-medium text-[10px] uppercase tracking-wider text-muted-foreground">
        Created by
      </p>
      <div className="flex items-center gap-1.5">
        <span className="font-mono text-sm font-bold text-foreground">
          {displayName}
        </span>
        {showTwitterCreator && (
          <a
            href={creatorTwitterId ? `https://x.com/i/user/${creatorTwitterId}` : `https://x.com/${creatorTwitterHandle}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <BsTwitterX className="h-3.5 w-3.5" />
          </a>
        )}
        {creatorWallet && (
          <a
            href={`https://suiscan.xyz/mainnet/account/${creatorWallet}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        )}
      </div>
    </div>
  </div>
);

export default CreatorHeader;