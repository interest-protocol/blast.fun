import { useState } from "react";
import { Transaction } from "@mysten/sui/transactions";
import { normalizeSuiAddress } from "@mysten/sui/utils";
import { SUI_TYPE_ARG } from "@mysten/sui/utils";
import toast from "react-hot-toast";
import { CONFIG_KEYS, MIGRATOR_WITNESSES } from '@interest-protocol/memez-fun-sdk';
import { useWallet } from "@/context/wallet.context";
import { useTwitter } from "@/context/twitter.context";
import { useTransaction } from "@/hooks/sui/use-transaction";
import initMoveByteCodeTemplate from '@/lib/move-template/move-bytecode-template';
import { getBytecode } from '@/lib/move-template/coin';
import { TokenFormValues } from "../_components/create-token-form";
import { pumpSdk } from "@/lib/pump";
import { COIN_CONVENTION_BLACKLIST, TARGET_QUOTE_LIQUIDITY, TOTAL_POOL_SUPPLY, VIRTUAL_LIQUIDITY } from "@/constants";

export function useLaunchCoin() {
    const [isCreating, setIsCreating] = useState(false);
    const [currentStep, setCurrentStep] = useState<'idle' | 'token' | 'pool' | 'complete'>('idle');
    const { isLoggedIn } = useTwitter();
    const { isConnected, address } = useWallet();
    const { executeTransaction } = useTransaction();

    const createToken = async (formValues: TokenFormValues) => {
        if (!isLoggedIn || !isConnected || !address) {
            throw new Error("Please connect your wallet and Twitter account");
        }

        if (
            COIN_CONVENTION_BLACKLIST.includes(formValues.name.toUpperCase().trim()) ||
            COIN_CONVENTION_BLACKLIST.includes(formValues.symbol.toUpperCase().trim())
        ) {
            throw new Error("That would be a great name.");
        }

        await initMoveByteCodeTemplate('/move_bytecode_template_bg.wasm');

        const tx = new Transaction();

        // todo: split identity hide fee if hideIdentity is true from form values.
        // const hideIdentityCoin = tx.splitCoins(tx.gas, [String(HIDE_IDENTITY_SUI_FEE)]);
        // tx.transferObjects([hideIdentityCoin], tx.pure.address(FEE_ADDRESS));

        const bytecode = await getBytecode(formValues);

        const [upgradeCap] = tx.publish({
            modules: [[...bytecode]],
            dependencies: [normalizeSuiAddress('0x1'), normalizeSuiAddress('0x2')]
        });

        tx.moveCall({
            target: '0x2::package::make_immutable',
            arguments: [upgradeCap]
        });

        const result = await executeTransaction(tx);

        const treasuryCapObject = result.objectChanges.find(
            (change) =>
                change.type === 'created' &&
                change.objectType.startsWith('0x2::coin::TreasuryCap')
        );

        if (!treasuryCapObject || !('objectId' in treasuryCapObject)) {
            throw new Error('Failed to find treasury cap object in transaction result.');
        }

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

        const poolResult = await pumpSdk.newPool({
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

        poolResult.tx.transferObjects([poolResult.metadataCap], poolResult.tx.pure.address(address));

        return await executeTransaction(poolResult.tx);
    };

    const launchToken = async (formValues: TokenFormValues) => {
        setIsCreating(true);

        try {
            setCurrentStep('token');

            const tokenResult = await toast.promise(
                createToken(formValues),
                {
                    loading: 'Creating your token... (1/2)',
                    success: 'Token was successfully created!',
                    error: (err) => err.message || 'Failed to create token'
                }
            );

            setCurrentStep('pool');

            const poolResult = await toast.promise(
                createPool(tokenResult.treasuryCapObject.objectId, formValues),
                {
                    loading: 'Launching your pool... (2/2)',
                    success: 'Pool was successfully created!',
                    error: (err) => err.message || 'Failed to launch pool'
                }
            );

            setCurrentStep('complete');

            return {
                treasuryCapObject: tokenResult.treasuryCapObject,
                tokenResult: tokenResult.result,
                poolResult
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