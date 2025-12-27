"use client";

import { FC } from "react";

import Table from "./components/table";
import ClaimAllButton from "./components/claim-all-button";
import { RewardsDialogProps } from "./rewards-dialog.types";
import { useRewardsDialog } from "./_hooks/use-rewards-dialog";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import RewardsDialogHeader from "./components/rewards-dialog-header";

const RewardsDialog: FC<RewardsDialogProps> = ({ open, onOpenChange }) => {
    const { walletCoins, isLoading, claimingCoinType, handleClaim, handleClaimAll } =
        useRewardsDialog(open);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-auto">
                <RewardsDialogHeader />
                <div className="mt-4">
                    <ClaimAllButton
                        hasCoins={walletCoins.length > 0}
                        isClaimingAll={claimingCoinType === "all"}
                        onClick={handleClaimAll}
                    />
                    <div className="rounded-lg border border-border bg-card overflow-hidden">
                        <Table
                            coins={walletCoins}
                            isLoading={isLoading}
                            claimingCoinType={claimingCoinType}
                            onClaim={handleClaim}
                        />
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default RewardsDialog;