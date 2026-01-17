'use client';

import { FC } from "react"

import { Loader2 } from "lucide-react"
import { useFarms } from "./_hooks/use-farms";
import FarmsHeader from "./_components/farms-header";
import EmptyFarm from "./_components/empty-farm";
import FarmRow from "./_components/farm-row";


const FarmsContent: FC = () => {
  const { farmsWithAccounts, isLoading } = useFarms()

  const hasFarms = farmsWithAccounts.length > 0

  return (
    <div className="container max-w-7xl mx-auto px-3 md:px-4 py-4 md:py-8">
      <div className="space-y-4 md:space-y-6">
        <FarmsHeader />
        {isLoading && (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        )}
        {!isLoading && !hasFarms && (
          <EmptyFarm />
        )}
        {!isLoading && hasFarms && (
          <div className="flex-1 overflow-y-auto space-y-3 md:space-y-4 pr-1 md:pr-2">
            {farmsWithAccounts.map(({ farm, account }) => (
              <FarmRow key={farm.objectId} farm={farm} account={account} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default FarmsContent
