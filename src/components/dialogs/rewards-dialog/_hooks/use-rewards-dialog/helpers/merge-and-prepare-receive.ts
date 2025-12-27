import { Transaction } from "@mysten/sui/transactions";
import { SuiClient } from "@mysten/sui/client";
import { walletSdk } from "@/lib/memez/sdk";
import type { WalletCoin } from "@/types/blockvision";
import type { CoinStruct } from "@mysten/sui/client";

const BATCH_SIZE = 500;
const MAX_RETRIES = 3;

export const mergeAndPrepareReceive = async (
  coin: WalletCoin,
  tx: Transaction,
  suiClient: SuiClient,
  memezWalletAddress: string,
  userAddress: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const allCoins: CoinStruct[] = [];
    let cursor: string | null | undefined = undefined;
    let hasNextPage = true;

    while (hasNextPage) {
      let retries = 0;
      let response = null;

      while (retries < MAX_RETRIES) {
        try {
          response = await suiClient.getCoins({
            owner: memezWalletAddress,
            coinType: coin.coinType,
            cursor,
          });
          break;
        } catch (error: any) {
          if (error?.status === 429 || error?.message?.includes("429")) {
            retries++;
            if (retries >= MAX_RETRIES) {
              throw new Error(`Rate limited after ${MAX_RETRIES} retries`);
            }
            const waitTime = Math.pow(2, retries - 1) * 1000;
            await new Promise((resolve) => setTimeout(resolve, waitTime));
          } else {
            throw error;
          }
        }
      }

      if (!response) throw new Error("Failed to fetch coins after retries");

      allCoins.push(...response.data);
      hasNextPage = response.hasNextPage;
      cursor = response.nextCursor;
    }

    if (allCoins.length === 0) {
      return { success: false, error: "No coins found" };
    }

    let finalCoinId = "";

    if (allCoins.length > 1) {
      let remainingCoins = [...allCoins];

      while (remainingCoins.length > 1) {
        const batches: CoinStruct[][] = [];
        for (let i = 0; i < remainingCoins.length; i += BATCH_SIZE) {
          batches.push(remainingCoins.slice(i, Math.min(i + BATCH_SIZE, remainingCoins.length)));
        }

        await Promise.all(
          batches.map(async (batch, index) => {
            const mergeResponse = await fetch("/api/wallet/merge-coins", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                coins: batch.map((c) => ({
                  objectId: c.coinObjectId,
                  version: c.version,
                  digest: c.digest,
                })),
                coinType: coin.coinType,
                walletAddress: memezWalletAddress,
              }),
            });

            if (!mergeResponse.ok) {
              const errorData = await mergeResponse.json();
              throw new Error(errorData.error || `Failed to merge batch ${index + 1}`);
            }

            const mergeData = await mergeResponse.json();
            if (!mergeData.success) {
              throw new Error(mergeData.error || `Merge failed for batch ${index + 1}`);
            }
          })
        );

        await new Promise((resolve) => setTimeout(resolve, 3000));

        // Refetch updated coins
        const updatedCoins: CoinStruct[] = [];
        cursor = undefined;
        hasNextPage = true;

        while (hasNextPage) {
          let retries = 0;
          let response = null;
          while (retries < MAX_RETRIES) {
            try {
              response = await suiClient.getCoins({
                owner: memezWalletAddress,
                coinType: coin.coinType,
                cursor,
              });
              break;
            } catch (error: any) {
              if (error?.status === 429 || error?.message?.includes("429")) {
                retries++;
                if (retries >= MAX_RETRIES) {
                  throw new Error(`Rate limited after ${MAX_RETRIES} retries while fetching updated coins`);
                }
                const waitTime = Math.pow(2, retries - 1) * 1000;
                await new Promise((resolve) => setTimeout(resolve, waitTime));
              } else {
                throw error;
              }
            }
          }
          if (!response) throw new Error("Failed to fetch updated coins after retries");
          updatedCoins.push(...response.data);
          hasNextPage = response.hasNextPage;
          cursor = response.nextCursor;
        }

        remainingCoins = updatedCoins;
        if (remainingCoins.length === 1) {
          finalCoinId = remainingCoins[0].coinObjectId;
          break;
        }
      }
    } else {
      finalCoinId = allCoins[0].coinObjectId;
    }

    if (!finalCoinId) throw new Error("No final coin ID after merge");

    const { object } = walletSdk.receive({
      tx,
      type: `0x2::coin::Coin<${coin.coinType}>`,
      objectId: finalCoinId,
      wallet: memezWalletAddress,
    });

    tx.transferObjects([object], userAddress);

    return { success: true };
  } catch (error) {
    console.error(`Failed to process ${coin.symbol}:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
};