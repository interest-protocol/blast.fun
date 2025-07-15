"use client";

import { useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { TokenFormValues } from "./create-token-form";
import { Button } from "@/components/ui/button";
import initMoveByteCodeTemplate from '@/lib/move-template/move-bytecode-template';
import { useWallet } from "@/context/wallet.context";
import { useTwitter } from "@/context/twitter.context";
import { Transaction } from "@mysten/sui/transactions";
import { HIDE_IDENTITY_SUI_FEE } from "@/constants/fees";
import { FEE_ADDRESS } from "@/constants";
import { getBytecode } from '@/lib/move-template/coin';
import { normalizeSuiAddress } from "@mysten/sui/utils";
import { useTransaction } from "@/hooks/sui/use-transaction";

interface CreateTokenButtonnProps {
    form: UseFormReturn<TokenFormValues>;
}

export default function CreateTokenButton({ form }: CreateTokenButtonnProps) {
    const [isCreating, setIsCreating] = useState(false);
    const { isLoggedIn } = useTwitter();
    const { isConnected, address } = useWallet();
    const { executeTransaction } = useTransaction();

    const createToken = async () => {
        try {
            if (!isLoggedIn || !isConnected || !address) return;

            // todo: add blacklist name/symbol conditional

            await initMoveByteCodeTemplate('/move_bytecode_template_bg.wasm');

            const tx = new Transaction();

            // todo: split identity hide fee if hideIdentity is true from our form values.
            // const hideIdentityCoin = tx.splitCoins(tx.gas, [String(HIDE_IDENTITY_SUI_FEE)]);
            // tx.transferObjects([hideIdentityCoin], tx.pure.address(FEE_ADDRESS));

            const bytecode = await getBytecode(form.getValues());

            const [upgradeCap] = tx.publish({
                modules: [[...bytecode]],
                dependencies: [normalizeSuiAddress('0x1'), normalizeSuiAddress('0x2')]
            });

            tx.transferObjects([upgradeCap], tx.pure.address(address));

            await executeTransaction(tx);
        } finally {
            form.reset();
        }
    }

    const onSubmit = async (data: TokenFormValues) => {
        const createToast = toast.loading('Creating your token...');
        setIsCreating(true);

        try {
            await createToken();
            // form.reset();
        } catch (error) {
            console.error("Error creating token:", error);
            toast.error((error as Error).message || 'Something went wrong, try again.');
        } finally {
            setIsCreating(false);
            toast.dismiss(createToast)
        }
    };

    return (
        <Button
            type="submit"
            className="w-full"
            disabled={isCreating || !form.formState.isValid}
            onClick={form.handleSubmit(onSubmit)}
        >
            {isCreating ? (
                <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Token...
                </>
            ) : (
                "Create Token"
            )}
        </Button>
    );
}