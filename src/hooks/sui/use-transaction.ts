import { suiClient } from "@/lib/sui-client";
import { useSignAndExecuteTransaction } from "@mysten/dapp-kit";
import { SuiTransactionBlockResponse, SuiTransactionBlockResponseOptions } from "@mysten/sui/client";
import type { Transaction } from "@mysten/sui/transactions";
import { useCallback } from "react";

interface TransactionResult {
    digest: string;
    objectChanges: NonNullable<SuiTransactionBlockResponse["objectChanges"]>;
    effects?: SuiTransactionBlockResponse["effects"];
    time?: number;
    timestampMs?: string | null;
}

// @TODO: FOR SOME REASON, AFTER EXECUTING TX WE ARENT GETTING SHIT BACK? SO WE STUCK IN LOOP OF TOKEN CREATION...
export const useTransaction = () => {
    const { mutateAsync: signAndExecute } = useSignAndExecuteTransaction();

    const executeTransaction = useCallback(
        async (tx: Transaction, options?: SuiTransactionBlockResponseOptions) => {
            return new Promise<TransactionResult>(async (resolve, reject) => {
                try {
                    const startTime = Date.now();

                    console.log('signing and execute')
                    const result = await signAndExecute({
                        transaction: tx,
                    });

                    try {
                        const txDetails = await suiClient.waitForTransaction({
                            digest: result.digest,
                            options: {
                                showEffects: true,
                                showObjectChanges: true,
                                ...options,
                            },
                        });

                        console.log(`we got tx details: ${txDetails}`)

                        const endTime = Date.now();

                        if (txDetails.objectChanges) {
                            console.log('resolving object with digest and effects now')
                            resolve({
                                digest: txDetails.digest,
                                objectChanges: txDetails.objectChanges,
                                effects: txDetails.effects,
                                timestampMs: txDetails.timestampMs || null,
                                time: txDetails.timestampMs
                                    ? Number(txDetails.timestampMs) - startTime
                                    : endTime - startTime,
                            });
                        } else {
                            reject(new Error("No object changes found in transaction"));
                        }
                    } catch (waitError) {
                        console.error("Error waiting for transaction:", waitError);
                        reject(waitError);
                    }
                } catch (error) {
                    console.error("Error executing transaction:", error);
                    reject(error);
                }
            });
        },
        [signAndExecute]
    );

    return { executeTransaction };
};
