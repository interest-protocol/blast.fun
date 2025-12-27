import { walletSdk } from "@/lib/memez/sdk";
import { Transaction } from "@mysten/sui/transactions";
import type { WalletCoin } from "@/types/blockvision";

export const prepareReceive = (
    tx: Transaction,
    coin: WalletCoin,
    finalCoinId: string,
    memezWalletAddress: string,
    userAddress: string
): void => {
    const { object } = walletSdk.receive({
        tx,
        type: `0x2::coin::Coin<${coin.coinType}>`,
        objectId: finalCoinId,
        wallet: memezWalletAddress,
    });

    tx.transferObjects([object], userAddress);
};