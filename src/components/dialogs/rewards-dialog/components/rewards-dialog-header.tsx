import { FC } from "react";
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";

const RewardsDialogHeader: FC = () => (
    <DialogHeader>
        <DialogTitle className="font-mono text-xl font-bold uppercase tracking-wider">
            Referral Rewards
        </DialogTitle>
    </DialogHeader>
);

export default RewardsDialogHeader;