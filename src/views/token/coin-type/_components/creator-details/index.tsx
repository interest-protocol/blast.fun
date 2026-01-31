import { formatAddress } from "@mysten/sui/utils";
import { useResolveSuiNSName } from "@mysten/dapp-kit";

import { CreatorDetailsProps } from "./creator-details.types";
import CreatorHeader from "./_components/creator-header";
import CreatorStats from "./_components/creator-stats";

const CreatorDetails = ({ pool }: CreatorDetailsProps) => {
    const creatorTwitterHandle = pool.creator?.twitterHandle;
    const creatorTwitterId = pool.creator?.twitterId;
    const creatorWallet = pool.creator?.address;
    const showTwitterCreator = !!creatorTwitterHandle;
    const data = pool.creator;

    const { data: resolvedDomain } = useResolveSuiNSName(!showTwitterCreator && creatorWallet ? creatorWallet : null);

    const displayName = showTwitterCreator
        ? `@${creatorTwitterHandle}`
        : resolvedDomain
            ? resolvedDomain
            : formatAddress(creatorWallet || "");

    return (
        <div className="border-b border-border">
            <div className="p-3">
                <CreatorHeader
                    displayName={displayName}
                    creatorWallet={creatorWallet}
                    creatorTwitterId={creatorTwitterId!}
                    showTwitterCreator={showTwitterCreator}
                    creatorTwitterHandle={creatorTwitterHandle!}
                />
                <CreatorStats data={data} />
            </div>
        </div>
    );
}

export default CreatorDetails;