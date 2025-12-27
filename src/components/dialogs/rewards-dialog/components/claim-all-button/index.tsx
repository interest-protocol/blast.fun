"use client";

import { FC } from "react";

import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RewardsClaimAllButtonProps } from "./claim-all-button.types";

const ClaimAllButton: FC<RewardsClaimAllButtonProps> = ({ hasCoins, isClaimingAll, onClick }) => {
  if (!hasCoins) return null;

  return (
    <div className="flex justify-end mb-4">
      <Button onClick={onClick} disabled={isClaimingAll} className="font-mono uppercase">
        {isClaimingAll ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            Claiming...
          </>
        ) : (
          "Claim Many (max 10 at a time)"
        )}
      </Button>
    </div>
  );
};

export default ClaimAllButton;