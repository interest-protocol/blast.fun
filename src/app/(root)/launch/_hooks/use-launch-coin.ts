import { useState } from "react";
import { Transaction } from "@mysten/sui/transactions";
import { normalizeSuiAddress } from "@mysten/sui/utils";
import { SUI_TYPE_ARG } from "@mysten/sui/utils";
import toast from "react-hot-toast";
import { CONFIG_KEYS, MIGRATOR_WITNESSES } from '@interest-protocol/memez-fun-sdk';
import { useApp } from "@/context/app.context";
import { useTwitter } from "@/context/twitter.context";
import { useTransaction } from "@/hooks/sui/use-transaction";
import initMoveByteCodeTemplate from '@/lib/move-template/move-bytecode-template';
import { getBytecode } from '@/lib/move-template/coin';
import { TokenFormValues } from "../_components/create-token-form";
import { pumpSdk } from "@/lib/pump";
import { COIN_CONVENTION_BLACKLIST, TARGET_QUOTE_LIQUIDITY, TOTAL_POOL_SUPPLY, VIRTUAL_LIQUIDITY } from "@/constants";
import { HIDE_IDENTITY_SUI_FEE } from "@/constants/fees";
import { env } from "@/env";

export function useLaunchCoin() {
    const [isCreating, setIsCreating] = useState(false);
    const [currentStep, setCurrentStep] = useState<'idle' | 'token' | 'pool' | 'complete'>('idle');
    const { isLoggedIn, user: twitterUser } = useTwitter();
    const { isConnected, address } = useApp();
    const { executeTransaction } = useTransaction();

    const createToken = async (formValues: TokenFormValues) => {
        console.log('we are here')
        if (!isLoggedIn || !isConnected || !address) {
            throw new Error("Please connect your wallet and Twitter account");
        }

        if (
            COIN_CONVENTION_BLACKLIST.includes(formValues.name.toUpperCase().trim()) ||
            COIN_CONVENTION_BLACKLIST.includes(formValues.symbol.toUpperCase().trim())
        ) {
            throw new Error("That would be a great name.");
        }

        console.log('init bytecode template')
        await initMoveByteCodeTemplate('/move_bytecode_template_bg.wasm');

        console.log('creating tx')
        const tx = new Transaction();

        if (formValues.hideIdentity) {
            console.log('adding identity coin split')
            const hideIdentityCoin = tx.splitCoins(tx.gas, [String(HIDE_IDENTITY_SUI_FEE)]);
            tx.transferObjects([hideIdentityCoin], tx.pure.address(env.NEXT_PUBLIC_FEE_ADDRESS));
        }

        const bytecode = await getBytecode(formValues);

        const [upgradeCap] = tx.publish({
            modules: [[...bytecode]],
            dependencies: [normalizeSuiAddress('0x1'), normalizeSuiAddress('0x2')]
        });

        console.log('making immutable call now')
        tx.moveCall({
            target: '0x2::package::make_immutable',
            arguments: [upgradeCap]
        });

        const result = await executeTransaction(tx);
        console.log(result)

        const treasuryCapObject = result.objectChanges.find(
            (change) =>
                change.type === 'created' &&
                change.objectType.startsWith('0x2::coin::TreasuryCap')
        );

        console.log('got treasury cap')
        console.log(treasuryCapObject)

        if (!treasuryCapObject || !('objectId' in treasuryCapObject)) {
            throw new Error('Failed to find treasury cap object in transaction result.');
        }

        console.log('returning now')

        return {
            treasuryCapObject,
            result
        };
    };

    const createPool = async (
        treasuryCapObjectId: string,
        formValues: TokenFormValues
    ) => {
        if (!isLoggedIn || !isConnected || !address) {
            throw new Error("Please connect your wallet and Twitter account");
        }

        if (!pumpSdk) {
            throw new Error("SDK not initialized");
        }

        const configKeys = CONFIG_KEYS[pumpSdk.network as 'mainnet' | 'testnet'];
        const migratorWitnesses = MIGRATOR_WITNESSES[pumpSdk.network as 'mainnet' | 'testnet'];

        const { tx, metadataCap } = await pumpSdk.newPool({
            configurationKey: configKeys.MEMEZ,
            metadata: {
                // todo: something like Creator: twitterUsername || address
                X: formValues.twitter || "",
                Telegram: formValues.telegram || "",
                Website: formValues.website || "",
            },
            memeCoinTreasuryCap: treasuryCapObjectId,
            migrationWitness: migratorWitnesses.TEST,
            totalSupply: TOTAL_POOL_SUPPLY,
            useTokenStandard: false,
            quoteCoinType: SUI_TYPE_ARG,
            burnTax: 0,
            virtualLiquidity: VIRTUAL_LIQUIDITY,
            targetQuoteLiquidity: TARGET_QUOTE_LIQUIDITY,
            liquidityProvision: 0
        });

        tx.transferObjects([metadataCap], tx.pure.address(address));

        let result;
        try {
            result = await executeTransaction(tx);
            console.log(`pool create result: ${result}`);
        } catch (error) {
            console.error("Error executing pool transaction:", error);
            throw error;
        }

        const poolObject = result.objectChanges.find(
            (change) =>
                change.type === 'created' &&
                change.objectType.includes('::memez_pump::Pump')
        );

        return {
            result,
            poolObjectId: poolObject && 'objectId' in poolObject ? poolObject.objectId : null
        };
    };

    const launchToken = async (formValues: TokenFormValues) => {
        setIsCreating(true);

        try {
            setCurrentStep('token');

            console.log('starting token creation')
            const tokenResult = await toast.promise(
                createToken(formValues),
                {
                    loading: 'EXECUTING::TOKEN_CREATION [1/2]',
                    success: 'TOKEN::CREATED_SUCCESSFULLY',
                    error: (err) => {
                        return `ERROR::${(err?.message || 'TOKEN_CREATION_FAILED').toUpperCase().replace(/\./g, '')}`;
                    }
                }
            );

            console.log(tokenResult);

            setCurrentStep('pool');

            console.log('starting pool creation')
            const poolResult = await toast.promise(
                createPool(tokenResult.treasuryCapObject.objectId, formValues),
                {
                    loading: 'EXECUTING::POOL_CREATION [2/2]',
                    success: 'POOL::LAUNCHED_SUCCESSFULLY',
                    error: (err) => {
                        return `ERROR::${(err?.message || 'POOL_CREATION_FAILED').toUpperCase().replace(/\./g, '')}`;
                    }
                }
            );

            console.log(poolResult)

            if (poolResult.poolObjectId) {
                try {
                    await fetch('/api/launches', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            poolObjectId: poolResult.poolObjectId,
                            creatorAddress: address,
                            twitterUserId: twitterUser?.id || null,
                            twitterUsername: twitterUser?.username || null,
                            hideIdentity: formValues.hideIdentity,
                            tokenTxHash: tokenResult.result.digest,
                            poolTxHash: poolResult.result.digest,
                        }),
                    });
                } catch (dbError) {
                    console.warn('Failed to save token launch data:', dbError);
                }
            }

            setCurrentStep('complete');

            return {
                treasuryCapObject: tokenResult.treasuryCapObject,
                tokenResult: tokenResult.result,
                poolResult: poolResult.result,
                poolObjectId: poolResult.poolObjectId
            };
        } catch (error) {
            console.error("Error during launch:", error);
            throw error;
        } finally {
            setIsCreating(false);
            setCurrentStep('idle');
        }
    };

    return {
        isCreating,
        currentStep,
        launchToken,
        createToken,
        createPool
    };
}