import { suiClient } from '@/lib/sui-client';
import { useSignAndExecuteTransaction } from '@mysten/dapp-kit';
import { SuiTransactionBlockResponse } from '@mysten/sui/client';
import type { Transaction } from '@mysten/sui/transactions';
import { useCallback } from 'react';

interface TransactionResult {
    digest: string;
    objectChanges: NonNullable<SuiTransactionBlockResponse['objectChanges']>;
}

export const useTransaction = () => {
    const { mutate: signAndExecute } = useSignAndExecuteTransaction();

    const executeTransaction = useCallback(
        (tx: Transaction) => {
            return new Promise<TransactionResult>(async (resolve, reject) => {
                signAndExecute(
                    { transaction: tx },
                    {
                        onError: (error) => {
                            reject(error);
                        },
                        onSuccess: async ({ digest }) => {
                            try {
                                const res = await suiClient.waitForTransaction({
                                    digest,
                                    options: { showObjectChanges: true }
                                });

                                if (res.objectChanges) {
                                    resolve({
                                        digest,
                                        objectChanges: res.objectChanges
                                    });
                                } else {
                                    reject(new Error('No changes found'));
                                }
                            } catch (error) {
                                console.error(
                                    'An error occured when waiting for transaction',
                                    error
                                );
                                reject(error);
                            }
                        }
                    }
                );
            });
        },
        [signAndExecute]
    );

    return { executeTransaction };
};