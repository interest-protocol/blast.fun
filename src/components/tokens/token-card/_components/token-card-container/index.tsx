import { FC } from "react"

import { TokenCardContainerProps } from "./token-card-container.types"

const TokenCardContainer:FC<TokenCardContainerProps> = ({ children, hasRecentTrade }) => {
  return (
    <div
      className={`group relative overflow-hidden border-border/40 border-b transition-all duration-300 hover:bg-accent/15 ${
        hasRecentTrade ? "animate-shake" : ""
      }`}
    >
      {children}
    </div>
  );
}

export default TokenCardContainer;