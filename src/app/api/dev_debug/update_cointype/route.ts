import { getFullnodeUrl, SuiClient } from "@mysten/sui/client";

import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
   
    const client = new SuiClient({ url: getFullnodeUrl("mainnet") });

    // Find all TokenLaunches with coinType == ""
    // For each, use their tokenTxHash to get the coinType from the chain, then update the DB


    // Get all TokenLaunches with empty coinType
    const launches = await prisma.tokenLaunches.findMany({
      where: { coinType: "" }
    });

    // N to update is the number of launches with a non-empty tokenTxHash and coinType == ""
    const N = launches.filter(launch => launch.tokenTxHash).length;
    console.log(`N to update: ${N}`);

    const updated: Array<{ id: string; coinType: string }> = [];

    // Filter out launches without tokenTxHash
    const launchesWithTxHash = launches.filter(launch => launch.tokenTxHash);
    
    if (launchesWithTxHash.length === 0) {
      return Response.json({ 
        "success": true,
        "message": "No launches with tokenTxHash found",
        "updated": []
      });
    }

    // Process in batches of 50 to avoid QUERY_MAX_RESULT_LIMIT
    const BATCH_SIZE = 50;
    
    for (let i = 0; i < launchesWithTxHash.length; i += BATCH_SIZE) {
      const batch = launchesWithTxHash.slice(i, i + BATCH_SIZE);
      const txDigests = batch.map(launch => launch.tokenTxHash!);

      try {
        // Use multiGetTransactionBlocks for batch processing
        const transactions = await client.multiGetTransactionBlocks({
          digests: txDigests,
          options: { showObjectChanges: true }
        });

        // Process each transaction and update the database
        await Promise.all(
          transactions.map(async (tx, index) => {
            const launch = batch[index];
            
            if (!tx || tx.digest !== launch.tokenTxHash) {
              console.error(`Transaction mismatch for launch ${launch.id}`);
              return;
            }

            try {
              let foundCoinType: string | null = null;

              tx.objectChanges?.forEach((change) => {
                if (
                  change.type === "created" &&
                  typeof change.objectType === "string" &&
                  change.objectType.startsWith("0x2::coin::TreasuryCap<")
                ) {
                  foundCoinType = change.objectType.split("<")[1].split(">")[0];
                }
              });

              if (foundCoinType) {
                await prisma.tokenLaunches.update({
                  where: { id: launch.id },
                  data: { coinType: foundCoinType }
                });
                updated.push({ id: launch.id, coinType: foundCoinType });
              }
            } catch (e) {
              console.error(`Failed to update for launch ${launch.id}:`, e);
            }
          })
        );
      } catch (e) {
        console.error(`Failed to fetch transactions for batch ${i / BATCH_SIZE + 1}:`, e);
        // Continue with next batch instead of failing completely
      }
    }

    return Response.json({ 
        "success": true,
        "updated": updated,
        "count": updated.length
     });
  } catch (error: any) {
    return Response.json({ error: error.message || String(error) }, { status: 500 });
  }
}
